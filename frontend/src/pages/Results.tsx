import { useMemo, useState } from "react";
import { api, type Match } from "../api";
import { baseTextStyle, chartColors, Chart } from "../components/Chart";
import { Reveal } from "../components/Reveal";
import { useApi } from "../hooks";

const years = [2026, 2025, 2024, 2023];

const resultLabel: Record<string, string> = { W: "胜", D: "平", L: "负" };

function formatScore(m: Match) {
  if (m.goals_for == null || m.goals_against == null) return "待核实";
  return m.is_home
    ? `${m.goals_for} : ${m.goals_against}`
    : `${m.goals_against} : ${m.goals_for}`;
}

const resultColor: Record<string, string> = {
  W: "#4fb37a",
  D: "#e8c16f",
  L: "#e11d2e",
};

export function Results() {
  const { data, loading, error } = useApi(api.matches, []);
  const [year, setYear] = useState(2026);
  const [side, setSide] = useState("全部");

  const keyMatches = useMemo(
    () =>
      (data ?? [])
        .filter((m) => m.is_key)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [data],
  );

  const seasonMatches = useMemo(
    () =>
      (data ?? [])
        .filter((m) => m.season_year === year)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [data, year],
  );

  const shown = useMemo(
    () =>
      seasonMatches.filter((m) => {
        if (side === "主场") return m.is_home;
        if (side === "客场") return !m.is_home;
        return true;
      }),
    [seasonMatches, side],
  );

  const stats = useMemo(() => {
    const leagueMatches = seasonMatches.filter(
      (m) => m.competition.includes("联赛") && m.round != null,
    );
    const scored = leagueMatches.filter(
      (m) => m.goals_for != null && m.goals_against != null,
    );
    const win = scored.filter((m) => m.result === "W").length;
    const draw = scored.filter((m) => m.result === "D").length;
    const loss = scored.filter((m) => m.result === "L").length;
    const gf = scored.reduce((n, m) => n + (m.goals_for ?? 0), 0);
    const ga = scored.reduce((n, m) => n + (m.goals_against ?? 0), 0);
    return { total: seasonMatches.length, scored: scored.length, win, draw, loss, gf, ga };
  }, [seasonMatches]);

  const sideStats = useMemo(
    () =>
      [
        { name: "主场", home: true },
        { name: "客场", home: false },
      ].map((s) => {
        const rows = seasonMatches.filter(
          (m) =>
            m.competition.includes("联赛") &&
            m.round != null &&
            m.is_home === s.home &&
            m.result in resultLabel,
        );
        return {
          name: s.name,
          胜: rows.filter((m) => m.result === "W").length,
          平: rows.filter((m) => m.result === "D").length,
          负: rows.filter((m) => m.result === "L").length,
        };
      }),
    [seasonMatches],
  );

  const pending = useMemo(
    () =>
      seasonMatches.filter(
        (m) => m.goals_for == null || m.goals_against == null,
      ),
    [seasonMatches],
  );

  const donutOption = useMemo(
    () => ({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(11,11,15,.94)",
        borderColor: chartColors.line,
        textStyle: { color: chartColors.ink, fontSize: 12 },
      },
      series: [
        {
          type: "pie",
          radius: ["56%", "78%"],
          center: ["50%", "50%"],
          itemStyle: { borderColor: chartColors.bg, borderWidth: 3 },
          label: { show: false },
          data: [
            { name: "胜", value: stats.win, itemStyle: { color: resultColor.W } },
            { name: "平", value: stats.draw, itemStyle: { color: resultColor.D } },
            { name: "负", value: stats.loss, itemStyle: { color: resultColor.L } },
          ].filter((d) => d.value > 0),
        },
      ],
      textStyle: baseTextStyle,
    }),
    [stats],
  );

  const barOption = useMemo(
    () => ({
      backgroundColor: "transparent",
      grid: { left: 44, right: 20, top: 34, bottom: 28 },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(11,11,15,.94)",
        borderColor: chartColors.line,
        textStyle: { color: chartColors.ink, fontSize: 12 },
      },
      legend: {
        data: ["胜", "平", "负"],
        textStyle: { color: chartColors.muted, fontSize: 12 },
        top: 0,
      },
      xAxis: {
        type: "category",
        data: sideStats.map((s) => s.name),
        axisLine: { lineStyle: { color: chartColors.line } },
        axisTick: { show: false },
        axisLabel: { color: chartColors.ink },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        splitLine: { lineStyle: { color: chartColors.line } },
        axisLabel: { color: chartColors.muted },
      },
      series: ["胜", "平", "负"].map((key) => ({
        name: key,
        type: "bar",
        stack: "total",
        barWidth: 44,
        data: sideStats.map((s) => s[key as "胜" | "平" | "负"]),
        itemStyle: { color: resultColor[key === "胜" ? "W" : key === "平" ? "D" : "L"] },
      })),
      textStyle: baseTextStyle,
    }),
    [sideStats],
  );

  return (
    <>
      <section className="page-head">
        <p className="kicker">RESULTS CENTER</p>
        <h1>比分里的四个赛季</h1>
        <p className="lede">
          2023 中冠第 3 升乙，2024 中乙 51 分第 4，2025 中甲第 9，2026 中甲季军。
          页面按赛季汇总已收录的公开赛果，图表按联赛口径统计，杯赛仅列入比赛列表。
        </p>
        <div className="page-stats">
          <div><strong>{(data ?? []).length}</strong><span>全站已收录比赛</span></div>
          <div><strong>{stats.win}</strong><span>本赛季联赛胜场</span></div>
          <div><strong>{stats.gf}</strong><span>本赛季联赛进球</span></div>
          <div><strong>{stats.ga}</strong><span>本赛季联赛失球</span></div>
        </div>
      </section>

      {keyMatches.length > 0 && (
        <section className="section">
          <div className="section-head">
            <p className="kicker">KEY MATCHES</p>
            <h2>必看的关键比赛</h2>
            <p className="section-note">
              升乙、夺冠、德比、绝杀与队史纪录之战。以下场次固定置顶，不随赛季筛选与时间倒序变化。
            </p>
          </div>

          <div className="key-match-grid">
            {keyMatches.map((m) => {
              const score = formatScore(m);
              return (
                <Reveal key={`key-${m.date}-${m.opponent}`} delay={40}>
                  <article className={`key-match key-result-${m.result || "U"}`}>
                    <div className="key-match-top">
                      <time>{m.date}</time>
                      <span className="chip chip-key">焦点</span>
                    </div>
                    <p className="key-match-comp">
                      {m.competition}
                      {m.round ? ` · 第 ${m.round} 轮` : ""}
                      <span className="dot-sep">·</span>
                      {m.is_home ? "主场" : "客场"}
                    </p>
                    <h3>
                      {m.is_home ? "陕西联合" : m.opponent}
                      <strong>{score}</strong>
                      {m.is_home ? m.opponent : "陕西联合"}
                    </h3>
                    {m.note && <p className="key-match-note">{m.note}</p>}
                  </article>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      <section className="section">
        <div className="filter-row" role="group" aria-label="选择赛季">
          {years.map((y) => (
            <button
              key={y}
              aria-pressed={year === y}
              className={`chip-btn ${year === y ? "is-active" : ""}`}
              onClick={() => setYear(y)}
            >
              {y} 赛季
            </button>
          ))}
        </div>

        {error && <div className="state-box"><p>{error}</p></div>}

        <div className="grid grid-2">
          <Reveal>
            <div className="card chart-card">
              <div className="chart-wrap">
                {loading || stats.win + stats.draw + stats.loss === 0 ? (
                  <div className="skeleton skeleton-chart" />
                ) : (
                  <>
                    <Chart
                      option={donutOption}
                      height={260}
                      label={`${year} 赛季联赛胜平负构成：${stats.win} 胜、${stats.draw} 平、${stats.loss} 负`}
                    />
                    <div className="chart-center">
                      <strong>{stats.scored}</strong>
                      <span>联赛有比分</span>
                    </div>
                  </>
                )}
              </div>
              <div className="legend-row">
                <span><i className="dot" style={{ background: resultColor.W }} />胜 {stats.win}</span>
                <span><i className="dot" style={{ background: resultColor.D }} />平 {stats.draw}</span>
                <span><i className="dot" style={{ background: resultColor.L }} />负 {stats.loss}</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="card chart-card">
              {loading ? (
                <div className="skeleton skeleton-chart" />
              ) : (
                <>
                  <Chart
                    option={barOption}
                    height={260}
                    label={`${year} 赛季主客场联赛胜平负堆叠柱状图`}
                  />
                  <p className="chart-footnote">按主客场拆分的已收录联赛胜平负场次，不含杯赛。</p>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">MATCHES</p>
          <h2>{year} 赛季比赛记录</h2>
          <p className="section-note">
            共 {stats.total} 场已收录（含杯赛与淘汰赛），其中联赛 {stats.scored} 场有可核实比分。列表按时间倒序排列。
          </p>
        </div>

        <div className="filter-row" role="group" aria-label="按主客场筛选">
          {["全部", "主场", "客场"].map((key) => (
            <button
              key={key}
              aria-pressed={side === key}
              className={`chip-btn ${side === key ? "is-active" : ""}`}
              onClick={() => setSide(key)}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="match-list">
          {loading &&
            [0, 1, 2].map((i) => <div className="skeleton skeleton-card" key={i} />)}

          {!loading &&
            shown.map((m: Match, i) => {
              const score = formatScore(m);
              return (
                <Reveal key={`${m.date}-${m.opponent}-${i}`} delay={Math.min(i, 8) * 25}>
                  <article className={`result-row result-${m.result || "U"}`}>
                    <div className="result-meta">
                      <time>{m.date}</time>
                      <span>
                        {m.competition}
                        {m.round ? ` · 第 ${m.round} 轮` : ""}
                      </span>
                      <span className="chip">{m.is_home ? "主场" : "客场"}</span>
                      {m.is_key && <span className="chip chip-key">焦点</span>}
                    </div>

                    <div className="result-score">
                      <span className="result-side">
                        {m.is_home ? "陕西联合" : m.opponent || "对手待核实"}
                      </span>
                      <strong>{score}</strong>
                      <span className="result-side">
                        {m.is_home ? m.opponent || "对手待核实" : "陕西联合"}
                      </span>
                    </div>

                    <div className="result-bottom">
                      <span className={`result-chip result-${m.result || "U"}`}>
                        {resultLabel[m.result] ?? "无结果"}
                      </span>
                      {m.venue && <span>{m.venue}</span>}
                      {m.attendance != null && (
                        <span>{m.attendance === 0 ? "空场" : `${m.attendance.toLocaleString()} 人`}</span>
                      )}
                    </div>

                    {m.scorers && <p className="result-scorers">进球：{m.scorers}</p>}
                    {m.note && <p className="result-note">{m.note}</p>}
                  </article>
                </Reveal>
              );
            })}
        </div>

        {!loading && shown.length === 0 && (
          <div className="state-box"><p>该筛选条件下暂无比赛记录。</p></div>
        )}

        <p className="data-caveat">
          2023—2026 赛季的比赛记录已按官方赛程补录：2023 中冠 9 场、2024 中乙 28 轮与足协杯 3 场、
          2025 中甲 30 轮与足协杯 3 场、2026 中甲 30 轮与 3 场足协杯均为全量。
          页面不补写未经来源确认的比分。
        </p>

        {pending.length > 0 && (
          <p className="data-caveat">
            本季待核实比分 {pending.length} 场：
            {pending
              .map(
                (m) =>
                  `${m.date} ${m.is_home ? "主场" : "客场"}${
                    m.opponent ? `对${m.opponent}` : "（对手待核实）"
                  }`,
              )
              .join("；")}
            。
          </p>
        )}
      </section>
    </>
  );
}
