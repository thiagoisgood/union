import { api } from "../api";
import { useApi } from "../hooks";

function isHomepage(url: string) {
  try {
    const { pathname, search } = new URL(url);
    return (pathname === "/" || pathname === "") && !search;
  } catch {
    return false;
  }
}

export function Sources() {
  const { data, loading, error } = useApi(api.sources, []);
  const { data: audit } = useApi(api.audit, []);

  return (
    <>
      <section className="page-head">
        <p className="kicker">SOURCES</p>
        <h1>数据来源</h1>
        <p className="lede">
          本站内容整理自公开网络信息，优先采用俱乐部官方公告、政府体育主管部门与主流媒体报道。
          对尚在核实的数字，页面会直接标注「待核实」，不作推测。
        </p>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">DATA AUDIT</p>
          <h2>数据自检</h2>
          <p className="section-note">
            页面加载时由后端实时核对来源引用、比分与日期格式。
            {audit ? `本次核验于 ${audit.checked_at} 执行。` : ""}
          </p>
        </div>

        {audit ? (
          <>
            <div className="audit-grid">
              {audit.checks.map((c) => (
                <article className={`audit-card is-${c.status}`} key={c.key}>
                  <span className="audit-status">
                    {c.status === "pass" ? "通过" : "待补"}
                  </span>
                  <h3>{c.label}</h3>
                  <p>{c.detail}</p>
                </article>
              ))}
            </div>
            {audit.unknown_matches.length > 0 && (
              <details className="audit-details">
                <summary>
                  查看 {audit.unknown_matches.length} 场待核实比分的比赛
                </summary>
                <ul>
                  {audit.unknown_matches.map((m) => (
                    <li key={`${m.season_year}-${m.date}-${m.opponent}`}>
                      <time>{m.date}</time>
                      <span>
                        {m.season_year} 赛季
                        {m.round ? ` 第 ${m.round} 轮` : ""} · {m.opponent}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </>
        ) : (
          <div className="skeleton skeleton-card" />
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">REFERENCE LIST</p>
          <h2>来源清单</h2>
          <p className="section-note">
            共 {data?.length ?? "—"} 条公开来源
            {audit ? `，支撑 ${audit.reference_count} 处数据引用` : ""}，按发布时间倒序排列。
          </p>
        </div>

        {error && <div className="state-box"><p>{error}</p></div>}
        {loading && <div className="skeleton skeleton-card" />}
        <div className="source-list">
          {(data ?? []).map((s) => (
            <article className="card source-card" key={s.key}>
              <div className="source-top">
                <div className="source-badges">
                  <span className="chip">{s.publisher}</span>
                  {isHomepage(s.url) && <span className="chip chip-ghost">站点入口</span>}
                </div>
                <time>{s.published_at}</time>
              </div>
              <h3>
                <a href={s.url} target="_blank" rel="noreferrer noopener">
                  {s.title}
                </a>
              </h3>
              <p>{s.note}</p>
              <code>{s.key}</code>
            </article>
          ))}
        </div>
        <p className="tiny-note">
          标注「站点入口」的来源仅能定位到媒体站点首页，原始报道链接已失效或无法直接取得，
          因此保留站点作为出处记录，不补写猜测的链接。最后核验时间：2026-11-09。
          若发现数据错误，欢迎通过站点维护者反馈。
        </p>
      </section>
    </>
  );
}
