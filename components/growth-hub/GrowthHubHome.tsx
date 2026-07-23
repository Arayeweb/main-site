"use client";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BarChart3,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronsUpDown,
  CircleDot,
  Clock3,
  FileText,
  FolderOpen,
  Home,
  Lightbulb,
  MessageSquareText,
  ReceiptText,
  RefreshCw,
  Target,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type {
  ActionFixture,
  ActivityFixture,
  BillingFixture,
  GrowthHubHomeFixture,
  MetricFixture,
  OpportunityFixture,
  ReportFixture,
  ServiceFixture,
  StatusTone,
} from "@/lib/growth-hub/fixtures/home";
import { growthHubScenarioOptions } from "@/lib/growth-hub/fixtures/home";
import styles from "./growth-hub.module.css";
import "./theme/portal-tokens.css";

const navItems = [
  { label: "خانه", icon: Home, active: true },
  { label: "خدمات", icon: BriefcaseBusiness },
  { label: "درخواست‌ها", icon: MessageSquareText },
  { label: "گزارش‌ها", icon: FileText },
  { label: "فایل‌ها و مالی", icon: FolderOpen },
];

function toneClass(tone: StatusTone): string {
  return {
    healthy: styles.toneHealthy,
    attention: styles.toneAttention,
    progress: styles.toneProgress,
    complete: styles.toneComplete,
  }[tone];
}

function formatFaNumber(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value);
}

export function ScenarioSelector({
  activeScenario,
}: {
  activeScenario: string;
}) {
  const router = useRouter();

  return (
    <div className={styles.prototypeBar} aria-label="کنترل سناریوی نمایشی">
      <span className={styles.prototypeLabel}>نمایشی</span>
      <label>
        <span className="sr-only">انتخاب سناریوی نمایشی</span>
        <select
          className={styles.scenarioSelect}
          value={activeScenario}
          onChange={(event) =>
            router.push(`/dev/growth-hub?scenario=${event.target.value}`)
          }
        >
          {growthHubScenarioOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function PortalSidebar({
  workspace,
}: {
  workspace: GrowthHubHomeFixture["workspace"];
}) {
  return (
    <aside className={styles.sidebar} aria-label="ناوبری مرکز رشد">
      <div className={styles.brand}>
        <img
          className={styles.brandMark}
          src="/assets/logo-icon.svg"
          alt=""
          width={38}
          height={38}
        />
        <div>
          <p className={styles.brandTitle}>مرکز رشد آرایه</p>
          <p className={styles.brandSubtitle}>پنل مشتریان آرایه</p>
        </div>
      </div>

      <div className={styles.workspaceIdentity}>
        <button className={styles.workspaceButton} type="button">
          <span className={styles.workspaceAvatar} aria-hidden="true">
            {workspace.initials}
          </span>
          <span className={styles.workspaceText}>
            <span className={styles.workspaceLabel}>فضای کاری</span>
            <span className={styles.workspaceName}>{workspace.name}</span>
          </span>
          <ChevronsUpDown size={15} aria-hidden="true" />
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map(({ label, icon: Icon, active }) => (
          <a
            className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
            href="#main-content"
            key={label}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <p className={styles.userName}>{workspace.userName}</p>
        <p className={styles.userRole}>مالک فضای کاری</p>
      </div>
    </aside>
  );
}

export function MobileNavigation() {
  return (
    <nav className={styles.mobileNav} aria-label="ناوبری موبایل">
      {navItems.map(({ label, icon: Icon, active }) => (
        <a
          className={`${styles.mobileNavItem} ${
            active ? styles.mobileNavActive : ""
          }`}
          href="#main-content"
          key={label}
          aria-current={active ? "page" : undefined}
        >
          <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}

export function PortalShell({
  fixture,
  children,
}: {
  fixture: GrowthHubHomeFixture;
  children: React.ReactNode;
}) {
  return (
    <div className={`gh-root ${styles.shell}`}>
      <PortalSidebar workspace={fixture.workspace} />
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.mobileWorkspace}>
            <span className={styles.workspaceAvatar} aria-hidden="true">
              {fixture.workspace.initials}
            </span>
            <span className={styles.mobileWorkspaceName}>
              {fixture.workspace.name}
            </span>
          </div>
          {process.env.NODE_ENV !== "production" ? (
            <ScenarioSelector activeScenario={fixture.key} />
          ) : null}
        </header>
        <main className={styles.content} id="main-content">
          {children}
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}

export function PageHeader({
  page,
}: {
  page: GrowthHubHomeFixture["page"];
}) {
  return (
    <header className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{page.title}</h1>
        <div className={styles.pageMeta}>
          <p className={styles.pageDescription}>{page.description}</p>
          <span className={styles.metaDivider} aria-hidden="true" />
          <span className={styles.updatedAt}>
            <Clock3 size={13} aria-hidden="true" />
            {page.updatedAt}
          </span>
        </div>
      </div>
    </header>
  );
}

export function BusinessStatusPanel({
  status,
}: {
  status: GrowthHubHomeFixture["status"];
}) {
  return (
    <section
      className={`${styles.statusPanel} ${toneClass(status.tone)}`}
      aria-labelledby="business-status-title"
    >
      <div className={styles.statusLabel}>
        <span className={styles.statusDot} aria-hidden="true" />
        {status.label}
      </div>
      <h2 className={styles.statusTitle} id="business-status-title">
        {status.title}
      </h2>
      <p className={styles.statusDescription}>{status.description}</p>
    </section>
  );
}

export function CustomerActionItem({
  action,
  prominent = false,
}: {
  action: ActionFixture;
  prominent?: boolean;
}) {
  if (prominent) {
    return (
      <a className={styles.primaryAction} href="#customer-actions">
        <span className={styles.primaryActionLabel}>
          <Target size={16} aria-hidden="true" />
          اقدام بعدی شما
        </span>
        <h2 className={styles.primaryActionTitle}>{action.title}</h2>
        <p className={styles.primaryActionDetail}>{action.detail}</p>
        <span className={styles.primaryActionFooter}>
          <span>{action.dueLabel}</span>
          <span className={styles.actionLinkText}>
            انجام اقدام
            <ArrowLeft size={15} aria-hidden="true" />
          </span>
        </span>
      </a>
    );
  }

  return (
    <div className={styles.pendingItem}>
      <Upload
        className={styles.smallActionIcon}
        size={20}
        aria-hidden="true"
      />
      <div>
        <h3 className={styles.itemTitle}>{action.title}</h3>
        <p className={styles.itemDetail}>{action.detail}</p>
        {action.dueLabel ? (
          <span className={styles.itemMeta}>{action.dueLabel}</span>
        ) : null}
      </div>
    </div>
  );
}

export function MetricSummary({ metric }: { metric: MetricFixture }) {
  return (
    <article className={styles.metric}>
      <p className={styles.metricLabel}>{metric.label}</p>
      <p className={styles.metricValue}>{metric.value}</p>
      <p className={styles.metricContext}>{metric.context}</p>
      <p className={styles.metricInterpretation}>{metric.interpretation}</p>
      <p className={styles.metricSource}>{metric.source}</p>
    </article>
  );
}

export function StatusBadge({
  tone,
  label,
}: {
  tone: StatusTone;
  label: string;
}) {
  return (
    <span className={`${styles.statusBadge} ${toneClass(tone)}`}>
      <CircleDot size={10} aria-hidden="true" />
      {label}
    </span>
  );
}

export function ServiceStatusItem({ service }: { service: ServiceFixture }) {
  return (
    <article className={styles.serviceItem}>
      <span className={styles.itemIcon} aria-hidden="true">
        <BriefcaseBusiness size={17} />
      </span>
      <div>
        <h3 className={styles.itemTitle}>{service.title}</h3>
        <StatusBadge tone={service.statusTone} label={service.status} />
        <p className={styles.itemDetail}>{service.nextAction}</p>
        {typeof service.progress === "number" ? (
          <div
            className={styles.progressTrack}
            aria-label={`پیشرفت ${formatFaNumber(service.progress)} درصد`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={service.progress}
          >
            <div
              className={styles.progressBar}
              style={{ width: `${service.progress}%` }}
            />
          </div>
        ) : null}
      </div>
      {typeof service.progress === "number" ? (
        <span className={styles.itemMeta}>
          {formatFaNumber(service.progress)}٪
        </span>
      ) : null}
    </article>
  );
}

export function ActivityItem({ activity }: { activity: ActivityFixture }) {
  return (
    <article className={styles.activityItem}>
      <span className={styles.itemIcon} aria-hidden="true">
        <Activity size={17} />
      </span>
      <div>
        <h3 className={styles.itemTitle}>{activity.title}</h3>
        <p className={styles.itemDetail}>{activity.detail}</p>
      </div>
      <time className={styles.itemMeta}>{activity.time}</time>
    </article>
  );
}

export function ReportSummary({ report }: { report: ReportFixture }) {
  return (
    <section className={styles.reportPanel} aria-labelledby="report-title">
      <p className={styles.reportPeriod}>{report.period}</p>
      <h2 className={styles.reportTitle} id="report-title">
        {report.title}
      </h2>
      <p className={styles.reportSummary}>{report.summary}</p>
      <a className={styles.textLink} href="#report-title">
        مشاهده خلاصه گزارش
        <ArrowLeft size={14} aria-hidden="true" />
      </a>
    </section>
  );
}

export function GrowthOpportunity({
  opportunity,
}: {
  opportunity: OpportunityFixture;
}) {
  return (
    <section
      className={styles.opportunity}
      aria-labelledby="opportunity-title"
    >
      <p className={styles.opportunityKicker}>
        <Lightbulb size={15} aria-hidden="true" />
        یک فرصت قابل بررسی
      </p>
      <h2 className={styles.opportunityTitle} id="opportunity-title">
        {opportunity.title}
      </h2>
      <div className={styles.opportunityBlock}>
        <span className={styles.opportunityLabel}>شواهد</span>
        <p className={styles.opportunityText}>{opportunity.evidence}</p>
      </div>
      <div className={styles.opportunityBlock}>
        <span className={styles.opportunityLabel}>پیشنهاد آرایه</span>
        <p className={styles.opportunityText}>{opportunity.recommendation}</p>
      </div>
      <div className={styles.opportunityBlock}>
        <span className={styles.opportunityLabel}>نتیجه مورد انتظار</span>
        <p className={styles.opportunityText}>
          {opportunity.expectedOutcome}
        </p>
      </div>
      <a className={styles.textLink} href="#opportunity-title">
        درباره اجرای این پیشنهاد گفت‌وگو کنیم
        <ArrowLeft size={14} aria-hidden="true" />
      </a>
    </section>
  );
}

export function BillingSummary({ billing }: { billing: BillingFixture }) {
  const tone = {
    clear: styles.billingClear,
    pending: styles.billingPending,
    overdue: styles.billingOverdue,
  }[billing.status];

  return (
    <section className={`${styles.billing} ${tone}`} aria-label="وضعیت مالی">
      <ReceiptText
        className={styles.billingIcon}
        size={21}
        aria-hidden="true"
      />
      <div className={styles.billingBody}>
        <h2 className={styles.billingTitle}>{billing.title}</h2>
        <p className={styles.billingDetail}>{billing.detail}</p>
        {billing.amount ? (
          <p className={styles.billingAmount}>{billing.amount}</p>
        ) : null}
      </div>
      <ChevronLeft
        className={styles.billingIcon}
        size={17}
        aria-hidden="true"
      />
    </section>
  );
}

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className={styles.emptyState}>
      <div>
        <span className={styles.emptyIcon} aria-hidden="true">
          <BarChart3 size={19} />
        </span>
        <h3 className={styles.emptyTitle}>{title}</h3>
        <p className={styles.emptyMessage}>{message}</p>
      </div>
    </div>
  );
}

export function ErrorState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className={styles.errorState} role="alert">
      <div>
        <span className={styles.errorIcon} aria-hidden="true">
          <AlertCircle size={20} />
        </span>
        <h2 className={styles.emptyTitle}>{title}</h2>
        <p className={styles.emptyMessage}>{message}</p>
        <button className={styles.retryButton} type="button">
          <RefreshCw size={14} aria-hidden="true" />
          تلاش دوباره
        </button>
      </div>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="در حال بارگذاری اطلاعات مرکز رشد">
      <div className={styles.priorityStack}>
        <div className={`${styles.skeleton} ${styles.skeletonStatus}`} />
        <div className={`${styles.skeleton} ${styles.skeletonAction}`} />
      </div>
      <div className={styles.metricList}>
        {[0, 1, 2, 3].map((item) => (
          <div
            className={`${styles.metric} ${styles.skeletonMetric}`}
            key={item}
          >
            <div
              className={`${styles.skeleton} ${styles.skeletonLine}`}
              style={{ width: "44%" }}
            />
            <div
              className={`${styles.skeleton} ${styles.skeletonLine}`}
              style={{ width: "70%", height: 28 }}
            />
            <div
              className={`${styles.skeleton} ${styles.skeletonLine}`}
              style={{ width: "88%" }}
            />
          </div>
        ))}
      </div>
      <div className={styles.skeletonColumns}>
        <div>
          <div
            className={`${styles.skeleton} ${styles.skeletonHeading}`}
          />
          {[0, 1].map((item) => (
            <div className={styles.skeletonListRow} key={item}>
              <div className={`${styles.skeleton} ${styles.skeletonIcon}`} />
              <div className={styles.skeletonListText}>
                <div
                  className={`${styles.skeleton} ${styles.skeletonLine}`}
                  style={{ width: "54%" }}
                />
                <div
                  className={`${styles.skeleton} ${styles.skeletonLine}`}
                  style={{ width: "82%" }}
                />
              </div>
            </div>
          ))}
          <div
            className={`${styles.skeleton} ${styles.skeletonHeading}`}
            style={{ marginTop: 28 }}
          />
          <div className={`${styles.skeleton} ${styles.skeletonEmpty}`} />
        </div>
        <div>
          <div
            className={`${styles.skeleton} ${styles.skeletonHeading}`}
          />
          <div className={`${styles.skeleton} ${styles.skeletonReport}`} />
          <div
            className={`${styles.skeleton} ${styles.skeletonReport}`}
            style={{ height: 220, marginTop: 22 }}
          />
          <div
            className={`${styles.skeleton} ${styles.skeletonBilling}`}
          />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {hint ? <p className={styles.sectionHint}>{hint}</p> : null}
    </div>
  );
}

export function GrowthHubHome({
  fixture,
}: {
  fixture: GrowthHubHomeFixture;
}) {
  return (
    <PortalShell fixture={fixture}>
      <PageHeader page={fixture.page} />

      {fixture.isLoading ? <LoadingSkeleton /> : null}

      {fixture.error ? (
        <ErrorState
          title={fixture.error.title}
          message={fixture.error.message}
        />
      ) : null}

      {!fixture.isLoading && !fixture.error ? (
        <>
          <div className={styles.priorityStack}>
            <BusinessStatusPanel status={fixture.status} />
            {fixture.primaryAction ? (
              <CustomerActionItem
                action={fixture.primaryAction}
                prominent
              />
            ) : (
              <EmptyState
                title="اقدام فوری ندارید"
                message="اگر کاری به اقدام شما نیاز داشته باشد، اینجا نمایش داده می‌شود."
              />
            )}
          </div>

          <section className={styles.section} aria-labelledby="metrics-title">
            <SectionHeader
              title="شاخص‌های کلیدی"
              hint="شاخص‌ها همراه با توضیح قابل‌فهم"
            />
            {fixture.metrics.length ? (
              <div className={styles.metricList} id="metrics-title">
                {fixture.metrics.map((metric) => (
                  <MetricSummary key={metric.label} metric={metric} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="هنوز شاخص قابل اتکایی نداریم"
                message={
                  fixture.metricsEmptyMessage ??
                  "پس از جمع‌آوری داده کافی، شاخص‌ها همراه با توضیح نمایش داده می‌شوند."
                }
              />
            )}
          </section>

          <div className={styles.twoColumn}>
            <div className={styles.column}>
              <section aria-labelledby="services-title">
                <SectionHeader title="خدمات فعال" hint="وضعیت اجرا و قدم بعدی" />
                {fixture.services.length ? (
                  <div className={styles.list} id="services-title">
                    {fixture.services.map((service) => (
                      <ServiceStatusItem key={service.id} service={service} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="خدمت فعالی ثبت نشده است"
                    message="تیم آرایه پس از تکمیل برنامه شروع همکاری، خدمات را اینجا نمایش می‌دهد."
                  />
                )}
              </section>

              <section
                className={styles.pendingGroup}
                id="customer-actions"
                aria-labelledby="actions-title"
              >
                <SectionHeader
                  title="منتظر اقدام شما"
                  hint={`${fixture.pendingActions.length} مورد`}
                />
                {fixture.pendingActions.length ? (
                  fixture.pendingActions.map((action) => (
                    <CustomerActionItem key={action.id} action={action} />
                  ))
                ) : (
                  <EmptyState
                    title="کاری از سمت شما باقی نمانده"
                    message="تیم آرایه کارهای جاری را ادامه می‌دهد و در صورت نیاز اطلاع می‌دهد."
                  />
                )}
              </section>

              <section className={styles.section} aria-labelledby="activity-title">
                <SectionHeader
                  title="آخرین فعالیت آرایه"
                  hint="آنچه اخیراً انجام شده"
                />
                {fixture.activities.length ? (
                  <div className={styles.list} id="activity-title">
                    {fixture.activities.map((activity) => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="فعالیت تازه‌ای ثبت نشده"
                    message="به‌روزرسانی‌های تیم آرایه به ترتیب زمان اینجا نمایش داده می‌شوند."
                  />
                )}
              </section>
            </div>

            <aside className={styles.column} aria-label="گزارش و جمع‌بندی">
              <SectionHeader title="آخرین گزارش" />
              {fixture.report ? (
                <ReportSummary report={fixture.report} />
              ) : (
                <EmptyState
                  title="هنوز گزارشی منتشر نشده"
                  message={
                    fixture.reportEmptyMessage ??
                    "پس از آماده شدن نخستین گزارش، خلاصه آن اینجا نمایش داده می‌شود."
                  }
                />
              )}

              {fixture.opportunity ? (
                <GrowthOpportunity opportunity={fixture.opportunity} />
              ) : null}

              {fixture.billing ? (
                <BillingSummary billing={fixture.billing} />
              ) : null}
            </aside>
          </div>
        </>
      ) : null}
    </PortalShell>
  );
}
