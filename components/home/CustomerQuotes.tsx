const quotes = [
  {
    name: "امداد آهن",
    text: "ثبت در گوگل را انجام دادند؛ از نتیجه راضی هستیم.",
  },
  {
    name: "مدیسا قاضی",
    text: "معمار هستم — سایت را خیلی سریع تحویل دادند و راضی بودم.",
  },
  {
    name: "پروین هاشمی",
    text: "مشاوره‌شان دقیق بود و همیشه به‌موقع پاسخ می‌دادند.",
  },
] as const;

export default function CustomerQuotes() {
  return (
    <div aria-label="نظر مشتریان" className="mt-10 border-t border-navy-100/80 pt-8 sm:mt-12 sm:pt-9">
      <p className="text-center text-[11px] font-semibold text-navy-400 sm:text-xs">
        مشتریان ما چه می‌گویند
      </p>
      <ul className="mt-4 grid gap-4 sm:mt-5 sm:grid-cols-3 sm:gap-5">
        {quotes.map((item) => (
          <li key={item.name} className="text-center">
            <p className="text-[11px] font-bold text-navy-700 sm:text-xs">{item.name}</p>
            <p className="mt-1 text-[10px] leading-relaxed text-navy-400 sm:text-[11px]">
              {item.text}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
