/**
 * Lightweight in-memory Supabase mock for integration tests.
 * Supports select/insert/update with eq/maybeSingle/single chains.
 */

type Row = Record<string, unknown>;

export class InMemorySupabase {
  tables: Record<string, Row[]>;

  constructor(initial: Record<string, Row[]> = {}) {
    this.tables = structuredClone(initial);
  }

  reset(initial: Record<string, Row[]> = {}) {
    this.tables = structuredClone(initial);
  }

  from(table: string) {
    return new QueryBuilder(this, table);
  }

  storage = {
    from: (_bucket: string) => ({
      upload: async (path: string, _buffer: Buffer, _opts?: unknown) => ({
        data: { path },
        error: null,
      }),
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://test.storage.example/${path}` },
      }),
    }),
  };
}

type FilterOp = "eq" | "or" | "in" | "is" | "json_eq" | "gte";

class QueryBuilder {
  private filters: Array<{ col: string; val: unknown; op: FilterOp; jsonOp?: string }> = [];
  private orderCol: string | null = null;
  private orderAsc = true;
  private limitN: number | null = null;
  private rangeFrom: number | null = null;
  private rangeTo: number | null = null;
  private pendingInsert: Row | Row[] | null = null;
  private pendingUpdate: Row | null = null;
  private pendingUpsert: Row | null = null;
  private upsertConflictCols: string[] = [];
  private op: "select" | "insert" | "update" | "upsert" = "select";
  private postInsertSelect = false;

  constructor(
    private db: InMemorySupabase,
    private table: string
  ) {}

  select(_cols?: string) {
    if (this.op === "insert") {
      this.postInsertSelect = true;
      return this;
    }
    return this;
  }

  insert(data: Row | Row[]) {
    this.op = "insert";
    this.pendingInsert = data;
    return this;
  }

  update(data: Row) {
    this.op = "update";
    this.pendingUpdate = data;
    return this;
  }

  upsert(data: Row, opts?: { onConflict?: string }) {
    this.op = "upsert";
    this.pendingUpsert = data;
    this.upsertConflictCols =
      opts?.onConflict?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
    return this;
  }

  eq(col: string, val: unknown) {
    this.filters.push({ col, val, op: "eq" });
    return this;
  }

  gte(col: string, val: unknown) {
    this.filters.push({ col, val, op: "gte" });
    return this;
  }

  in(col: string, vals: unknown[]) {
    this.filters.push({ col, val: vals, op: "in" });
    return this;
  }

  is(col: string, val: null) {
    this.filters.push({ col, val, op: "is" });
    return this;
  }

  or(_expr: string) {
    this.filters.push({ col: "_or", val: _expr, op: "or" });
    return this;
  }

  filter(col: string, op: string, val: unknown) {
    this.filters.push({ col, val, op: "json_eq", jsonOp: op });
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    this.orderCol = col;
    this.orderAsc = opts?.ascending !== false;
    return this;
  }

  limit(n: number) {
    this.limitN = n;
    return this;
  }

  range(from: number, to: number) {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }

  private rows(): Row[] {
    if (!this.db.tables[this.table]) this.db.tables[this.table] = [];
    return this.db.tables[this.table];
  }

  private match(row: Row): boolean {
    return this.filters.every((f) => {
      if (f.op === "or") return true;
      if (f.op === "json_eq") {
        const jsonOp = f.jsonOp ?? "eq";
        const parts = f.col.split("->>");
        const parent = parts[0];
        const key = parts[1]?.replace(/'/g, "") ?? "";
        const meta = row[parent] as Record<string, unknown> | undefined;
        const actual = meta?.[key];
        if (jsonOp === "eq") return String(actual) === String(f.val);
        return false;
      }
      if (f.op === "in") {
        const vals = f.val as unknown[];
        return vals.includes(row[f.col]);
      }
      if (f.op === "is") {
        return row[f.col] == null;
      }
      if (f.op === "gte") {
        return new Date(String(row[f.col])).getTime() >= new Date(String(f.val)).getTime();
      }
      return row[f.col] === f.val;
    });
  }

  private applySort(list: Row[]): Row[] {
    if (!this.orderCol) return list;
    return [...list].sort((a, b) => {
      const av = a[this.orderCol!];
      const bv = b[this.orderCol!];
      const cmp = String(av).localeCompare(String(bv));
      return this.orderAsc ? cmp : -cmp;
    });
  }

  private slice(list: Row[]): Row[] {
    let out = list;
    if (this.rangeFrom !== null && this.rangeTo !== null) {
      out = out.slice(this.rangeFrom, this.rangeTo + 1);
    } else if (this.limitN !== null) {
      out = out.slice(0, this.limitN);
    }
    return out;
  }

  private doInsert(): Row[] {
    const items = Array.isArray(this.pendingInsert)
      ? this.pendingInsert
      : [this.pendingInsert!];
    const inserted: Row[] = items.map((item) => {
      const row = {
        id: item.id ?? crypto.randomUUID(),
        created_at: item.created_at ?? new Date().toISOString(),
        plan: "free",
        credits: 5,
        ...item,
      };
      this.rows().push(row);
      return row;
    });
    return inserted;
  }

  async maybeSingle() {
    if (this.op === "update") {
      const result = await this.execute();
      const rows = Array.isArray(result.data) ? result.data : [];
      return { data: rows[0] ?? null, error: null };
    }
    const data = await this.runSelect();
    return { data: data[0] ?? null, error: null };
  }

  async single() {
    if (this.op === "insert") {
      const inserted = this.doInsert();
      if (inserted.length !== 1) {
        return { data: null, error: { message: "not found" } };
      }
      return { data: inserted[0], error: null };
    }

    if (this.op === "update") {
      const result = await this.execute();
      const rows = Array.isArray(result.data) ? result.data : [];
      if (rows.length !== 1) {
        return { data: null, error: { message: "not found" } };
      }
      return { data: rows[0], error: null };
    }

    const data = await this.runSelect();
    if (data.length !== 1) {
      return { data: null, error: { message: "not found" } };
    }
    return { data: data[0], error: null };
  }

  then(resolve: (v: unknown) => void, reject?: (e: unknown) => void) {
    return this.execute().then(resolve, reject);
  }

  private async runSelect(): Promise<Row[]> {
    let list = this.rows().filter((r) => this.match(r));
    list = this.applySort(list);
    list = this.slice(list);
    return list;
  }

  private findUpsertRow(data: Row): Row | null {
    if (this.upsertConflictCols.length === 0) return null;
    return (
      this.rows().find((row) =>
        this.upsertConflictCols.every((col) => row[col] === data[col])
      ) ?? null
    );
  }

  private async execute(): Promise<{ data: Row | Row[] | null; error: null | { message: string } }> {
    if (this.op === "upsert") {
      const data = this.pendingUpsert!;
      const existing = this.findUpsertRow(data);
      if (existing) {
        Object.assign(existing, data);
        return { data: existing, error: null };
      }
      const row = {
        id: data.id ?? crypto.randomUUID(),
        created_at: data.created_at ?? new Date().toISOString(),
        plan: "free",
        credits: 5,
        ...data,
      };
      this.rows().push(row);
      return { data: row, error: null };
    }

    if (this.op === "insert") {
      const inserted = this.doInsert();
      if (this.postInsertSelect) {
        return { data: inserted, error: null };
      }
      return { data: inserted.length === 1 ? inserted[0] : inserted, error: null };
    }

    if (this.op === "update") {
      const updated: Row[] = [];
      for (const row of this.rows()) {
        if (this.match(row)) {
          Object.assign(row, this.pendingUpdate);
          updated.push(row);
        }
      }
      return { data: updated, error: null };
    }

    const data = await this.runSelect();
    return { data, error: null };
  }
}

export function createTestSupabase(initial: Record<string, Row[]> = {}) {
  return new InMemorySupabase(initial);
}
