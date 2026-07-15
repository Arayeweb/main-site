import { seoExecutionPhases, seoExecutionDisclaimer } from "@/lib/seoData";

export default function SeoExecutionFlow() {
  return (
    <section className="seo-collab section-py" aria-label="برنامه ۹۰ روزه">
      <div className="container-mx container-px">
        <div className="seo-collab-header">
          <span className="seo-section-tag">برنامه اجرا</span>
          <h2>در ۹۰ روز اول چه اتفاقی می‌افتد؟</h2>
        </div>

        <ol className="seo-collab-timeline">
          {seoExecutionPhases.map((phase) => (
            <li key={phase.title} className="seo-collab-step">
              <span className="seo-collab-dot">{phase.num}</span>
              <div className="seo-collab-step-body">
                <h3>{phase.title}</h3>
                <p className="seo-collab-time">{phase.time}</p>
                <ul className="seo-collab-tasks">
                  {phase.tasks.map((task) => (
                    <li key={task}>{task}</li>
                  ))}
                </ul>
                <span className="seo-collab-output">{phase.output}</span>
              </div>
            </li>
          ))}
        </ol>

        <p className="seo-collab-disclaimer">{seoExecutionDisclaimer}</p>
      </div>
    </section>
  );
}
