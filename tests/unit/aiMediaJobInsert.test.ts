import { describe, it, expect, vi } from "vitest";
import { insertMediaJob } from "@/lib/aiMediaJobInsert";

function mockSupabase(results: Array<{ data: unknown; error: unknown }>) {
  let call = 0;
  const from = vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(async () => results[call++] ?? results[results.length - 1]),
      })),
    })),
  }));
  return { from } as unknown as Parameters<typeof insertMediaJob>[0];
}

describe("insertMediaJob", () => {
  it("retries without reference_url when column is missing", async () => {
    const supabase = mockSupabase([
      { data: null, error: { code: "PGRST204", message: "reference_url missing" } },
      { data: { id: "job-1" }, error: null },
    ]);

    const row = {
      user_id: "u1",
      kind: "image",
      model_id: "image-lite",
      prompt: "cat",
      reference_url: "https://cdn.example.com/ref.png",
    };

    const { data, error } = await insertMediaJob(supabase, row);

    expect(error).toBeNull();
    expect(data?.id).toBe("job-1");
    expect(supabase.from).toHaveBeenCalledTimes(2);
    const secondInsert = (supabase.from as ReturnType<typeof vi.fn>).mock.results[1]
      .value.insert as ReturnType<typeof vi.fn>;
    expect(secondInsert.mock.calls[0][0]).not.toHaveProperty("reference_url");
  });

  it("returns first result when insert succeeds", async () => {
    const supabase = mockSupabase([{ data: { id: "job-2" }, error: null }]);
    const { data } = await insertMediaJob(supabase, {
      user_id: "u1",
      kind: "image",
      model_id: "image-lite",
      prompt: "dog",
    });
    expect(data?.id).toBe("job-2");
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });
});
