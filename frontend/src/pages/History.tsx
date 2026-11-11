import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Milestone, type Season } from "../api";
import { ClubIdentity } from "../components/ClubIdentity";
import { Reveal } from "../components/Reveal";
import { useApi } from "../hooks";

const levelHeight: Record<string, number> = {
  中冠联赛: 34,
  中乙联赛: 62,
  中甲联赛: 92,
};

const categories: Record<string, string> = {
  origin: "起源",
  membership: "会员制",
  identity: "身份",
  sporting: "竞技",
  fans: "球迷",
  venue: "主场",
  staff: "教练组",
  squad: "阵容",
  brand: "品牌",
};

const filters = [{ key: "all", label: "全部" }].concat(
  Object.entries(categories).map(([key, label]) => ({ key, label })),
);

export function History() {
  const { data, loading, error } = useApi(api.milestones, []);
  const { data: seasonData } = useApi(api.seasons, []);
  const [active, setActive] = useState("all");

  const items = useMemo(() => {
    const rows = data ?? [];
    return active === "all" ? rows : rows.filter((m) => m.category === active);
  }, [data, active]);

  const seasons = useMemo(
    () => [...(seasonData ?? [])].sort((a, b) => a.year - b.year),
    [seasonData],
  );

  return (
    <>
      <section className="page-head">
        <p className="kicker">HISTORY</p>
        <h1>从彬州辉龙到西北狼</h1>
        <p className="lede">
          2013 年 7 月，彬州辉龙足球俱乐部成立；2023 年陕西长安竞技解散后，原班教练与球员加盟，
          俱乐部以「陕西长安联合」之名重建，并在球迷投票中定名「陕西联合」。
        </p>
        <div className="page-stats">
          <div><strong>{(data ?? []).length}</strong><span>个关键节点</span></div>
          <div><strong>2013</strong><span>前身成立</span></div>
          <div><strong>2026</strong><span>中甲季军</span></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">SEASON LADDER</p>
          <h2>四年三级跳</h2>
          <p className="section-note">
            从中冠到中甲，俱乐部在四个赛季里完成两次升级。柱高代表所在联赛级别，
            2025 与 2026 同处中甲，分别标注首个赛季与季军赛季。
          </p>
        </div>

        <div className="ladder">
          {seasons.map((s, i) => (
            <div className="ladder-col" key={s.year}>
              <div className="ladder-bar-wrap">
                <div
                  className={`ladder-bar ${i === seasons.length - 1 ? "is-current" : ""}`}
                  style={{ height: `${levelHeight[s.competition] ?? 50}%` }}
                >
                  <span>{s.competition.replace("联赛", "")}</span>
                </div>
              </div>
              <div className="ladder-label">
                <strong>{s.year}</strong>
                <span>{s.rank}</span>
              </div>
            </div>
          ))}
          {seasons.length === 0 && <div className="skeleton skeleton-card" />}
        </div>

        <div className="season-grid">
          {seasons.map((s: Season) => (
            <Reveal key={s.year}>
              <article className="season-card">
                <div className="season-card-top">
                  <span className="season-year">{s.year}</span>
                  <span className="chip">{s.competition}</span>
                </div>
                <h3>{s.rank}</h3>
                <div className="season-facts">
                  <div>
                    <span>积分</span>
                    <strong>{s.points > 0 ? s.points : "待核实"}</strong>
                  </div>
                  <div>
                    <span>战绩</span>
                    <strong>
                      {s.played > 0 ? `${s.won} 胜 ${s.drawn} 平 ${s.lost} 负` : "待核实"}
                    </strong>
                  </div>
                  <div>
                    <span>主场</span>
                    <strong>{s.home_venue}</strong>
                  </div>
                </div>
                <p className="season-highlight">{s.highlight}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="filter-row" role="group" aria-label="按类别筛选">
          {filters.map((f) => (
            <button
              key={f.key}
              aria-pressed={active === f.key}
              className={`chip-btn ${active === f.key ? "is-active" : ""}`}
              onClick={() => setActive(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error && <div className="state-box"><p>{error}</p></div>}
        {loading && (
          <div className="timeline">
            {[0, 1, 2, 3].map((i) => (
              <div className="timeline-item" key={i}>
                <div className="skeleton skeleton-card" />
              </div>
            ))}
          </div>
        )}

        <div className="timeline">
          {items.map((m: Milestone, i) => (
            <Reveal key={m.date + m.title} delay={Math.min(i, 6) * 40}>
              <article className="timeline-item">
                <div className="timeline-dot" aria-hidden="true" />
                <div className="timeline-card">
                  <div className="timeline-top">
                    <time>{m.date}</time>
                    <span className="chip">{categories[m.category] ?? m.category}</span>
                  </div>
                  <h3>{m.title}</h3>
                  <p>{m.description}</p>
                  {m.source_key && (
                    <Link to="/sources" className="source-link">
                      来源：{m.source_key}
                    </Link>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {!loading && items.length === 0 && (
          <div className="state-box"><p>该类别下暂无节点。</p></div>
        )}
      </section>

      <ClubIdentity />
    </>
  );
}
