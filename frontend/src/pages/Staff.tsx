import { useMemo } from "react";
import { Link } from "react-router-dom";
import { api, type Coach } from "../api";
import { Reveal } from "../components/Reveal";
import { useApi } from "../hooks";

const START_MONTH = 2023 * 12 + 4;
const END_MONTH = 2026 * 12 + 10;
const SPAN = END_MONTH - START_MONTH;

const barColors = ["#e11d2e", "#e8c16f", "#f0566a", "#9d7bd8", "#4fb3a5", "#5b8def"];

function monthIndex(date: string): number {
  const [y, m] = date.split("-").map(Number);
  return y * 12 + (m || 1) - 1 - START_MONTH;
}

function pct(months: number): number {
  return Math.max(0, Math.min(100, (months / SPAN) * 100));
}

function tenureLabel(c: Coach): string {
  const end = c.end_date || "至今";
  if (c.start_date === end) return c.start_date;
  return `${c.start_date} — ${end}`;
}

function winRate(wins: number, matches: number): string {
  if (!matches) return "—";
  return ((wins / matches) * 100).toFixed(1).replace(/\.0$/, "");
}

function share(part: number, total: number): number {
  return total ? (part / total) * 100 : 0;
}

export function Staff() {
  const { data, loading, error } = useApi(api.coaches, []);
  const coaches = data ?? [];

  const headCoaches = useMemo(
    () =>
      coaches
        .filter((c) => c.role.includes("主教练"))
        .sort((a, b) => monthIndex(a.start_date) - monthIndex(b.start_date)),
    [coaches],
  );

  const staff = coaches.filter((c) => !c.role.includes("主教练"));

  const totals = useMemo(
    () =>
      headCoaches.reduce(
        (acc, c) => ({
          matches: acc.matches + c.matches,
          wins: acc.wins + c.wins,
          draws: acc.draws + c.draws,
          losses: acc.losses + c.losses,
        }),
        { matches: 0, wins: 0, draws: 0, losses: 0 },
      ),
    [headCoaches],
  );

  return (
    <>
      <section className="page-head">
        <p className="kicker">COACHING STAFF</p>
        <h1>五任主帅，一条上升曲线</h1>
        <p className="lede">
          从西班牙青训教头奥斯卡，到荷兰技术流彼得森、乔瓦尼、弗拉泽，再到前国脚陈涛，
          陕西联合在四个赛季内完成从中冠到中甲季军的跨越。每位主帅的任期与主要成绩均可追溯至公开报道。
        </p>
        <div className="page-stats">
          <div><strong>{headCoaches.length}</strong><span>历任主教练</span></div>
          <div><strong>3</strong><span>荷兰籍主帅</span></div>
          <div><strong>2025</strong><span>队史首冠</span></div>
          <div><strong>2026</strong><span>中甲季军</span></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">TIMELINE</p>
          <h2>执教时间轴</h2>
          <p className="section-note">
            横轴为 2023 年 5 月至 2026 年 11 月。条形长度代表任期，颜色区分不同主帅。
          </p>
        </div>

        {error && <div className="state-box"><p>{error}</p></div>}
        {loading && <div className="skeleton skeleton-chart" />}

        {!loading && headCoaches.length > 0 && (
          <Reveal>
            <div className="tenure">
              <div className="tenure-years" aria-hidden="true">
                {[2024, 2025, 2026].map((y) => (
                  <span key={y} style={{ left: `${pct(monthIndex(`${y}-01`))}%` }}>
                    {y}
                  </span>
                ))}
              </div>
              {headCoaches.map((c, i) => {
                const left = pct(monthIndex(c.start_date));
                const end = c.end_date || "2026-11";
                const width = Math.max(1.5, pct(monthIndex(end)) - left);
                return (
                  <div className="tenure-row" key={c.name}>
                    <div className="tenure-label">
                      <strong>{c.name}</strong>
                      <span>{tenureLabel(c)}</span>
                    </div>
                    <div className="tenure-track">
                      {[2024, 2025, 2026].map((y) => (
                        <i
                          key={y}
                          className="tenure-grid"
                          style={{ left: `${pct(monthIndex(`${y}-01`))}%` }}
                        />
                      ))}
                      <div
                        className="tenure-bar"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          background: barColors[i % barColors.length],
                        }}
                      >
                        <span>{c.role}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">PROFILES</p>
          <h2>主帅档案</h2>
          <p className="section-note">
            按上任时间排序。执教战绩按站内已收录的正式比赛逐场统计，含中冠、中乙、中甲与足协杯；
            胜率为胜场 ÷ 总场次。五任主帅合计 {totals.matches} 场 {totals.wins} 胜 {totals.draws} 平{" "}
            {totals.losses} 负，总胜率 {winRate(totals.wins, totals.matches)}%。
            履历取自俱乐部公告与直播吧教练资料。<Link to="/sources">逐项来源见数据来源页 →</Link>
          </p>
        </div>

        <div className="coach-grid">
          {headCoaches.map((c, i) => (
            <Reveal key={c.name} delay={Math.min(i, 5) * 50}>
              <article className="coach-card">
                <div className="coach-card-top">
                  <div className="coach-photo-wrap">
                    {c.photo ? (
                      <img
                        className="coach-photo"
                        src={c.photo}
                        alt={`${c.name} 主教练照片`}
                        loading="lazy"
                      />
                    ) : (
                      <span className="coach-photo-fallback">{c.name.slice(0, 1)}</span>
                    )}
                    <span className="coach-order">0{i + 1}</span>
                  </div>
                  <div className="coach-heading">
                    <span className="chip">{c.nationality}</span>
                    <h3>{c.name}</h3>
                    <p className="coach-role">{c.role} · {tenureLabel(c)}</p>
                  </div>
                </div>
                {c.matches > 0 && (
                  <div className="coach-record">
                    <div className="wdl-row">
                      <span className="wdl wdl-win">{c.wins} 胜</span>
                      <span className="wdl wdl-draw">{c.draws} 平</span>
                      <span className="wdl wdl-loss">{c.losses} 负</span>
                      <span className="coach-gd">进 {c.goals_for} 失 {c.goals_against}</span>
                      <span className="coach-rate">
                        胜率 <strong>{winRate(c.wins, c.matches)}%</strong>
                      </span>
                    </div>
                    <div className="wdl-bar" aria-hidden="true">
                      <i className="wdl-seg is-win" style={{ width: `${share(c.wins, c.matches)}%` }} />
                      <i className="wdl-seg is-draw" style={{ width: `${share(c.draws, c.matches)}%` }} />
                      <i className="wdl-seg is-loss" style={{ width: `${share(c.losses, c.matches)}%` }} />
                    </div>
                    <p className="coach-record-note">
                      {c.matches} 场 · {c.record}
                    </p>
                  </div>
                )}
                {c.career && (
                  <p className="coach-career">
                    <span>履历</span>
                    {c.career}
                  </p>
                )}
                <p className="coach-note">{c.note}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {staff.length > 0 && (
        <section className="section">
          <div className="section-head">
            <p className="kicker">SUPPORT</p>
            <h2>教练组其他成员</h2>
            <p className="section-note">
              以下为 2026 赛季公开报道可确认的教练组成员，完整名单以俱乐部公告为准。
            </p>
          </div>
          <div className="staff-list">
            {staff.map((c) => (
              <div className="staff-item" key={c.name}>
                <div>
                  <strong>{c.name}</strong>
                  <span>{c.role}</span>
                </div>
                <p>{c.note}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
