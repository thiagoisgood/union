import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { AnthemPlayer } from "../components/AnthemPlayer";
import { AssetCard, AssetLightbox, type Asset } from "../components/AssetGallery";
import { baseTextStyle, chartColors, Chart } from "../components/Chart";
import { Reveal } from "../components/Reveal";
import { useApi } from "../hooks";

const MEMBERS_2026 = 11511;
const MEMBERS_2025 = 11388;
const NEW_2026 = 2422;
const RETURNING = MEMBERS_2026 - NEW_2026;
const FOUNDING = 3796;
const FIRST_DAY_2026 = 5592;
const FIRST_DAY_2025 = 2423;
const FAN_STAKE = 35;
const NET_GROWTH = MEMBERS_2026 - MEMBERS_2025;

const terraceAssets: Asset[] = [
  {
    id: "flag-event",
    title: "活动队旗",
    date: "公开报道图片",
    image: "/media/identity/flag-event.webp",
    alt: "俱乐部活动现场展示的队旗，旗面印有队徽与 SUFC 陕西联合字样",
    note: "俱乐部活动中展示的队旗，旗面为盾形队徽与 SUFC / 陕西联合标准字。原图由西部网·陕西头条公开报道。",
    sourceName: "西部网 · 陕西头条",
    sourceUrl: "https://www.cnwest.com/",
    rights: "图片来自公开报道，版权归原权利人；本站仅作资料展示并标注来源。",
  },
  {
    id: "tifo",
    title: "看台巨幅队旗",
    date: "2026 赛季",
    image: "/media/identity/tifo.webp",
    alt: "西安国际足球中心看台上的巨幅狼标队旗与红色助威方阵",
    note: "西安国际足球中心看台的巨幅狼标旗帜。2026 赛季球队在此完成 15 个联赛主场，看台旗帜成为主场氛围的代表画面。",
    sourceName: "网易 · 西安地产房剑《联赛+足协杯，合计 441866 人》",
    sourceUrl: "https://www.163.com/dy/article/LB7V8A020515DC4C.html",
    rights: "图片来自公开报道，版权归原权利人；本站仅作资料展示并标注来源。",
  },
];

const assemblies = [
  {
    year: "2023",
    date: "2023-12-23",
    name: "首届球迷会员大会",
    location: "渭南市体育中心体育场",
    scale: "上万名会员到场 · 线上 150 万+ 人次",
    points: [
      "与陕西足球文化节合并举办，把会员大会放进球场。",
      "会员在大会期间参与俱乐部重大事项投票，会员制从章程走向现场。",
      "同期推进俱乐部更名投票：3,480 票赞成、总票数 3,780 票，赞成率约 92.1%。",
    ],
  },
  {
    year: "2024",
    date: "2024-10-26",
    name: "「陪伴·未来」球迷会员大会",
    location: "西安丝路欢乐世界",
    scale: "数千名球迷到场 · 线上同步直播",
    points: [
      "会员大会与「联合有梦」丝路音乐足球嘉年华合并，足球、音乐与城市生活同场。",
      "以「陪伴·未来」为主题，强调会员与俱乐部共同成长。",
      "同年 12 月完成会员董事与监事选举，球迷代表进入俱乐部治理结构。",
    ],
  },
  {
    year: "2025",
    date: "2025-12-26",
    name: "2025 年度暨第三届会员大会",
    location: "长安乐一带一路文化艺术中心 · 报告厅",
    scale: "约 500 名代表 · 281 名会员代表投票",
    points: [
      "据西安新闻网报道，这是中国足球历史上首次以会议形式进行的会员大会。",
      "表决通过 2025 年运营工作与竞训工作汇报；会员董事魏淦辉、监事支高星年度述职。",
      "通过 2026 四大目标：完善 16 岁以上梯队、推动球员留洋、降低运营亏损、在预算可控下大幅提升联赛名次。",
      "俱乐部披露 2025 年 1—11 月仍处亏损，由投资人补足；非营利组织注册进度同步通报。",
    ],
  },
];

const tiers = [
  { name: "荣耀会员", note: "会员体系中的高等级会员，参与会员董事与监事选举。" },
  { name: "参议会员", note: "参与俱乐部事务讨论与会员大会表决的会员等级。" },
  { name: "联合会员", note: "面向广大球迷的基础会员等级，享有会员礼包与购票权益。" },
  { name: "mini 会员", note: "轻量会员方案，需完成实名认证后享受对应权益。" },
  { name: "青年联盟会员", note: "面向 18—24 岁球迷的青年会员方案。" },
];

const stories = [
  {
    stat: "7 个月 — 77 岁",
    title: "同一片看台，不同的年龄",
    text: "2025 年会员大会上公布：俱乐部会员中年龄最小的只有 7 个月，最年长的 77 岁。足球把一代人甚至几代人放进同一个主场。",
  },
  {
    stat: "喀什",
    title: "最远的会员",
    text: "国内距西安最远的会员来自新疆喀什。对西北狼来说，主场不只属于西安或渭南，而是一条跨越西北的球迷路线。",
  },
  {
    stat: "2 个赛季",
    title: "主客场全勤",
    text: "终身荣誉会员张宏、会员陈美荣与田旭均连续两个赛季实现主客场全勤。从渭南主场到全国各地，他们用出勤记录定义「陪伴」。",
  },
  {
    stat: "1,801 票",
    title: "第 5 号终身荣誉会员",
    text: "2026 年 1 月，1,801 名会员参与投票，陕西省球迷协会荣誉会长柯兴平以 1,046 票当选第 5 号终身荣誉会员。他是陕西足球的「活化石」，也是《西北狼的故事》的作者。",
  },
];

const governance = [
  { value: "35%", label: "球迷非营利机构持有俱乐部股份" },
  { value: "281", label: "会员代表投票通过 2026 四大目标" },
  { value: "3,480 / 3,780", label: "俱乐部更名会员投票赞成票 / 总票数" },
  { value: "11,511", label: "2026 年会员总数（截至 2026-03 报道）" },
];

export function Fans() {
  const { data, loading, error } = useApi(api.fanEvents, []);
  const [assemblyIndex, setAssemblyIndex] = useState(2);
  const [growthMode, setGrowthMode] = useState<"total" | "firstDay">("total");
  const [terrace, setTerrace] = useState<Asset | null>(null);

  const active = assemblies[assemblyIndex];

  const fanEvents = useMemo(
    () => [...(data ?? [])].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [data],
  );

  const growthOption = useMemo(() => {
    const total = growthMode === "total";
    const names = total ? ["2023 创始会员", "2025 会员", "2026 会员"] : ["2025 首日", "2026 首日"];
    const values = total ? [FOUNDING, MEMBERS_2025, MEMBERS_2026] : [FIRST_DAY_2025, FIRST_DAY_2026];
    const max = total ? 14000 : 7000;
    return {
      backgroundColor: "transparent",
      grid: { left: 48, right: 24, top: 42, bottom: 44 },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(11,11,15,.94)",
        borderColor: chartColors.line,
        textStyle: { color: chartColors.ink, fontSize: 12 },
        formatter: (params: any) =>
          `${params[0].name}<br/>${Number(params[0].value).toLocaleString()} 人`,
      },
      xAxis: {
        type: "category",
        data: names,
        axisLine: { lineStyle: { color: chartColors.line } },
        axisTick: { show: false },
        axisLabel: { color: chartColors.ink, fontSize: 12, interval: 0 },
      },
      yAxis: {
        type: "value",
        max,
        splitLine: { lineStyle: { color: chartColors.line } },
        axisLabel: {
          color: chartColors.muted,
          formatter: (v: string | number) => Number(v).toLocaleString(),
        },
      },
      series: [
        {
          type: "bar",
          barWidth: total ? 44 : 56,
          data: values.map((v, i) => ({
            value: v,
            itemStyle: {
              color: i === values.length - 1 ? chartColors.red : chartColors.gold,
              borderRadius: [6, 6, 0, 0],
            },
          })),
          label: {
            show: true,
            position: "top",
            color: chartColors.ink,
            fontSize: 12,
            formatter: (p: any) => Number(p.value).toLocaleString(),
          },
        },
      ],
      textStyle: baseTextStyle,
    };
  }, [growthMode]);

  const compositionOption = useMemo(
    () => ({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(11,11,15,.94)",
        borderColor: chartColors.line,
        textStyle: { color: chartColors.ink, fontSize: 12 },
        formatter: "{b}<br/>{c} 人 · {d}%",
      },
      series: [
        {
          type: "pie",
          radius: ["58%", "80%"],
          center: ["50%", "50%"],
          itemStyle: { borderColor: chartColors.bg, borderWidth: 3 },
          label: { show: false },
          data: [
            { name: "2026 新加入", value: NEW_2026, itemStyle: { color: chartColors.red } },
            { name: "存量 / 续费会员", value: RETURNING, itemStyle: { color: chartColors.gold } },
          ],
        },
      ],
      textStyle: baseTextStyle,
    }),
    [],
  );

  const stakeOption = useMemo(
    () => ({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(11,11,15,.94)",
        borderColor: chartColors.line,
        textStyle: { color: chartColors.ink, fontSize: 12 },
        formatter: "{b}<br/>{d}%",
      },
      series: [
        {
          type: "pie",
          radius: ["60%", "82%"],
          center: ["50%", "50%"],
          itemStyle: { borderColor: chartColors.bg, borderWidth: 3 },
          label: { show: false },
          data: [
            { name: "球迷非营利机构", value: FAN_STAKE, itemStyle: { color: chartColors.red } },
            { name: "其他股东", value: 100 - FAN_STAKE, itemStyle: { color: "rgba(244,241,234,0.14)" } },
          ],
        },
      ],
      textStyle: baseTextStyle,
    }),
    [],
  );

  return (
    <>
      <section className="page-head">
        <p className="kicker">MEMBERS & FANS</p>
        <h1>球迷，是俱乐部的一半</h1>
        <p className="lede">
          陕西联合把会员制写进俱乐部章程：球迷不只是买票进场的人，也选举会员董事与监事、
          投票决定名称与赛季方案、在会员大会上审议运营与竞训报告。
        </p>
        <div className="page-stats">
          <div><strong>{MEMBERS_2026.toLocaleString()}</strong><span>2026 注册会员</span></div>
          <div><strong>{FOUNDING.toLocaleString()}</strong><span>2023 创始会员</span></div>
          <div><strong>3</strong><span>届会员大会</span></div>
          <div><strong>{FAN_STAKE}%</strong><span>球迷机构持股</span></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">MEMBERSHIP</p>
          <h2>从首批 3,796 到 11,511</h2>
          <p className="section-note">
            会员制从 2023 年起步。2026 年会员总数达到 11,511 人，其中新加入 2,422 人，
            较 2025 年的 11,388 人净增 {NET_GROWTH} 人。2023 年数字为首批创始会员，而非当年会员总数；
            2024 年会员总数暂未找到可靠公开数据。<Link to="/sources">来源 →</Link>
          </p>
        </div>

        <div className="grid grid-2">
          <Reveal>
            <div className="card chart-card">
              <div className="fan-toggle" role="group" aria-label="切换会员数据">
                <button
                  aria-pressed={growthMode === "total"}
                  className={`chip-btn ${growthMode === "total" ? "is-active" : ""}`}
                  onClick={() => setGrowthMode("total")}
                >
                  会员总数
                </button>
                <button
                  aria-pressed={growthMode === "firstDay"}
                  className={`chip-btn ${growthMode === "firstDay" ? "is-active" : ""}`}
                  onClick={() => setGrowthMode("firstDay")}
                >
                  首日开售
                </button>
              </div>
              <Chart
                option={growthOption}
                height={280}
                label={
                  growthMode === "total"
                    ? `会员规模增长柱状图：2023 创始会员 ${FOUNDING.toLocaleString()} 人、2025 年 ${MEMBERS_2025.toLocaleString()} 人、2026 年 ${MEMBERS_2026.toLocaleString()} 人`
                    : `会员首日开售柱状图：2025 年 ${FIRST_DAY_2025.toLocaleString()} 人、2026 年 ${FIRST_DAY_2026.toLocaleString()} 人`
                }
              />
              <p className="chart-footnote">
                {growthMode === "total"
                  ? "2023 年为首批创始会员数，2025 / 2026 为年度会员总数。"
                  : "2026 年会员首日售出 5,592 人，较 2025 年首日 2,423 人增长约 130%。"}
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="card chart-card">
              <div className="chart-wrap">
                <Chart
                  option={compositionOption}
                  height={260}
                  label={`2026 会员构成：新加入 ${NEW_2026.toLocaleString()} 人、存量或续费 ${RETURNING.toLocaleString()} 人`}
                />
                <div className="chart-center">
                  <strong>{MEMBERS_2026.toLocaleString()}</strong>
                  <span>2026 会员</span>
                </div>
              </div>
              <div className="legend-row">
                <span><i className="dot" style={{ background: chartColors.red }} />新加入 {NEW_2026.toLocaleString()}</span>
                <span><i className="dot" style={{ background: chartColors.gold }} />存量 / 续费 {RETURNING.toLocaleString()}</span>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="attendance-strip fan-strip">
          <div><strong>{NEW_2026.toLocaleString()}</strong><span>2026 新加入会员</span></div>
          <div><strong>{RETURNING.toLocaleString()}</strong><span>存量 / 续费会员</span></div>
          <div><strong>{FIRST_DAY_2026.toLocaleString()}</strong><span>2026 首日开售</span></div>
          <div><strong>+130%</strong><span>首日开售同比</span></div>
          <div><strong>≈ 40%</strong><span>创始会员持续续约率</span></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">ASSEMBLIES</p>
          <h2>三届会员大会</h2>
          <p className="section-note">
            从球场里的万人聚会，到报告厅里的会议式表决。形式在变，会员审议与投票的机制在延续。
          </p>
        </div>

        <div className="assembly-tabs" role="tablist" aria-label="选择会员大会">
          {assemblies.map((a, i) => (
            <button
              key={a.year}
              role="tab"
              id={`assembly-tab-${a.year}`}
              aria-selected={assemblyIndex === i}
              aria-controls="assembly-panel"
              className={`assembly-tab ${assemblyIndex === i ? "is-active" : ""}`}
              onClick={() => setAssemblyIndex(i)}
            >
              <strong>{a.year}</strong>
              <span>{a.name}</span>
            </button>
          ))}
        </div>

        <Reveal key={active.year}>
          <article
            className="assembly-panel"
            id="assembly-panel"
            role="tabpanel"
            aria-labelledby={`assembly-tab-${active.year}`}
          >
            <div className="assembly-panel-head">
              <div>
                <p className="kicker">{active.date}</p>
                <h3>{active.name}</h3>
              </div>
              <span className="chip">{active.location}</span>
            </div>
            <p className="assembly-scale">{active.scale}</p>
            <ul className="assembly-points">
              {active.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </article>
        </Reveal>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">GOVERNANCE</p>
          <h2>会员如何参与决策</h2>
          <p className="section-note">
            会员制不只体现在会员大会上：球迷机构持股、会员董事与监事、重大事项投票与年度述职，
            构成一套持续运转的治理结构。
          </p>
        </div>

        <div className="grid grid-2">
          <Reveal>
            <div className="card chart-card">
              <div className="chart-wrap">
                <Chart
                  option={stakeOption}
                  height={250}
                  label={`球迷非营利机构持有俱乐部 ${FAN_STAKE}% 股份，其余为其他股东持股`}
                />
                <div className="chart-center">
                  <strong>{FAN_STAKE}%</strong>
                  <span>球迷机构持股</span>
                </div>
              </div>
              <div className="legend-row">
                <span><i className="dot" style={{ background: chartColors.red }} />球迷非营利机构 {FAN_STAKE}%</span>
                <span><i className="dot" style={{ background: "rgba(244,241,234,0.35)" }} />其他股东 {100 - FAN_STAKE}%</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="card governance-card">
              <p className="kicker">CHECKS & BALANCES</p>
              <h3>球迷进入董事会与监事会</h3>
              <p>
                2024 年 12 月，会员投票产生会员董事张经峰、何宇明与会员监事支高星；
                2025 年会员大会上，时任会员董事魏淦辉、监事支高星作年度述职。重大事项由会员代表表决，
                非营利组织注册进度也向会员通报。
              </p>
              <div className="governance-list">
                {governance.map((g) => (
                  <div key={g.label}>
                    <strong>{g.value}</strong>
                    <span>{g.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">FAN STORIES</p>
          <h2>看台内外的人</h2>
          <p className="section-note">
            会员数据背后，是一个个具体的球迷：年龄最小的 7 个月，最年长的 77 岁，最远的来自喀什。
          </p>
        </div>

        <div className="fan-story-grid">
          {stories.map((s, i) => (
            <Reveal key={s.title} delay={i * 60}>
              <article className="fan-story">
                <strong>{s.stat}</strong>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="age-span" aria-label="会员年龄跨度：7 个月至 77 岁">
          <div className="age-span-track">
            <i />
          </div>
          <div className="age-span-labels">
            <span>7 个月</span>
            <span>会员年龄跨度</span>
            <span>77 岁</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">TIERS & RIGHTS</p>
          <h2>会员等级与权益</h2>
          <p className="section-note">
            公开信息显示，会员体系包含荣耀会员、参议会员、联合会员、mini 会员与青年联盟会员；
            会员可参与礼包样式、客场口号与比赛服主色调等事项投票。
          </p>
        </div>

        <div className="tier-grid">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 50}>
              <article className="tier-card">
                <span className="tier-index">{String(i + 1).padStart(2, "0")}</span>
                <h3>{t.name}</h3>
                <p>{t.note}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="fan-rights">
          <div><strong>投票</strong><span>会员大会表决、更名投票、终身荣誉会员选举</span></div>
          <div><strong>礼包</strong><span>会员礼包样式由会员投票决定，2026 年推出实体会员卡</span></div>
          <div><strong>购票</strong><span>会员购票权益与商家权益自 2026 年 1 月 1 日起生效</span></div>
          <div><strong>身份</strong><span>2023 创始会员 ID 永久保留；青年联盟面向 18—24 岁球迷</span></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">TERRACE</p>
          <h2>看台旗帜</h2>
          <p className="section-note">
            队旗出现在俱乐部活动与主场看台。巨幅狼标旗帜是西安国际足球中心 2026 赛季的标志性画面，点击图片可查看大图。
          </p>
        </div>
        <div className="media-grid">
          {terraceAssets.map((asset, index) => (
            <Reveal key={asset.id} delay={index * 60}>
              <AssetCard asset={asset} onOpen={setTerrace} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">ANTHEM</p>
          <h2>联合战歌</h2>
          <p className="section-note">
            站点原创器乐助威曲，可免费收听与下载。它不是俱乐部官方队歌，而是为这片看台写的一段声音注脚。
          </p>
        </div>
        <Reveal>
          <AnthemPlayer />
        </Reveal>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">MOMENTS</p>
          <h2>球迷大事记</h2>
          <p className="section-note">按时间倒序排列的会员大会、治理事件与看台时刻。</p>
        </div>

        {error && <div className="state-box"><p>{error}</p></div>}

        <div className="fan-event-list">
          {loading &&
            [0, 1, 2].map((i) => <div className="skeleton skeleton-card" key={i} />)}

          {!loading &&
            fanEvents.map((e, i) => (
              <Reveal key={`${e.date}-${e.name}`} delay={Math.min(i, 8) * 30}>
                <article className="fan-event-row">
                  <time>{e.date}</time>
                  <div>
                    <h3>{e.name}</h3>
                    <p className="fan-event-meta">
                      {e.location}
                      {e.attendance != null ? ` · ${e.attendance.toLocaleString()} 人` : ""}
                    </p>
                    <p className="fan-event-desc">{e.description}</p>
                  </div>
                </article>
              </Reveal>
            ))}
        </div>

        <p className="data-caveat">
          2024 年会员总数、部分会员等级的具体权益与 2025 年逐场主场上座仍在核实中，页面不作推测补写。
          来源见 <Link to="/sources">数据来源</Link>。
        </p>
      </section>

      <AssetLightbox active={terrace} onClose={() => setTerrace(null)} />
    </>
  );
}
