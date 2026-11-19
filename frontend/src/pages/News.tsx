import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, type NewsItem } from "../api";
import { Reveal } from "../components/Reveal";
import { useApi } from "../hooks";

const categories: Record<string, string> = {
  club: "俱乐部",
  match: "赛事",
  player: "球员",
  honor: "荣誉",
  transfer: "转会",
  injury: "伤病",
  fans: "球迷",
  controversy: "争议",
};

const filters = [{ key: "all", label: "全部" }].concat(
  Object.entries(categories).map(([key, label]) => ({ key, label })),
);

function monthLabel(ym: string) {
  const [y, m] = ym.split("-");
  return `${y} 年 ${Number(m)} 月`;
}

function NewsCard({ item, alert = false }: { item: NewsItem; alert?: boolean }) {
  return (
    <article className="timeline-card">
      <div className="timeline-top">
        <time>{item.date}</time>
        <span className={`chip ${alert ? "chip-alert" : ""}`}>
          {categories[item.category] ?? item.category}
        </span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
      <div className="news-links">
        {item.source_key && (
          <Link to="/sources" className="source-link">
            来源：{item.source_key}
          </Link>
        )}
        {item.source_url && (
          <a
            className="source-link"
            href={item.source_url}
            target="_blank"
            rel="noreferrer noopener"
            referrerPolicy="no-referrer"
          >
            阅读原文 ↗
          </a>
        )}
      </div>
    </article>
  );
}

export function News() {
  const { data, loading, error } = useApi(api.news, []);
  const [active, setActive] = useState("all");

  const history = useMemo(
    () =>
      (data ?? [])
        .filter((n) => n.scope === "history" && !n.is_controversy)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [data],
  );

  const controversies = useMemo(
    () =>
      (data ?? [])
        .filter((n) => n.scope === "history" && n.is_controversy)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [data],
  );

  const recent = useMemo(
    () =>
      (data ?? [])
        .filter((n) => n.scope === "recent")
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data],
  );

  const filteredRecent = useMemo(
    () => (active === "all" ? recent : recent.filter((n) => n.category === active)),
    [recent, active],
  );

  const groups = useMemo(() => {
    const map = new Map<string, NewsItem[]>();
    for (const n of filteredRecent) {
      const ym = n.date.slice(0, 7);
      if (!map.has(ym)) map.set(ym, []);
      map.get(ym)!.push(n);
    }
    return [...map.entries()];
  }, [filteredRecent]);

  return (
    <>
      <section className="page-head">
        <p className="kicker">NEWSROOM</p>
        <h1>新闻与风波</h1>
        <p className="lede">
          从 2023 年会员制成军到 2026 年中甲季军，这里汇集俱乐部成立以来的重要节点与引发讨论的争议事件，
          并按时间轴梳理近三个月球队、俱乐部与球员的动态。所有条目均回链公开报道，未核实处已注明。
        </p>
        <div className="page-stats">
          <div>
            <strong>{history.length}</strong>
            <span>重要新闻</span>
          </div>
          <div>
            <strong>{controversies.length}</strong>
            <span>争议风波</span>
          </div>
          <div>
            <strong>{recent.length}</strong>
            <span>近三个月动态</span>
          </div>
        </div>
      </section>

      {error && (
        <section className="section">
          <div className="state-box">
            <p>{error}</p>
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <p className="kicker">MILESTONES IN THE NEWS</p>
          <h2>成立以来的重要新闻</h2>
          <p className="section-note">
            按时间顺序收录登上媒体报道的关键节点：冲乙、更名、递补升甲、首冠、入驻新主场、足协杯淘汰中超球队与中甲季军。
          </p>
        </div>
        <div className="timeline">
          {history.map((n, i) => (
            <Reveal key={n.date + n.title} delay={Math.min(i, 6) * 30}>
              <div className="timeline-item">
                <div className="timeline-dot" aria-hidden="true" />
                <NewsCard item={n} />
              </div>
            </Reveal>
          ))}
        </div>
        {loading && <div className="skeleton skeleton-card" />}
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">CONTROVERSIES</p>
          <h2>争议与风波</h2>
          <p className="section-note">
            包括裁判判罚、纪律处罚、球迷抗议、体育继承与转会禁令、会员制舆论等。争议条目只陈述公开报道中的事实与各方表述，不作定性。
          </p>
        </div>
        <div className="timeline timeline-alert">
          {controversies.map((n, i) => (
            <Reveal key={n.date + n.title} delay={Math.min(i, 6) * 30}>
              <div className="timeline-item">
                <div className="timeline-dot is-alert" aria-hidden="true" />
                <NewsCard item={n} alert />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">LAST 90 DAYS</p>
          <h2>近三个月时间轴</h2>
          <p className="section-note">
            2026 年 8 月 19 日至 11 月 19 日，球队、俱乐部与球员相关动态，按月份倒序排列，可按类别筛选。
          </p>
        </div>

        <div className="filter-row" role="group" aria-label="按类别筛选近三个月新闻">
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

        {groups.map(([ym, items]) => (
          <div className="news-month" key={ym}>
            <h3 className="news-month-title">{monthLabel(ym)}</h3>
            <div className="timeline">
              {items.map((n, i) => (
                <Reveal key={n.date + n.title} delay={Math.min(i, 6) * 30}>
                  <div className="timeline-item">
                    <div className="timeline-dot" aria-hidden="true" />
                    <NewsCard item={n} />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        ))}

        {!loading && groups.length === 0 && (
          <div className="state-box">
            <p>该类别下近三个月暂无动态。</p>
          </div>
        )}
      </section>
    </>
  );
}
