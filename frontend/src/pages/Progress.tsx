import { Link } from "react-router-dom";
import { api } from "../api";
import { useApi } from "../hooks";

const statusLabel: Record<string, string> = {
  completed: "已完成",
  in_progress: "进行中",
  planned: "计划中",
};

export function Progress() {
  const { data, loading, error } = useApi(api.progress, []);
  const rows = data ?? [];
  const done = rows.filter((r) => r.status === "completed").length;
  const percent = rows.length ? Math.round((done / rows.length) * 100) : 0;

  return (
    <>
      <section className="page-head">
        <p className="kicker">BUILD LOG</p>
        <h1>开发进度</h1>
        <p className="lede">
          前 10 轮完成主体建设，第 11—15 轮补充视觉与声音素材，此后按现有模块逐页做内容补充与核验。
          每轮完成后更新此页，记录本轮核对、修正与仍待核实的事项。
        </p>
        <div className="progress-summary">
          <div className="progress-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${percent}%` }} />
          </div>
          <span className="progress-text">
            已完成 {done} / {rows.length || "—"} · {percent}%
          </span>
        </div>
      </section>

      <section className="section">
        {error && <div className="state-box"><p>{error}</p></div>}
        {loading && <div className="skeleton skeleton-card" />}
        <ol className="loop-list">
          {rows.map((r) => (
            <li key={r.loop_index} className={`loop-item is-${r.status}`}>
              <div className="loop-index">
                <span>LOOP</span>
                <strong>{String(r.loop_index).padStart(2, "0")}</strong>
              </div>
              <div className="loop-body">
                <div className="loop-top">
                  <h3>{r.title}</h3>
                  <span className={`status status-${r.status}`}>
                    {statusLabel[r.status] ?? r.status}
                  </span>
                </div>
                <p className="loop-phase">
                  {r.phase}
                  {r.completed_at ? ` · ${r.completed_at} 完成` : ""}
                </p>
                <p>{r.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="tiny-note">
          进度数据来自后端 <code>/api/progress</code>，随时间线同步更新。
          <Link to="/sources"> 查看数据来源 →</Link>
        </p>
      </section>
    </>
  );
}
