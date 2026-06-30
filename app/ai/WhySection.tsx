"use client";

import {
  AgentAvatar,
  ModeratorOrb,
  IconBolt,
  IconSpark,
  IconSeal,
  IconExec,
  IconRisk,
  IconTarget,
  IconDoc,
} from "./icons";
import type { AgentKey } from "./icons";

/* ── The council members (maps to brainstorm-mode agents) ── */
const COUNCIL: { agent: AgentKey; role: string }[] = [
  { agent: "logical_analyst", role: "بر پایه‌ی داده و منطق تحلیل می‌کند" },
  { agent: "exec_advisor",    role: "به اجرا و واقعیت بازار فکر می‌کند" },
  { agent: "risk_critic",     role: "ریسک‌ها و نقاط ضعف را پیدا می‌کند" },
  { agent: "creative",        role: "زاویه‌ی تازه و راه‌حل خلاق می‌آورد" },
];

/* ── Sample deliberation (the M&A question) ── */
const DEBATE: { agent: AgentKey; tag: string; text: string }[] = [
  {
    agent: "exec_advisor",
    tag: "مشاور اجرایی",
    text: "خرید محصولی که بزرگ‌ترین خلأ شما را پر می‌کند، ارزان‌تر از ساختنش است — ۱۸ ماه تحقیق و توسعه را رد می‌کنی. سه برابر درآمد، ضریب منصفانه‌ای است، نه گران. قبل از اینکه قیمتشان دو برابر شود، معامله را ببند.",
  },
  {
    agent: "risk_critic",
    tag: "منتقد ریسک",
    text: "هر چیز ارزان، دلیلی برای ارزان‌بودن دارد. «فرهنگ مهندسی متفاوت» یعنی ادغام جهنمی خواهد بود. نیمی از تیمشان دورکارند و تیم تو نه — تا یک سال، ۳۰ تا ۴۰ درصد مهندس‌هایشان را از دست می‌دهی. تو محصول نمی‌خری، یک بازنویسی می‌خری.",
  },
  {
    agent: "logical_analyst",
    tag: "تحلیل‌گر منطقی",
    text: "تضاد فرهنگی واقعی است اما قابل‌مدیریت — اگر ۱۲ ماه اول آن‌ها را به‌صورت واحد جدا نگه داری. روز اول کدها را ادغام نکن؛ در لایه‌ی API وصل کن و بگذار فرهنگ دورکاری‌شان دست‌نخورده بماند.",
  },
];

const STEPS: {
  n: string;
  title: string;
  body: string;
}[] = [
  {
    n: "۱",
    title: "سؤال تو",
    body: "یک سؤال یا مسئله می‌نویسی — از یک تصمیم سرمایه‌گذاری تا یک انتخاب استراتژیک یا یک معمای کسب‌وکار.",
  },
  {
    n: "۲",
    title: "بحث مدل‌ها",
    body: "چند مدل به‌نوبت پاسخ می‌دهند. هرکدام حرف قبلی‌ها را می‌بیند — به چالش می‌کشد، گسترش می‌دهد و بازقاب‌بندی می‌کند.",
  },
  {
    n: "۳",
    title: "پاسخ نهایی",
    body: "یک هماهنگ‌کننده کل بحث را می‌خواند و آن را به یک پاسخ منسجم تبدیل می‌کند؛ با بهترین استدلال‌های همه‌ی طرف‌ها.",
  },
];

const USE_CASES: {
  Icon: typeof IconBolt;
  title: string;
  body: string;
}[] = [
  {
    Icon: IconExec,
    title: "کسب‌وکار و استراتژی",
    body: "ورود به بازار، قیمت‌گذاری، تحلیل رقبا — بحث ساختاریافته برای تصمیم‌هایی که مسیر کارت را می‌سازند.",
  },
  {
    Icon: IconTarget,
    title: "بازاریابی و فروش",
    body: "انتخاب کانال، پیام برند، استراتژی تبلیغات — چند دیدگاه رقیب روی همان بودجه و همان مخاطب.",
  },
  {
    Icon: IconDoc,
    title: "مالی و سرمایه‌گذاری",
    body: "ارزیابی فرصت، سنجش ریسک، تحلیل سناریوها — دیدگاه‌های متضاد درباره‌ی بازده و سمت ضرر.",
  },
  {
    Icon: IconRisk,
    title: "تصمیم‌های سخت",
    body: "هر جا انتخابی هست که اشتباهش گران تمام می‌شود — قبل از اینکه قطعی شود، نتیجه‌ات را به چالش بکش.",
  },
];

export default function WhySection({
  onStart,
}: {
  onStart: () => void;
}) {
  return (
    <section id="why" className="ai-why">
      {/* ── Hook ── */}
      <div className="ai-why-hero">
        <div className="ai-container-wide">
          <span className="ai-why-eyebrow">چرا آرایه AI؟</span>
          <h2 className="ai-why-h1">
            هیئت مشاوران <span>هوش مصنوعی</span> تو
          </h2>
          <p className="ai-why-lead">
            هر تصمیم مهم در کسب‌وکار را یک گروه از مشاوران می‌گیرند، نه یک
            نفر. هیئت‌مدیره، شورای متخصصان، پنل کارشناسان. هرکدام از یک زاویه
            نگاه می‌کند، فرض‌های بقیه را به چالش می‌کشد و به نتیجه‌ای قوی‌تر
            می‌رساند. آرایه همین اصل را به هوش مصنوعی می‌آورد: به‌جای پرسیدن از
            یک مدل و امید به بهترین، شورایی از مدل‌ها را جمع می‌کند که بحث
            می‌کنند، به چالش می‌کشند و روی استدلال هم می‌سازند — و بعد یک پاسخ
            یکپارچه می‌دهند.
          </p>
        </div>
      </div>

      {/* ── Council members ── */}
      <div className="ai-container-wide">
        <div className="ai-why-council">
          {COUNCIL.map((c) => (
            <div key={c.agent} className="ai-why-member">
              <AgentAvatar agent={c.agent} size={46} />
              <div className="ai-why-member-name">
                {labelFor(c.agent)}
              </div>
              <div className="ai-why-member-role">{c.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── The problem ── */}
      <div className="ai-container-wide">
        <div className="ai-why-block">
          <span className="ai-why-tag">مسئله</span>
          <h3 className="ai-why-h2">مشکلِ تک‌مدلی</h3>
          <p className="ai-why-p">
            وقتی سؤالت را از یک هوش مصنوعی می‌پرسی، یک دیدگاه می‌گیری. آن دیدگاه
            ممکن است درخشان باشد — یا نقطه‌کور داشته باشد. و راهی برای فهمیدنش
            نیست، چون کسی نیست که به چالشش بکشد.
          </p>
          <p className="ai-why-p">
            هر مدل زبانی سوگیری‌های سیستماتیک دارد که داده‌ی آموزش و فرایند
            هم‌ترازی‌اش شکل داده. یکی بیش‌ازحد محتاط است، دیگری ظرافت‌های مقررات
            را از قلم می‌اندازد؛ یکی در تحلیل کمّی عالی است اما عامل انسانی را
            کم می‌بیند. تو هیچ‌وقت یک تصمیم بزرگ را با مشورت تک‌نفره نمی‌گیری —
            چرا با هوش مصنوعی این کار را بکنی؟
          </p>
          <p className="ai-why-callout">
            مشکل این نیست که یک مدل بد است — مشکل این است که برای تصمیم‌های مهم،
            به یک نقطه‌ی شکست واحد تکیه کرده‌ای.
          </p>
        </div>
      </div>

      {/* ── The insight + steps ── */}
      <div className="ai-container-wide">
        <div className="ai-why-block">
          <span className="ai-why-tag">ایده</span>
          <h3 className="ai-why-h2">اگر بتوانند با هم بحث کنند؟</h3>
          <p className="ai-why-p">
            آرایه یک هم‌اندیشی چندمدلیِ زنجیره‌ای را اجرا می‌کند. وقتی سؤالی
            می‌پرسی، فقط به یک مدل نمی‌رود؛ به شورایی از مدل‌ها می‌رود. هر مدل
            به‌نوبت پاسخ می‌دهد، اما مهم این است که هرکدام حرف قبلی‌ها را
            می‌بیند. این تولید موازی نیست — یک بحثِ ساختاریافته است. در پایان،
            یک هماهنگ‌کننده کل بحث را می‌خواند و یک جمع‌بندی نهایی می‌سازد که هیچ
            مدلی به‌تنهایی نمی‌توانست تولید کند.
          </p>
        </div>

        <div className="ai-why-steps">
          {STEPS.map((s) => (
            <div key={s.n} className="ai-why-step">
              <div className="ai-why-step-n">{s.n}</div>
              <div className="ai-why-step-title">{s.title}</div>
              <div className="ai-why-step-body">{s.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Demo / sample debate ── */}
      <div className="ai-container-wide">
        <div className="ai-why-block">
          <span className="ai-why-tag">نمونه</span>
          <h3 className="ai-why-h2">یک بحث واقعی</h3>
          <p className="ai-why-p">
            یک شورای آرایه دقیقاً همین شکلی است. چند مدل، یک سؤال، یک هم‌اندیشی
            ساختاریافته که به پاسخی بهتر از هر مدل تنها می‌رسد.
          </p>
        </div>

        <div className="ai-why-debate">
          <div className="ai-why-debate-q">
            <span className="ai-why-debate-q-label">سؤال</span>
            نزدیک‌ترین رقیب ما با محصولی که بزرگ‌ترین خلأ ما را پر می‌کند، ۵
            میلیون دلار درآمد دارد و حاضر است با ضریب سه برابرِ درآمد بفروشد —
            اما فرهنگ مهندسی‌شان خیلی فرق دارد و نیمی از تیمشان دورکارند.
            رقیبمان را بخریم؟
          </div>

          {DEBATE.map((d, i) => (
            <div key={i} className="ai-why-debate-turn">
              <AgentAvatar agent={d.agent} size={34} />
              <div className="ai-why-debate-body">
                <div className="ai-why-debate-tag">{d.tag}</div>
                <p>{d.text}</p>
              </div>
            </div>
          ))}

          <div className="ai-why-debate-verdict">
            <ModeratorOrb size={28} />
            <div className="ai-why-debate-body">
              <div className="ai-why-debate-tag">جمع‌بندی شورا</div>
              <p>
                بخرید — اما با شرط. ضریب منصفانه است و ساختنش گران‌تر؛ ریسک
                اصلی، ادغام است نه قیمت. ۱۲ ماه اول به‌صورت واحد جدا نگه دارید،
                در لایه‌ی API وصل کنید و فرهنگ دورکاری‌شان را دست‌نخورده
                بگذارید.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROI ── */}
      <div className="ai-container-wide">
        <div className="ai-why-block">
          <span className="ai-why-tag">ارزش</span>
          <h3 className="ai-why-h2">چرا ارزشش را دارد</h3>
          <p className="ai-why-p">
            هم‌اندیشی چندمدلی توکن بیشتری مصرف می‌کند. اما این در برابر هزینه‌ی
            یک تصمیم اشتباه، ناچیز است.
          </p>
        </div>

        <div className="ai-why-stats">
          <div className="ai-why-stat">
            <div className="ai-why-stat-num">یک قهوه</div>
            <div className="ai-why-stat-label">
              هزینه‌ی هر شورا. یک هیئت مشاوران به قیمت یک فنجان قهوه — در برابر
              یک استخدام اشتباه یا یک تصمیم استراتژیک غلط.
            </div>
          </div>
          <div className="ai-why-stat">
            <div className="ai-why-stat-num">دقت بیشتر</div>
            <div className="ai-why-stat-label">
              پژوهش‌های منتشرشده نشان می‌دهند بحث چندمدلی پاسخ‌ها را به‌طور
              معناداری دقیق‌تر می‌کند؛ مدل‌ها خطای هم را می‌گیرند و اصلاح می‌کنند.
            </div>
          </div>
          <div className="ai-why-stat">
            <div className="ai-why-stat-num">دیدگاه چندگانه</div>
            <div className="ai-why-stat-label">
              چیزی که یک شرکت مشاوره ساعتی میلیون‌ها برایش می‌گیرد — چند دیدگاه
              کارشناسی، بحث ساختاریافته و یک پیشنهاد جمع‌بندی‌شده.
            </div>
          </div>
        </div>
      </div>

      {/* ── Use cases ── */}
      <div className="ai-container-wide">
        <div className="ai-why-block">
          <span className="ai-why-tag">کاربردها</span>
          <h3 className="ai-why-h2">برای کسانی که تصمیم می‌گیرند</h3>
          <p className="ai-why-p">
            چه در حال ارزیابی یک معامله باشی، چه بازنگری یک قرارداد یا عبور از
            یک انتخاب پیچیده — نظر دوم (و سوم و چهارم) نتیجه را عوض می‌کند.
          </p>
        </div>

        <div className="ai-why-cases">
          {USE_CASES.map((u) => {
            const Icon = u.Icon;
            return (
              <div key={u.title} className="ai-why-case">
                <span className="ai-why-case-ic">
                  <Icon size={20} />
                </span>
                <div className="ai-why-case-title">{u.title}</div>
                <div className="ai-why-case-body">{u.body}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Final CTA ── */}
      <div className="ai-container-wide">
        <div className="ai-why-cta">
          <ModeratorOrb size={48} />
          <h3 className="ai-why-cta-title">
            اولین بحثت را شروع کن
          </h3>
          <p className="ai-why-cta-sub">
            هر سؤالی بپرس. تماشا کن مشاوران هوش مصنوعی هم‌اندیشی کنند. پاسخی
            بهتر بگیر.
          </p>
          <div className="ai-why-cta-actions">
            <button className="ai-btn ai-btn-primary" onClick={onStart}>
              <IconSpark size={16} /> شروع رایگان
            </button>
          </div>
          <p className="ai-why-cta-fine">۵ سؤال رایگان · بدون کارت بانکی</p>
        </div>
      </div>
    </section>
  );
}

const LABELS: Record<string, string> = {
  logical_analyst: "تحلیل‌گر منطقی",
  exec_advisor: "مشاور اجرایی",
  risk_critic: "منتقد ریسک",
  creative: "متفکر خلاق",
};
function labelFor(a: AgentKey) {
  return LABELS[a] ?? "";
}
