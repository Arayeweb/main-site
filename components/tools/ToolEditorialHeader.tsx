export default function ToolEditorialHeader({
  index,
  kicker,
  title,
  subtitle,
}: {
  index: string;
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="grid gap-4 border-b border-navy-300 pb-6 sm:grid-cols-[96px_1fr] sm:items-end">
      <div>
        <span className="tool-index">{index}</span>
        <p className="mt-2 text-[10px] font-extrabold tracking-[0.12em] text-navy-400">
          {kicker}
        </p>
      </div>
      <div>
        <h2 className="text-2xl font-extrabold leading-tight text-navy-950 sm:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm leading-7 text-navy-500">{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
}
