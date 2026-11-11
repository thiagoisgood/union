import { Link } from "react-router-dom";
import { api } from "../api";
import { baseTextStyle, chartColors, Chart } from "../components/Chart";
import { Reveal } from "../components/Reveal";
import { useApi } from "../hooks";

const modules = [
  { to: "/history", title: "历史沿革", desc: "从彬州辉龙到中甲季军", tag: "已上线" },
  { to: "/squad", title: "球员阵容", desc: "名单、位置结构与球员影像", tag: "已上线" },
  { to: "/staff", title: "教练组", desc: "历任主帅与执教沿革", tag: "已上线" },
  { to: "/results", title: "战绩中心", desc: "四个赛季的比赛与积分", tag: "已上线" },
  { to: "/stadium", title: "主场", desc: "三座球场与上座数据", tag: "已上线" },
  { to: "/fans", title: "球迷大会", desc: "会员制与球迷文化", tag: "已上线" },
  { to: "/progress", title: "开发进度", desc: "逐轮记录补充与核验", tag: "已上线" },
  { to: "/sources", title: "数据来源", desc: "公开来源与实时自检", tag: "已上线" },
];

function seasonRank(rank: string) {
  return rank && rank !== "待核实" ? rank : "待核实";
}

export function Home() {
  const { data, loading, error } = useApi(api.overview, []);
  const { data: matches } = useApi(() => api.matches(2026), []);

  if (error) {
    return (
      <div className="state-box">
        <h2>数据加载失败</h2>
        <p>{error}</p>
      </div>
    );
  }

  const club = data?.club;
  const seasons = data?.seasons ?? [];
  const latest = data?.latest_season;
  const milestones = data?.recent_milestones ?? [];
  const recent = (matches ?? []).filter((m) => m.goals_for !== null).slice(-3).reverse();

  const donutOption = latest
    ? {
        backgroundColor: "transparent",
        textStyle: baseTextStyle,
        tooltip: {
          trigger: "item",
          backgroundColor: "#16161c",
          borderColor: "rgba(244,241,234,0.12)",
          textStyle: { color: "#f4f1ea" },
        },
        series: [
          {
            type: "pie",
            radius: ["64%", "88%"],
            avoidLabelOverlap: false,
            label: { show: false },
            itemStyle: { borderColor: "#0b0b0f", borderWidth: 4 },
            data: [
              { value: latest.won, name: "胜场", itemStyle: { color: chartColors.red } },
              { value: latest.drawn, name: "平局", itemStyle: { color: chartColors.gold } },
              { value: latest.lost, name: "失利", itemStyle: { color: "#35353f" } },
            ],
          },
        ],
      }
    : null;

  return (
    <>
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <span className="hero-word">西北狼</span>
          <svg className="pitch-lines" viewBox="0 0 1200 700" preserveAspectRatio="none">
            <line x1="600" y1="0" x2="600" y2="700" />
            <circle cx="600" cy="350" r="120" />
            <rect x="0" y="150" width="180" height="400" />
            <rect x="1020" y="150" width="180" height="400" />
          </svg>
        </div>

        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">SHAANXI UNION FOOTBALL CLUB · EST. 2013</p>
            <h1>
              以陕西为家
              <br />
              <em>为球迷而生</em>
            </h1>
            <p className="lede">
              一家由球迷共同参与治理的会员制俱乐部。从 2013 年的彬州辉龙，到 2026
              年西安国际足球中心的中甲季军，陕西联合用三年时间完成了从中冠到中甲的三级跳。
            </p>
            <div className="hero-actions">
              <Link className="btn btn-solid" to="/history">
                阅读球队历史
              </Link>
              <Link className="btn btn-ghost" to="/progress">
                查看开发进度
              </Link>
            </div>
            <p className="hero-meta">数据截至 2026 年 11 月 8 日 · 来源均为公开网络信息</p>
          </div>

          <div className="hero-panel">
            <div className="stamp">
              <span className="stamp-label">2026 赛季中甲</span>
              <strong>季军</strong>
              <span className="stamp-sub">15 胜 6 平 9 负 · 51 分</span>
            </div>
            <div className="hero-stats">
              <div>
                <span className="stat-value">2013</span>
                <span className="stat-label">俱乐部前身成立</span>
              </div>
              <div>
                <span className="stat-value">{club?.capacity.toLocaleString() ?? "—"}</span>
                <span className="stat-label">主场座位数</span>
              </div>
              <div>
                <span className="stat-value">{latest?.points ?? "—"}</span>
                <span className="stat-label">2026 赛季积分</span>
              </div>
              <div>
                <span className="stat-value">{club ? club.members.toLocaleString() : "—"}</span>
                <span className="stat-label">2026 注册会员</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">SEASON 2026</p>
          <h2>赛季坐标</h2>
          <p className="section-note">
            球队入驻西安国际足球中心的首个赛季，30 轮联赛拿下 51 分，创队史中甲最高排名。
          </p>
        </div>

        <div className="grid grid-2">
          <Reveal>
            <div className="card chart-card">
              <div className="chart-wrap">
                {loading || !donutOption ? (
                  <div className="skeleton skeleton-chart" />
                ) : (
                  <>
                    <Chart
                      option={donutOption}
                      height={300}
                      label={`2026 赛季胜平负构成：${latest?.won} 胜、${latest?.drawn} 平、${latest?.lost} 负`}
                    />
                    <div className="chart-center">
                      <strong>{latest?.points}</strong>
                      <span>积分</span>
                    </div>
                  </>
                )}
              </div>
              <div className="legend-row">
                <span><i className="dot dot-red" />胜 {latest?.won ?? "—"}</span>
                <span><i className="dot dot-gold" />平 {latest?.drawn ?? "—"}</span>
                <span><i className="dot dot-grey" />负 {latest?.lost ?? "—"}</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="card season-list">
              {seasons.length === 0 && <div className="skeleton skeleton-text" />}
              {[...seasons].reverse().map((s) => (
                <div className="season-row" key={s.year}>
                  <div className="season-year">
                    <strong>{s.year}</strong>
                    <span>{s.competition}</span>
                  </div>
                  <div className="season-rank">
                    <strong>{seasonRank(s.rank)}</strong>
                    <span>{s.home_venue}</span>
                  </div>
                </div>
              ))}
              <p className="tiny-note">
                2023—2025 赛季已收录关键场次与赛季结论；2025 赛季逐轮比分仍有部分待核实，未做推测补写。
                <Link to="/results"> 查看战绩中心 →</Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">LATEST RESULTS</p>
          <h2>已核实的近期战报</h2>
        </div>
        <div className="grid grid-3">
          {recent.length === 0 && <div className="skeleton skeleton-card" />}
          {recent.map((m) => (
            <div className="card match-card" key={`${m.date}-${m.opponent}`}>
              <div className="match-top">
                <span className="match-date">{m.date.slice(5).replace("-", ".")}</span>
                <span className={`match-tag ${m.is_home ? "home" : "away"}`}>
                  {m.is_home ? "主场" : "客场"}
                </span>
              </div>
              <div className="match-score">
                <strong>{m.goals_for}</strong>
                <span>:</span>
                <strong>{m.goals_against}</strong>
              </div>
              <p className="match-opponent">{m.opponent || "对手待核实"}</p>
              <p className="match-meta">
                {m.competition}
                {m.round ? ` · 第 ${m.round} 轮` : ""}
                {m.attendance ? ` · ${m.attendance.toLocaleString()} 人` : ""}
              </p>
              {m.scorers && <p className="match-scorers">进球：{m.scorers}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">TIMELINE</p>
          <h2>最近的时间线</h2>
          <Link className="text-link" to="/history">
            查看完整历史 →
          </Link>
        </div>
        <div className="mini-timeline">
          {milestones.map((m) => (
            <div className="mini-item" key={m.date + m.title}>
              <span className="mini-date">{m.date}</span>
              <div>
                <strong>{m.title}</strong>
                <p>{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">EXPLORE</p>
          <h2>内容模块</h2>
          <p className="section-note">分阶段建设，内容补充与数据核验进度实时公开。</p>
        </div>
        <div className="grid grid-3">
          {modules.map((m, i) => (
            <Reveal key={m.to} delay={i * 60}>
              <Link to={m.to} className="card module-card">
                <div className="module-top">
                  <span className="module-index">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`chip ${m.tag === "已上线" ? "chip-live" : ""}`}>{m.tag}</span>
                </div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
                <span className="module-arrow" aria-hidden="true">→</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
