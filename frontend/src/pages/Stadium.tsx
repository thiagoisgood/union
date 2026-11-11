import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, type Venue } from "../api";
import { AssetCard, AssetLightbox, type Asset } from "../components/AssetGallery";
import { baseTextStyle, chartColors, Chart } from "../components/Chart";
import { Reveal } from "../components/Reveal";
import { useApi } from "../hooks";

const LEAGUE_TOTAL = 409335;
const CUP_ATTENDANCE = 32531;
const COMBINED = LEAGUE_TOTAL + CUP_ATTENDANCE;
const LEAGUE_GAMES = 15;
const LEAGUE_AVERAGE = Math.round(LEAGUE_TOTAL / LEAGUE_GAMES);
const LEAGUE_AVERAGE_TEXT = LEAGUE_AVERAGE.toLocaleString("en-US");
const SINGLE_RECORD = 43937;
const FINAL_GAME = 38798;
const WEINAN_2024_HIGH = 28000;
const LEAGUE_SHARE = "18.69%";

const landmarks = [
  { name: "2024 渭南单场最高", value: WEINAN_2024_HIGH, note: "2024 中乙赛季" },
  { name: "2026 足协杯", value: CUP_ATTENDANCE, note: "6 月 19 日 vs 浙江队" },
  { name: "2026 联赛收官战", value: FINAL_GAME, note: "11 月 7 日 vs 广西恒宸" },
  { name: "2026 联赛单场纪录", value: SINGLE_RECORD, note: "4 月 5 日 vs 石家庄功夫" },
];

const timeline = [
  {
    year: "2024",
    venue: "陕西省体育场 → 渭南市体育中心",
    tag: "中乙",
    text: "俱乐部原计划分阶段落户陕西省体育场与西安国际足球中心；实际赛季前两个主场（4 月 6 日、4 月 11 日）在「圣朱雀」进行，4 月 27 日起主场移至渭南，此后 12 个主场均在渭南。渭南赛区全季吸引超 30 万人次，单场最高约 2.8 万人。",
  },
  {
    year: "2025",
    venue: "渭南市体育中心体育场",
    tag: "中甲元年",
    text: "首个中甲赛季继续以渭南为主场。32000 座的综合体育场成为「西北狼」的福地，球迷专列、公交接驳与「联合大集」让比赛日成为城市活动。",
  },
  {
    year: "2026",
    venue: "西安国际足球中心",
    tag: "回归西安",
    text: "主场正式回归西安，15 个联赛主场全部设于 6 万座专业足球场。联赛主场 409335 人、场均约 27289 人，单场最高 43937 人，包揽当季中甲上座前六。",
  },
];

const cityCards = [
  {
    kicker: "WEINAN",
    title: "渭南：福地与赛事经济",
    text: "32000 座的渭南市体育中心体育场在 2024—2025 年承接了球队的职业联赛主场。2024 赛季渭南主场吸引超 30 万人次，单场最高约 2.8 万人；球迷专列、公交接驳专线与场外「联合大集」把比赛日变成全城节日。",
    stat: "30 万+",
    statLabel: "2024 赛季渭南主场人次",
  },
  {
    kicker: "XI'AN",
    title: "西安：回到专业足球场",
    text: "2026 年，球队主场回归西安，进驻西咸新区沣东新城的西安国际足球中心。这座 60235 座的专业足球场让陕西球迷第一次在家门口坐进专业球场；地铁 16 号线与跨城球迷流线，成为比赛日的城市景观。",
    stat: "43,937",
    statLabel: "2026 单场最高上座",
  },
  {
    kicker: "SAINT VERMILION",
    title: "圣朱雀：记忆的坐标",
    text: "陕西省体育场始建于 1954 年，被陕西球迷称为「圣朱雀」，见证过国力、浐灞与长安竞技的时代。2024 年球队在此完成 4 月 6 日、4 月 11 日两个主场，让沉寂多年的看台重新响起助威声。",
    stat: "43,000",
    statLabel: "改造后座位数",
  },
];

const venuePhotos: Record<string, Asset> = {
  "西安国际足球中心": {
    id: "xian-home",
    title: "西安国际足球中心 · 主场看台",
    date: "2026-11-08",
    image: "/media/stadium/xian-interior-1.webp",
    alt: "西安国际足球中心内部，环形屋顶下的红色看台坐满观众，中央是绿色草坪",
    note: "2026 赛季的主场看台。该赛季 15 个联赛主场全部设于西安国际足球中心。",
    sourceName: "网易 · 西安地产房剑",
    sourceUrl: "https://www.163.com/dy/article/LB7V8A020515DC4C.html",
    rights: "图片来自公开报道，版权归原权利人；本站仅作资料展示并标注来源。",
  },
  "陕西省体育场": {
    id: "shaanxi-home",
    title: "陕西省体育场 · 看台与草坪",
    date: "2020-08-14",
    image: "/media/stadium/shaanxi-stands.webp",
    alt: "陕西省体育场改造后的红色看台、绿色草坪与背景中的城市高楼",
    note: "2020 年改造完成后的「圣朱雀」。2024 赛季陕西联合在此完成 4 月 6 日、4 月 11 日两个主场。原图带央广网水印，已保留。",
    sourceName: "央广网",
    sourceUrl: "https://www.cnr.cn/sxpd/sx/20200814/t20200814_525205946.shtml",
    rights: "图片来自公开报道，版权归原权利人；本站仅作资料展示并标注来源。",
  },
  "渭南市体育中心体育场": {
    id: "weinan-home",
    title: "渭南市体育中心体育场 · 内场",
    date: "2021-04-02",
    image: "/media/stadium/weinan-bowl.webp",
    alt: "渭南市体育中心体育场内场，红色看台环抱绿色草坪",
    note: "32000 座的渭南市体育中心体育场。2024 中乙与 2025 中甲赛季在此承办陕西联合主场，2024 赛季主场吸引超 30 万人次。",
    sourceName: "腾讯新闻 · 华商网",
    sourceUrl: "https://new.qq.com/rain/a/20210402A02IAD00",
    rights: "图片来自公开报道，版权归原权利人；本站仅作资料展示并标注来源。",
  },
};

const stadiumAssets: Asset[] = [
  {
    id: "xian-full",
    title: "西安国际足球中心 · 满场",
    date: "2026-11-08",
    image: "/media/stadium/xian-interior-2.webp",
    alt: "西安国际足球中心看台满场，红色助威方阵与记分屏",
    note: "2026 赛季西安国际足球中心的上座景象。该赛季单场最高 43937 人（4 月 5 日 vs 石家庄功夫），包揽中甲上座前六。",
    sourceName: "网易 · 西安地产房剑",
    sourceUrl: "https://www.163.com/dy/article/LB7V8A020515DC4C.html",
    rights: "图片来自公开报道，版权归原权利人；本站仅作资料展示并标注来源。",
  },
  {
    id: "xian-aerial",
    title: "西安国际足球中心 · 鸟瞰草坪",
    date: "2025-08-27",
    image: "/media/stadium/xian-aerial.webp",
    alt: "西安国际足球中心草坪鸟瞰，环形屋顶开口露出天空",
    note: "2025 年 8 月落成的西安国际足球中心，固定座位 6 万个，是陕西首座专业足球场。",
    sourceName: "搜狐 · 西安国际足球中心震撼落成",
    sourceUrl: "https://www.sohu.com/a/929048664_122504187",
    rights: "图片来自公开报道，版权归原权利人；本站仅作资料展示并标注来源。",
  },
  {
    id: "shaanxi-aerial",
    title: "陕西省体育场 · 城市中的圣朱雀",
    date: "2020-08-14",
    image: "/media/stadium/shaanxi-aerial.webp",
    alt: "城市建筑群中的陕西省体育场鸟瞰，椭圆看台与绿色草坪",
    note: "位于西安城中的陕西省体育场。始建于 1954 年，1996 年、2018 年两次翻修，2020 年改造后为 43000 座。原图带央广网水印，已保留。",
    sourceName: "央广网",
    sourceUrl: "https://www.cnr.cn/sxpd/sx/20200814/t20200814_525205946.shtml",
    rights: "图片来自公开报道，版权归原权利人；本站仅作资料展示并标注来源。",
  },
  {
    id: "weinan-fans",
    title: "渭南看台 · 感谢渭南",
    date: "2025-03-30",
    image: "/media/stadium/weinan-fans.webp",
    alt: "渭南市体育中心看台球迷举起红色「感谢渭南」横幅",
    note: "2025 赛季渭南主场的球迷横幅。渭南在 2024—2025 年承接球队职业联赛主场，2024 赛季主场吸引超 30 万人次。",
    sourceName: "新华网 · 足球与渭南的「双向奔赴」",
    sourceUrl: "http://sn.news.cn/20250330/dd47748ff95e4c0fa0f912a18aa636b8/c.html",
    rights: "图片来自公开报道，版权归原权利人；本站仅作资料展示并标注来源。",
  },
  {
    id: "weinan-away",
    title: "渭南看台 · 客场在渭南",
    date: "2025-03-30",
    image: "/media/stadium/weinan-away.webp",
    alt: "渭南市体育中心看台球迷举起「客场在渭南 WELCOME」横幅",
    note: "球迷在看台打出「客场在渭南」横幅。跨城追随是陕西球迷的比赛日日常，主场迁移没有中断看台文化。",
    sourceName: "新华网 · 足球与渭南的「双向奔赴」",
    sourceUrl: "http://sn.news.cn/20250330/dd47748ff95e4c0fa0f912a18aa636b8/c.html",
    rights: "图片来自公开报道，版权归原权利人；本站仅作资料展示并标注来源。",
  },
];

export function Stadium() {
  const { data, loading, error } = useApi(api.venues, []);
  const [photo, setPhoto] = useState<Asset | null>(null);

  const venues = useMemo(
    () => [...(data ?? [])].sort((a, b) => b.capacity - a.capacity),
    [data],
  );

  const capacityOption = useMemo(
    () => ({
      backgroundColor: "transparent",
      grid: { left: 128, right: 74, top: 16, bottom: 24 },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(11,11,15,.94)",
        borderColor: chartColors.line,
        textStyle: { color: chartColors.ink, fontSize: 12 },
        formatter: (params: any) =>
          `${params[0].name}<br/>座位 ${Number(params[0].value).toLocaleString()} 个`,
      },
      xAxis: {
        type: "value",
        max: 64000,
        splitLine: { lineStyle: { color: chartColors.line } },
        axisLabel: {
          color: chartColors.muted,
          formatter: (v: string | number) => `${Number(v) / 10000} 万`,
        },
      },
      yAxis: {
        type: "category",
        data: [...venues].reverse().map((v: Venue) => v.name),
        axisLine: { lineStyle: { color: chartColors.line } },
        axisTick: { show: false },
        axisLabel: { color: chartColors.ink, fontSize: 12 },
      },
      series: [
        {
          type: "bar",
          barWidth: 24,
          data: [...venues].reverse().map((v: Venue, i: number) => ({
            value: v.capacity,
            itemStyle: {
              color: i === venues.length - 1 ? chartColors.red : i === 1 ? chartColors.gold : chartColors.redSoft,
              borderRadius: [0, 6, 6, 0],
            },
          })),
          label: {
            show: true,
            position: "right",
            color: chartColors.ink,
            fontSize: 12,
            formatter: "{c}",
          },
        },
      ],
      textStyle: baseTextStyle,
    }),
    [venues],
  );

  const shareOption = useMemo(
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
            { name: "中甲联赛主场", value: LEAGUE_TOTAL, itemStyle: { color: chartColors.red } },
            { name: "足协杯主场", value: CUP_ATTENDANCE, itemStyle: { color: chartColors.gold } },
          ],
        },
      ],
      textStyle: baseTextStyle,
    }),
    [],
  );

  const landmarkOption = useMemo(
    () => ({
      backgroundColor: "transparent",
      grid: { left: 132, right: 60, top: 16, bottom: 24 },
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
        type: "value",
        max: 50000,
        splitLine: { lineStyle: { color: chartColors.line } },
        axisLabel: {
          color: chartColors.muted,
          formatter: (v: string | number) => `${Number(v) / 10000} 万`,
        },
      },
      yAxis: {
        type: "category",
        data: landmarks.map((d) => d.name),
        axisLine: { lineStyle: { color: chartColors.line } },
        axisTick: { show: false },
        axisLabel: { color: chartColors.ink, fontSize: 11 },
      },
      series: [
        {
          type: "bar",
          barWidth: 18,
          data: landmarks.map((d, i) => ({
            value: d.value,
            itemStyle: {
              color: i === landmarks.length - 1 ? chartColors.red : chartColors.gold,
              borderRadius: [0, 6, 6, 0],
            },
          })),
          label: {
            show: true,
            position: "right",
            color: chartColors.ink,
            fontSize: 11,
            formatter: (p: any) => Number(p.value).toLocaleString(),
          },
        },
      ],
      textStyle: baseTextStyle,
    }),
    [],
  );

  return (
    <>
      <section className="page-head">
        <p className="kicker">HOME & CITY</p>
        <h1>三座球场，一座足球城</h1>
        <p className="lede">
          从「圣朱雀」到渭南的 32000 座综合体育场，再到 60235 座的西安国际足球中心。
          球场更迭的背后，是陕西联合的主场迁移，也是陕西球迷跨城追随的路线。
        </p>
        <div className="page-stats">
          <div><strong>3</strong><span>座主场球场</span></div>
          <div><strong>60,235</strong><span>最大座位数</span></div>
          <div><strong>{LEAGUE_AVERAGE_TEXT}</strong><span>2026 联赛主场场均</span></div>
          <div><strong>{SINGLE_RECORD.toLocaleString()}</strong><span>2026 单场最高</span></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">VENUES</p>
          <h2>三座球场的档案</h2>
          <p className="section-note">
            容量与启用信息来自新华网、央广网、腾讯新闻、渭南市体育局、直播吧与俱乐部公告；陕西省体育场容量为 2018—2020
            年改造后的数据。<Link to="/sources">详细来源 →</Link>
          </p>
        </div>

        {error && <div className="state-box"><p>{error}</p></div>}

        <div className="venue-grid">
          {loading &&
            [0, 1, 2].map((i) => <div className="skeleton skeleton-card" key={i} />)}

          {!loading &&
            venues.map((v: Venue, i: number) => {
              const photoAsset = venuePhotos[v.name];
              return (
                <Reveal key={v.name} delay={i * 70}>
                  <article className={`venue-card ${i === 0 ? "is-primary" : ""}`}>
                    {photoAsset && (
                      <button
                        type="button"
                        className="venue-photo"
                        onClick={() => setPhoto(photoAsset)}
                        aria-label={`查看大图：${photoAsset.title}`}
                      >
                        <img src={photoAsset.image} alt={photoAsset.alt} loading="lazy" />
                      </button>
                    )}
                    <div className="venue-top">
                      <span className="venue-city">{v.city}</span>
                      <span className="chip">{v.years} 主场</span>
                    </div>
                    <h3>{v.name}</h3>
                    <div className="venue-numbers">
                      <div>
                        <strong>{v.capacity > 0 ? v.capacity.toLocaleString() : "待核实"}</strong>
                        <span>座位数</span>
                      </div>
                      <div>
                        <strong>{v.opened || "待核实"}</strong>
                        <span>启用 / 始建</span>
                      </div>
                    </div>
                    <div className="venue-cap-track" aria-hidden="true">
                      <i style={{ width: `${(v.capacity / 60235) * 100}%` }} />
                    </div>
                    <p className="venue-note">{v.note}</p>
                    {photoAsset && (
                      <p className="venue-photo-credit">图片：{photoAsset.sourceName}</p>
                    )}
                  </article>
                </Reveal>
              );
            })}
        </div>

        <div className="section-head media-subhead">
          <p className="kicker">STADIUM IN FRAME</p>
          <h2>球场影像</h2>
          <p className="section-note">
            三座主场的内场、看台与球迷横幅，照片按球场归类，点击可查看大图。
          </p>
        </div>
        <div className="media-grid">
          {stadiumAssets.map((asset, index) => (
            <Reveal key={asset.id} delay={index * 60}>
              <AssetCard asset={asset} onOpen={setPhoto} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">CAPACITY</p>
          <h2>容量对比</h2>
          <p className="section-note">
            西安国际足球中心是陕西首座 6 万座专业足球场；渭南与陕西省体育场均为带田径跑道的综合体育场。
          </p>
        </div>

        <div className="grid grid-2">
          <Reveal>
            <div className="card chart-card">
              <div className="chart-wrap">
                {loading ? (
                  <div className="skeleton skeleton-chart" />
                ) : (
                  <Chart
                    option={capacityOption}
                    height={250}
                    label={`三座主场容量对比：${venues
                      .map((v) => `${v.name} ${v.capacity.toLocaleString("en-US")} 座`)
                      .join("、")}`}
                  />
                )}
              </div>
              <p className="chart-footnote">单位：座位。陕西省体育场为改造后 43000 座。</p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="card venue-fact-card">
              <p className="kicker">WHY IT MATTERS</p>
              <h3>专业球场改变了什么</h3>
              <div className="venue-fact-list">
                <div>
                  <strong>72.9%</strong>
                  <span>2026 单场纪录 43937 人，约占西安国际足球中心 60235 座的 72.9%</span>
                </div>
                <div>
                  <strong>6 / 6</strong>
                  <span>2026 赛季中甲上座人数 TOP6 全部来自西安国际足球中心</span>
                </div>
                <div>
                  <strong>{LEAGUE_SHARE}</strong>
                  <span>陕西联合 2026 联赛主场上座占整个中甲约 219 万人次的 18.69%</span>
                </div>
              </div>
              <p className="venue-fact-note">
                陕西省体育场改造前为 50100 座，2020 年改造后缩减至 43000 座；
                渭南市体育中心体育场为乙级体育场，建筑面积 37740 平方米。
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">ATTENDANCE</p>
          <h2>看台上的数字</h2>
          <p className="section-note">
            2026 赛季，陕西联合联赛主场 15 场共 409335 人，场均约 {LEAGUE_AVERAGE_TEXT} 人；
            加上足协杯主场，合计 441866 人。
          </p>
        </div>

        <div className="grid grid-2">
          <Reveal>
            <div className="card chart-card">
              <div className="chart-wrap">
                <Chart
                  option={shareOption}
                  height={260}
                  label={`2026 主场人次构成：联赛 ${LEAGUE_TOTAL.toLocaleString("en-US")} 人、足协杯 ${CUP_ATTENDANCE.toLocaleString("en-US")} 人，合计 ${COMBINED.toLocaleString("en-US")} 人`}
                />
                <div className="chart-center">
                  <strong>{COMBINED.toLocaleString()}</strong>
                  <span>2026 主场总人次</span>
                </div>
              </div>
              <div className="legend-row">
                <span><i className="dot" style={{ background: chartColors.red }} />联赛 {LEAGUE_TOTAL.toLocaleString()}</span>
                <span><i className="dot" style={{ background: chartColors.gold }} />足协杯 {CUP_ATTENDANCE.toLocaleString()}</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="card chart-card">
              <Chart
                option={landmarkOption}
                height={250}
                label={`单场上座里程碑：2026 赛季单场最高 ${SINGLE_RECORD.toLocaleString("en-US")} 人，收官战 ${FINAL_GAME.toLocaleString("en-US")} 人，2024 渭南单场最高约 ${WEINAN_2024_HIGH.toLocaleString("en-US")} 人`}
              />
              <p className="chart-footnote">
                单场上座里程碑；2025 赛季逐场数据尚待核实，因此未纳入比较。
              </p>
            </div>
          </Reveal>
        </div>

        <div className="attendance-strip">
          <div><strong>409,335</strong><span>2026 联赛主场人次</span></div>
          <div><strong>{LEAGUE_AVERAGE_TEXT}</strong><span>2026 联赛场均</span></div>
          <div><strong>{SINGLE_RECORD.toLocaleString()}</strong><span>2026 单场最高</span></div>
          <div><strong>32,531</strong><span>足协杯主场</span></div>
          <div><strong>30 万+</strong><span>2024 渭南主场人次</span></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">HOME JOURNEY</p>
          <h2>主场迁移路线</h2>
          <p className="section-note">
            从西安到渭南，再回到西安。每一次迁移都伴随球场条件、城市支持与球迷动线的变化。
          </p>
        </div>

        <div className="venue-timeline">
          {timeline.map((t, i) => (
            <Reveal key={t.year} delay={i * 80}>
              <article className="venue-timeline-row">
                <div className="venue-timeline-year">
                  <strong>{t.year}</strong>
                  <span>{t.tag}</span>
                </div>
                <div className="venue-timeline-body">
                  <h3>{t.venue}</h3>
                  <p>{t.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">CITY & FANS</p>
          <h2>球场之外的城市</h2>
          <p className="section-note">
            比赛日不只是 90 分钟：跨城专列、地铁客流、场外市集与城市记忆，共同构成陕西的主场文化。
          </p>
        </div>

        <div className="city-grid">
          {cityCards.map((c, i) => (
            <Reveal key={c.kicker} delay={i * 70}>
              <article className="city-card">
                <p className="kicker">{c.kicker}</p>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                <div className="city-stat">
                  <strong>{c.stat}</strong>
                  <span>{c.statLabel}</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <p className="data-caveat">
          2025 赛季逐场主场上座数据仍在核实中，页面不作推测补写。
          详细来源见 <Link to="/sources">数据来源</Link>。
        </p>
      </section>

      <AssetLightbox active={photo} onClose={() => setPhoto(null)} />
    </>
  );
}
