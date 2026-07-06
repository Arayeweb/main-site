// =========================================================
// Multiplexer — چند AsyncIterable مدل را به یک stream واحد ادغام می‌کند.
// هر event با شناسه مدل tag می‌شود؛ deltaها به محض رسیدن ارسال می‌شوند
// (بدون انتظار برای تمام شدن مدل‌های دیگر).
// =========================================================

import type { ModelStreamEvent } from "@/lib/ai/providers/interface";

export type TaggedModelEvent = {
  model: string;
  event: ModelStreamEvent;
};

type Source = {
  model: string;
  iterator: AsyncIterator<ModelStreamEvent>;
};

/**
 * چند stream مدل را همزمان مصرف می‌کند و eventها را به ترتیب رسیدن
 * yield می‌کند. اگر یک مدل fail شود بقیه ادامه می‌دهند.
 */
export async function* multiplex(
  streams: Array<[model: string, iterable: AsyncIterable<ModelStreamEvent>]>
): AsyncGenerator<TaggedModelEvent> {
  const sources: Source[] = streams.map(([model, iterable]) => ({
    model,
    iterator: iterable[Symbol.asyncIterator](),
  }));

  // برای هر source یک promise معلق نگه می‌داریم و با race اولین نتیجه را می‌گیریم
  type Pending = {
    source: Source;
    promise: Promise<{ source: Source; result: IteratorResult<ModelStreamEvent> }>;
  };

  const makePending = (source: Source): Pending => ({
    source,
    promise: source.iterator
      .next()
      .then((result) => ({ source, result }))
      .catch((err) => ({
        source,
        result: {
          done: false,
          value: {
            type: "error" as const,
            errorCode: "provider_error" as const,
            message: err instanceof Error ? err.message : String(err),
          },
        },
      })),
  });

  let pending: Pending[] = sources.map(makePending);
  const errored = new Set<Source>();

  try {
    while (pending.length > 0) {
      const { source, result } = await Promise.race(pending.map((p) => p.promise));

      if (result.done || errored.has(source)) {
        pending = pending.filter((p) => p.source !== source);
        continue;
      }

      yield { model: source.model, event: result.value };

      if (result.value.type === "error") {
        // بعد از error این stream تمام‌شده تلقی می‌شود
        errored.add(source);
        pending = pending.filter((p) => p.source !== source);
        continue;
      }

      pending = pending.filter((p) => p.source !== source);
      pending.push(makePending(source));
    }
  } finally {
    // همه child iteratorها را ببند — نه فقط pending — تا provider stream ادامه ندهد.
    await Promise.allSettled(
      sources.map(async (source) => {
        try {
          await source.iterator.return?.();
        } catch {
          /* cleanup best-effort */
        }
      })
    );
  }
}
