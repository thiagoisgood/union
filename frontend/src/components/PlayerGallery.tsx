import { useState } from "react";
import { AssetCard, AssetLightbox, type Asset } from "./AssetGallery";
import { Reveal } from "./Reveal";

const photos: Asset[] = [
  {
    id: "squad-2024",
    title: "2024 赛季全队合影",
    date: "2024-09-22",
    image: "/media/players/team-2024.webp",
    alt: "2024 赛季陕西联合全队赛前合影，球员手持「吾心向陕 联合无畏」标语牌",
    note: "赛前全队与「吾心向陕，联合无畏」标语牌合影。球员身穿白色主场球衣，标语牌中央为盾形队徽。该轮球队主场 2:1 绝杀深圳青年人，重回积分榜第二。",
    sourceName: "搜狐体育《压哨绝杀 陕西联合2:1深圳青年人重回积分榜第二》",
    sourceUrl: "https://news.sohu.com/a/810988670_119877",
    rights: "图片来自公开报道，版权归原权利人；本站仅作资料展示并标注来源。",
    facts: [
      { label: "赛事", value: "2024 中乙联赛 第 24 轮" },
      { label: "对手", value: "深圳青年人" },
      { label: "结果", value: "主场 2:1（胡明天 90+6′）" },
      { label: "上座", value: "19,113 人" },
    ],
  },
  {
    id: "squad-2023",
    title: "2023 长安联合全家福",
    date: "2023-09-01",
    image: "/media/players/team-2023.webp",
    alt: "2023 年陕西长安联合中冠总决赛阶段全家福，背景为看台",
    note: "中冠总决赛阶段全家福，队徽与队名仍为「陕西长安联合」。当季球队以总排名第 3 升入中乙，这张合影记录了建队首个赛季的阵容。",
    sourceName: "懂球帝《陕西长安联合中冠总决赛阶段「全家福、大名单」》",
    sourceUrl: "https://m.dongqiudi.com/article.html?id=3686112",
    rights: "图片来自公开报道，版权归原权利人；本站仅作资料展示并标注来源。",
  },
  {
    id: "derby-2024",
    title: "陕西德比 · 五连胜庆祝",
    date: "2024-06",
    image: "/media/players/derby-2024.webp",
    alt: "陕西联合球员在陕西德比中庆祝进球，看台为红色助威方阵",
    note: "2024 赛季中乙陕西德比，陕西联合 2:0 战胜西安崇德荣海，迎来五连胜。画面为球员冲向看台庆祝的瞬间。",
    sourceName: "搜狐体育《中乙上演陕西德比 陕西联合2-0西安崇德荣海迎五连胜》（图片：阳光网）",
    sourceUrl: "http://www.sohu.com/a/784910677_119877",
    rights: "图片来自公开报道，画面带有阳光网水印；版权归原权利人，本站仅作资料展示。",
  },
  {
    id: "xie-zhiwei-2024",
    title: "谢志伟 · 中乙第 2 轮最佳球员",
    date: "2024-04-03",
    image: "/media/players/xie-zhiwei-2024.webp",
    alt: "2024 中乙联赛第 2 轮最佳球员谢志伟官方海报",
    note: "官方评选海报。谢志伟在该轮贡献 1 球、4 次射门、66 次传球、创造机会 2 次，当选 2024 赛季中乙联赛第 2 轮最佳球员。",
    sourceName: "腾讯新闻《官方：陕西联合球员谢志伟当选中乙第2轮最佳球员》",
    sourceUrl: "http://new.qq.com/rain/a/20240403A09FVB00",
    rights: "海报由联赛官方与俱乐部发布，版权归原权利人；本站仅作资料展示。",
    contain: true,
  },
  {
    id: "action-2025",
    title: "2025 中甲 · 逆转领头羊",
    date: "2025-09-14",
    image: "/media/players/action-2025.webp",
    alt: "2025 赛季中甲联赛陕西联合球员在比赛中凌空射门",
    note: "2025 赛季中甲，陕西联合 3:1 逆转战胜当季领头羊辽宁铁人。画面为球员在禁区前沿凌空起脚的瞬间。",
    sourceName: "搜狐体育《3:1！陕西联合逆转战胜中甲领头羊》",
    sourceUrl: "https://www.sohu.com/a/934831398_119877",
    rights: "图片来自公开报道，版权归原权利人；本站仅作资料展示并标注来源。",
  },
];

export function PlayerGallery() {
  const [active, setActive] = useState<Asset | null>(null);
  const [feature, ...rest] = photos;

  return (
    <section className="section" id="players">
      <div className="section-head">
        <p className="kicker">SQUAD IN FRAME</p>
        <h2>球员影像</h2>
        <p className="section-note">
          从 2023 年建队全家福到 2025 赛季中甲赛场。照片均出自公开报道或联赛官方发布，日期与赛事背景逐张核对，点击可查看大图。
        </p>
      </div>

      <Reveal>
        <div className="player-feature">
          <button
            type="button"
            className="player-stage"
            onClick={() => setActive(feature)}
            aria-label={`查看大图：${feature.title}`}
          >
            <img src={feature.image} alt={feature.alt} loading="lazy" />
          </button>
          <div className="player-feature-body">
            <span className="media-date">{feature.date}</span>
            <h3>{feature.title}</h3>
            <p className="media-card-note">{feature.note}</p>
            {feature.facts && (
              <dl className="player-facts">
                {feature.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <blockquote className="player-quote">吾心向陕，联合无畏</blockquote>
            <p className="media-source">
              来源：
              <a href={feature.sourceUrl} target="_blank" rel="noreferrer noopener">
                {feature.sourceName}
              </a>
            </p>
            <p className="media-rights">{feature.rights}</p>
          </div>
        </div>
      </Reveal>

      <div className="media-grid media-grid-players">
        {rest.map((photo, index) => (
          <Reveal key={photo.id} delay={index * 60}>
            <AssetCard asset={photo} onOpen={setActive} />
          </Reveal>
        ))}
      </div>

      <AssetLightbox active={active} onClose={() => setActive(null)} />
    </section>
  );
}
