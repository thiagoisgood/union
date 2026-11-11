import { useMemo, useState } from "react";
import { api, type Player, type Transfer } from "../api";
import { baseTextStyle, chartColors, Chart } from "../components/Chart";
import { PlayerGallery } from "../components/PlayerGallery";
import { Reveal } from "../components/Reveal";
import { useApi } from "../hooks";

const positions = ["门将", "后卫", "中场", "前锋"] as const;

const positionMark: Record<string, string> = {
  门将: "门",
  后卫: "后",
  中场: "中",
  前锋: "前",
};

const positionColor: Record<string, string> = {
  门将: "#e8c16f",
  后卫: "#f0566a",
  中场: "#e11d2e",
  前锋: "#9d7bd8",
};

const isForeign = (p: Player) => p.nationality !== "中国" && p.nationality !== "中国香港";

const filters = ["全部", ...positions, "外援", "U21"] as const;

export function Squad() {
  const { data, loading, error } = useApi(() => api.players(2026), []);
  const { data: season2025 } = useApi(() => api.players(2025), []);
  const { data: season2024 } = useApi(() => api.players(2024), []);
  const { data: season2023 } = useApi(() => api.players(2023), []);
  const { data: recordData } = useApi(api.records, []);
  const { data: transferData } = useApi(() => api.transfers(), []);
  const [filter, setFilter] = useState<string>("全部");

  const players = data ?? [];
  const olderPlayers = useMemo(
    () => [...(season2025 ?? [])].sort((a, b) => (a.number ?? 99) - (b.number ?? 99)),
    [season2025],
  );
  const archive2024 = useMemo(
    () => [...(season2024 ?? [])].sort((a, b) => (a.number ?? 99) - (b.number ?? 99)),
    [season2024],
  );
  const records = recordData ?? [];
  const historical = season2023 ?? [];
  const transfers = useMemo(
    () => [...(transferData ?? [])].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [transferData],
  );

  const shown = useMemo(() => {
    if (filter === "全部") return players;
    if (filter === "外援") return players.filter(isForeign);
    if (filter === "U21") return players.filter((p) => p.u21);
    return players.filter((p) => p.position === filter);
  }, [players, filter]);

  const positionCounts = useMemo(
    () =>
      positions.map((pos) => ({
        name: pos,
        value: players.filter((p) => p.position === pos).length,
      })),
    [players],
  );

  const leaderboard = useMemo(
    () => players.filter((p) => p.goals > 0).sort((a, b) => b.goals - a.goals),
    [players],
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
          radius: ["58%", "80%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: true,
          itemStyle: { borderColor: chartColors.bg, borderWidth: 3 },
          label: { show: false },
          data: positionCounts
            .filter((d) => d.value > 0)
            .map((d) => ({ ...d, itemStyle: { color: positionColor[d.name] } })),
        },
      ],
      textStyle: baseTextStyle,
    }),
    [positionCounts],
  );

  const scorerOption = useMemo(
    () => ({
      backgroundColor: "transparent",
      grid: { left: 86, right: 30, top: 10, bottom: 22 },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(11,11,15,.94)",
        borderColor: chartColors.line,
        textStyle: { color: chartColors.ink, fontSize: 12 },
      },
      xAxis: {
        type: "value",
        minInterval: 1,
        splitLine: { lineStyle: { color: chartColors.line } },
        axisLabel: { color: chartColors.muted },
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: leaderboard.map((p) => p.name),
        axisLine: { lineStyle: { color: chartColors.line } },
        axisTick: { show: false },
        axisLabel: { color: chartColors.ink, fontSize: 13 },
      },
      series: [
        {
          type: "bar",
          data: leaderboard.map((p) => p.goals),
          barWidth: 12,
          itemStyle: { color: chartColors.red, borderRadius: [0, 6, 6, 0] },
          label: {
            show: true,
            position: "right",
            color: chartColors.gold,
            fontSize: 12,
          },
        },
      ],
      textStyle: baseTextStyle,
    }),
    [leaderboard],
  );

  const totalGoals = leaderboard.reduce((n, p) => n + p.goals, 0);

  return (
    <>
      <section className="page-head">
        <p className="kicker">SQUAD 2026</p>
        <h1>西北狼的阵容拼图</h1>
        <p className="lede">
          2026 赛季，球队在保留糜昊伦、梁少文等骨干的同时，引入阿兹拉克、塞尔马尼等外援，
          夏窗补报文俊杰、江文豪、夏合扎提等新面孔。以下 {players.length || "35"} 人为俱乐部与媒体公开报道
          可核实的赛季注册成员，含号码、位置、出生日期、身高体重与籍贯；未公开的身高体重未作推测。
          赛季中期王维朴、陈彦朴、阿卜杜瓦哈普、王宇翔四人转出，仍计入当季注册名单。
        </p>
        <div className="page-stats">
          <div><strong>{players.length}</strong><span>2026 阵容成员</span></div>
          <div><strong>{players.filter(isForeign).length}</strong><span>外援</span></div>
          <div><strong>{players.filter((p) => p.u21).length}</strong><span>U21 球员</span></div>
          <div><strong>51</strong><span>2026 赛季积分</span></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">STRUCTURE</p>
          <h2>阵容结构</h2>
          <p className="section-note">
            按门将、后卫、中场、前锋分组统计。号码、位置与身高体重取自中足联 2026 赛季注册名单，
            个别球员在注册资料中缺项，保持留空。
          </p>
        </div>

        <div className="grid grid-2">
          <Reveal>
            <div className="card chart-card">
              {loading ? (
                <div className="skeleton skeleton-chart" />
              ) : (
                <div className="chart-wrap">
                  <Chart
                    option={donutOption}
                    height={280}
                    label={`2026 阵容位置分布：${positionCounts
                      .map((p) => `${p.name} ${p.value} 人`)
                      .join("、")}`}
                  />
                  <div className="chart-center">
                    <strong>{players.length}</strong>
                    <span>人</span>
                  </div>
                </div>
              )}
              <div className="legend-row">
                {positionCounts.map((p) => (
                  <span key={p.name}>
                    <i className="dot" style={{ background: positionColor[p.name] }} />
                    {p.name} {p.value}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="card chart-card">
              {leaderboard.length === 0 ? (
                <div className="skeleton skeleton-chart" />
              ) : (
                <>
                  <Chart
                    option={scorerOption}
                    height={280}
                    label={`2026 赛季射手榜：${leaderboard
                      .map((p) => `${p.name} ${p.goals} 球`)
                      .join("、")}`}
                  />
                  <p className="chart-footnote">
                    2026 赛季全部 30 轮联赛与 3 场足协杯的球员进球，共 {totalGoals} 球；另有 1 粒对手乌龙。
                  </p>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">LEADERBOARD</p>
          <h2>2026 赛季球员数据榜</h2>
          <p className="section-note">
            出场、进球与助攻均取中足联 2026 中甲联赛官方统计（30 轮，不含足协杯），
            与战绩页逐场比分相互印证；足协杯进球单列在球员备注与战绩页。
            球员进球合计 56 球，与赛季 57 球的差额为对手乌龙球；出场时间与跑动数据暂无公开来源，未作估算。
          </p>
        </div>

        <div className="stat-board">
          <div className="stat-board-head" aria-hidden="true">
            <span>排名</span>
            <span>球员</span>
            <span>位置</span>
            <span>进球</span>
          </div>
          {leaderboard.map((p, i) => (
            <div className={`stat-row ${i < 3 ? "is-top" : ""}`} key={p.name}>
              <span className="stat-rank">{i + 1}</span>
              <span className="stat-player">
                {p.photo ? (
                  <img src={p.photo} alt="" loading="lazy" width={40} height={40} />
                ) : (
                  <i className="stat-avatar-fallback">{positionMark[p.position]}</i>
                )}
                <span>
                  <strong>{p.name}</strong>
                  <small>
                    {p.nationality}
                    {p.u21 ? " · U21" : ""}
                  </small>
                </span>
              </span>
              <span className="stat-pos">{p.position}</span>
              <span className="stat-value">
                {p.goals}
                {p.assists > 0 && <small> · {p.assists} 助攻</small>}
              </span>
            </div>
          ))}
        </div>
      </section>

      {records.length > 0 && (
        <section className="section">
          <div className="section-head">
            <p className="kicker">CLUB RECORDS</p>
            <h2>队史纪录</h2>
            <p className="section-note">
              口径统一为 2024—2026 三个赛季的联赛官方统计（2024 中乙、2025 与 2026 中甲），
              按球员逐赛季出场、进球、助攻与零封汇总；足协杯与 2023 中冠赛季未纳入。
            </p>
          </div>

          <div className="record-grid">
            {records.map((r) => (
              <Reveal key={r.key}>
                <article className="record-card">
                  <p className="record-title">{r.title}</p>
                  <p className="record-holder">{r.holder}</p>
                  <p className="record-value">
                    <strong>{r.value}</strong>
                    <span>{r.unit}</span>
                  </p>
                  <p className="record-detail">{r.detail}</p>
                  <p className="record-scope">{r.scope}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <p className="data-caveat">
            出场年龄按赛季 3 月 1 日计算，逐场阵容与首发时间无公开来源，因此「连续零封场次」
            与「最年轻首发」无法核实；零封为「球队零封且该门将在场」的官方统计口径。
          </p>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <p className="kicker">ROSTER</p>
          <h2>球员名单</h2>
          <p className="section-note">
            点击标签按位置、外援或 U21 筛选。号码、出生日期与身体数据来自中足联 2026 赛季
            注册名单，出场、首发、进球、助攻与出场分钟为中足联联赛统计，惯用脚来自直播吧
            球队资料，缺项留空；出生日期另经直播吧球员资料核对。
          </p>
        </div>

        <div className="filter-row" role="group" aria-label="按位置筛选">
          {filters.map((key) => (
            <button
              key={key}
              aria-pressed={filter === key}
              className={`chip-btn ${filter === key ? "is-active" : ""}`}
              onClick={() => setFilter(key)}
            >
              {key}
            </button>
          ))}
        </div>

        {error && <div className="state-box"><p>{error}</p></div>}

        <div className="player-grid">
          {loading &&
            [0, 1, 2, 3, 4, 5].map((i) => <div className="skeleton skeleton-card" key={i} />)}
          {!loading &&
            shown.map((p: Player, i) => (
              <Reveal key={p.name} delay={Math.min(i, 8) * 30}>
                <article className={`player-card ${p.captain ? "is-captain" : ""}`}>
                  <div className="player-photo-wrap">
                    {p.photo ? (
                      <img className="player-photo" src={p.photo} alt={`${p.name} 球员照片`} loading="lazy" />
                    ) : (
                      <span className="player-photo-fallback">{positionMark[p.position] ?? "·"}</span>
                    )}
                    {p.number != null && <span className="player-number">{p.number}</span>}
                  </div>
                  <div className="player-body">
                    <div className="player-title">
                      <h3>{p.name}</h3>
                      {p.captain && <span className="chip chip-captain">队长</span>}
                      {p.u21 && <span className="chip chip-u21">U21</span>}
                    </div>
                    <p className="player-meta">
                      <span>{p.position}</span>
                      <span className="dot-sep">·</span>
                      <span>{p.nationality}</span>
                    </p>
                    <p className="player-bio">
                      {p.birth_date || "出生日期待核实"}
                      {p.hometown ? ` · ${p.hometown}` : ""}
                      {p.height ? ` · ${p.height}cm` : ""}
                      {p.weight ? ` / ${p.weight}kg` : ""}
                      {p.foot ? ` · ${p.foot}` : ""}
                    </p>
                    {(p.appearances > 0 || p.goals > 0 || p.assists > 0) && (
                      <p className="player-goals">
                        <span className="stat stat-season">2026 中甲</span>
                        {[
                          p.appearances > 0 ? (
                            <span className="stat"><strong>{p.appearances}</strong> 场</span>
                          ) : null,
                          p.starts > 0 ? (
                            <span className="stat"><strong>{p.starts}</strong> 首发</span>
                          ) : null,
                          p.goals > 0 ? (
                            <span className="stat"><strong>{p.goals}</strong> 球</span>
                          ) : null,
                          p.assists > 0 ? (
                            <span className="stat"><strong>{p.assists}</strong> 助攻</span>
                          ) : null,
                          p.minutes > 0 ? (
                            <span className="stat"><strong>{p.minutes}</strong> 分钟</span>
                          ) : null,
                        ]
                          .filter(Boolean)
                          .map((s, i) => (
                            <span key={i} className="stat-sep"> · {s}</span>
                          ))}
                      </p>
                    )}
                    {p.note && <p className="player-note">{p.note}</p>}
                  </div>
                </article>
              </Reveal>
            ))}
        </div>

        {!loading && shown.length === 0 && (
          <div className="state-box"><p>该筛选条件下暂无球员。</p></div>
        )}

        <p className="data-caveat">
          名单为 2026 赛季注册成员，含夏窗与梯队补报。与直播吧 2026-11-10 的 31 人在册名单相比，
          王维朴、阿卜杜瓦哈普、王宇翔、陈彦朴、李小一 5 人不在其列，差额原因暂无公开说明；
          本站保留其赛季注册记录，不作删除或推测。
        </p>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">TRANSFERS</p>
          <h2>转会记录</h2>
          <p className="section-note">
            收录 2024—2026 赛季有公开数据可核实的转入与转出。日期、来源/去向俱乐部与德转同步身价
            来自直播吧球队资料，并与俱乐部官宣报道、当季一线队名单交叉核对。
          </p>
        </div>

        <div className="transfer-list">
          {transfers.map((t: Transfer) => (
            <article className="transfer-row" key={`${t.date}-${t.player_name}-${t.kind}`}>
              <div className="transfer-date">
                <strong>{t.date}</strong>
                <span>{t.season_year} 赛季</span>
              </div>
              <div className="transfer-body">
                <div className="transfer-title">
                  <h3>{t.player_name}</h3>
                  <span className={`chip transfer-${t.direction}`}>
                    {t.direction === "in" ? "转入" : "转出"}
                  </span>
                  <span className="chip">{t.kind}</span>
                </div>
                <p className="transfer-club">
                  {t.direction === "in" ? "来自" : "转至"} {t.club}
                  {t.fee ? ` · ${t.fee}` : ""}
                </p>
                <p className="transfer-note">{t.note}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="data-caveat">
          转会费为德转同步的估值口径，标「约」者并非俱乐部公布数字；未公开费用的自由转会与租借
          以「—」显示，未作估算。2026 年夏窗 4 笔转出据四家新东家的赛季名单补录，2023—2025
          赛季的转出记录仍不完整，页面暂不作补写。
        </p>
      </section>

      {olderPlayers.length > 0 && (
        <section className="section">
          <div className="section-head">
            <p className="kicker">ARCHIVE 2025</p>
            <h2>2025 赛季注册名单</h2>
            <p className="section-note">
              34 人注册名单据中足联 2025 赛季球员注册名单，号码、位置、国籍、出生日期与身高体重
              以注册资料为准；出场、进球、助攻为 2025 中甲联赛官方统计。未公开项留空，不作推测。
            </p>
          </div>

          <div className="roster-table">
            <div className="roster-head roster-head-2025" aria-hidden="true">
              <span>号码</span>
              <span>球员</span>
              <span>位置</span>
              <span>国籍</span>
              <span>出生日期</span>
              <span>备注</span>
            </div>
            {olderPlayers.map((p) => (
              <div className="roster-row roster-row-2025" key={`${p.number}-${p.name}`}>
                <span className="roster-number">{p.number ?? "—"}</span>
                <span className="roster-player">
                  {p.photo ? (
                    <img src={p.photo} alt="" loading="lazy" width={36} height={36} />
                  ) : (
                    <i className="stat-avatar-fallback">{positionMark[p.position] ?? "·"}</i>
                  )}
                  <strong>{p.name}</strong>
                  {p.captain && <span className="chip chip-captain">队长</span>}
                  {p.goals > 0 && <span className="chip">{p.goals} 球</span>}
                  {p.assists > 0 && <span className="chip chip-assist">{p.assists} 助攻</span>}
                </span>
                <span>
                  <span className="chip">{p.position}</span>
                </span>
                <span>{p.nationality}</span>
                <span>{p.birth_date || "—"}</span>
                <span className="roster-note">{p.note || "—"}</span>
              </div>
            ))}
          </div>

          <p className="data-caveat">
            出场、进球、助攻均为 2025 中甲联赛官方统计，34 人合计 466 场 48 球 31 助攻，
            与球队赛季 48 个联赛进球完全对应；足协杯与西部杯进球不计入，此前按各项赛事汇总的
            数字保留在备注中。开季 29 人公示名单中的号码与位置已按注册资料复核，夏窗加盟的
            塞尔马尼、魏志伟、马希伟、李小一与钟玮宏一并列入。
          </p>
        </section>
      )}

      {archive2024.length > 0 && (
        <section className="section">
          <div className="section-head">
            <p className="kicker">ARCHIVE 2024</p>
            <h2>2024 中乙赛季名单</h2>
            <p className="section-note">
              31 人名单据中乙官方注册名单，号码取自当季一线队大名单公示；身高、体重与出生日期
              按当季报名资料登记，籍贯为球员终身属性。夏窗补报的阮君、裴帅、高天语、
              帕尔曼江·克尤木、吴俊杰号码未公开，留空。
            </p>
          </div>

          <div className="roster-table">
            <div className="roster-head roster-head-2024" aria-hidden="true">
              <span>号码</span>
              <span>球员</span>
              <span>位置</span>
              <span>出生日期</span>
              <span>籍贯</span>
              <span>身高 / 体重</span>
              <span>出场 / 进球 / 助攻</span>
            </div>
            {archive2024.map((p) => (
              <div className="roster-row roster-row-2024" key={`${p.number}-${p.name}`}>
                <span className="roster-number">{p.number ?? "—"}</span>
                <span className="roster-player">
                  {p.photo ? (
                    <img src={p.photo} alt="" loading="lazy" width={36} height={36} />
                  ) : (
                    <i className="stat-avatar-fallback">{positionMark[p.position] ?? "·"}</i>
                  )}
                  <strong>{p.name}</strong>
                  {p.captain && <span className="chip chip-captain">队长</span>}
                </span>
                <span>
                  <span className="chip">{p.position}</span>
                </span>
                <span className="roster-facts">
                  <span>{p.birth_date || "—"}</span>
                  <span>{p.hometown || "—"}</span>
                  <span>
                    {p.height ? `${p.height}cm` : "—"} / {p.weight ? `${p.weight}kg` : "—"}
                  </span>
                </span>
                <span className="roster-note">
                  {p.appearances} 场 · {p.goals} 球 · {p.assists} 助攻
                </span>
              </div>
            ))}
          </div>

          <p className="data-caveat">
            出场、进球与助攻为 2024 中乙联赛官方统计，不含足协杯；张裕碹、白茗宇、李天乐
            当季联赛无出场记录。名单含夏窗补报球员，与赛季末在册人数可能不同。31 人全部为中国籍；
            籍贯按球员终身属性登记，2024 年新援中无公开来源者留空，曾效力 2023 赛季者沿用当季名单。
            当季无公开肖像的 16 名球员以位置标记代替头像。
          </p>
        </section>
      )}

      {historical.length > 0 && (
        <section className="section">
          <div className="section-head">
            <p className="kicker">ARCHIVE 2023</p>
            <h2>2023 中冠赛季名单</h2>
            <p className="section-note">
              建队首个赛季的 30 人名单，含号码、位置、身高、体重、出生日期与籍贯；
              头像取自当季官方名单板，按同一版式裁切。
            </p>
          </div>

          <div className="roster-table">
            <div className="roster-head" aria-hidden="true">
              <span>号码</span>
              <span>球员</span>
              <span>位置</span>
              <span>出生日期</span>
              <span>籍贯</span>
              <span>身高 / 体重</span>
            </div>
            {historical.map((p) => (
              <div className="roster-row" key={`${p.number}-${p.name}`}>
                <span className="roster-number">{p.number ?? "—"}</span>
                <span className="roster-player">
                  {p.photo ? (
                    <img src={p.photo} alt="" loading="lazy" width={36} height={36} />
                  ) : (
                    <i className="stat-avatar-fallback">{positionMark[p.position] ?? "·"}</i>
                  )}
                  <strong>{p.name}</strong>
                </span>
                <span>
                  <span className="chip">{p.position}</span>
                </span>
                <span>{p.birth_date}</span>
                <span>{p.hometown}</span>
                <span>
                  {p.height ? `${p.height}cm` : "—"} / {p.weight ? `${p.weight}kg` : "—"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <PlayerGallery />
    </>
  );
}
