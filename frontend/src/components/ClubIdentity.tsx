import { useState } from "react";
import { AssetCard, AssetLightbox, type Asset } from "./AssetGallery";
import { Reveal } from "./Reveal";

const crest: Asset = {
  id: "crest-current",
  title: "现役队徽",
  date: "2023-07-17 公示",
  image: "/media/identity/crest-current.webp",
  alt: "陕西联合现役队徽：红黑盾形，白色 UNION 字样，中央为黑色狼首",
  note: "盾形轮廓、西北狼图腾与古城墙剪影构成主体，顶部保留 UNION 字样。2024 年俱乐部更名后，队徽主体继续沿用。",
  sourceName: "百度百科 · 陕西联合足球俱乐部",
  sourceUrl: "https://baike.baidu.com/item/%E9%99%95%E8%A5%BF%E8%81%94%E5%90%88%E8%B6%B3%E7%90%83%E4%BF%B1%E4%B9%90%E9%83%A8/64010260",
  rights: "版权归陕西联合足球俱乐部所有，本站仅作非商业性资料展示。",
  contain: true,
};

const wordmark: Asset = {
  id: "wordmark",
  title: "队名标准字",
  date: "2024-01-27",
  image: "/media/identity/wordmark.webp",
  alt: "陕西联合队名标准字：SUFC 与陕西联合",
  note: "经会员投票并完成工商与足协审核后，俱乐部于 2024 年 1 月由陕西长安联合更名为陕西联合，标准字同步更新为 SUFC / 陕西联合。",
  sourceName: "西部网 · 陕西长安联合正式更名为陕西联合",
  sourceUrl: "http://news.cnwest.com/bwyc/a/2024/01/27/22283717.html",
  rights: "版权归陕西联合足球俱乐部所有，本站仅作非商业性资料展示。",
  plate: true,
};

const crest2023: Asset = {
  id: "crest-2023",
  title: "初版队徽（长安联合时期）",
  date: "2023-07-17",
  image: "/media/identity/crest-2023.webp",
  alt: "陕西长安联合初版队徽：盾形狼首与 CUFC、长安联合字样",
  note: "设计以「陕西长安联合」英文首字母 S、C、U 为基础型，融合西北狼简化图腾与古城墙剪影。当时俱乐部名称为陕西长安联合，缩写为 CUFC。",
  sourceName: "西安新闻网 · 陕西长安联合足球俱乐部公示队徽",
  sourceUrl: "https://www.xiancn.com/content/2023-07/18/content_6758329.htm",
  rights: "图片由俱乐部提供、西安新闻网刊发，版权归原权利人。",
};

const evolution = [
  {
    date: "2023-07-17",
    title: "新队徽公示",
    text: "俱乐部公示由球迷参与评选的新队徽：以 S、C、U 为基础型，西北狼图腾居中，古城墙剪影与看台轮廓构成盾形外框，顶部书写 UNION。",
  },
  {
    date: "2024-01-26",
    title: "更名与标准字更新",
    text: "陕西长安联合正式更名为陕西联合。队徽主体延续，队名标准字由 CUFC / 长安联合更新为 SUFC / 陕西联合。",
  },
  {
    date: "2026 赛季",
    title: "现役视觉继续使用",
    text: "2026 赛季，现役队徽与 SUFC 标准字继续用于球衣、主场物料与球迷助威旗帜，出现在西安国际足球中心的看台。",
  },
];

export function ClubIdentity() {
  const [active, setActive] = useState<Asset | null>(null);

  return (
    <>
      <section className="section" id="identity">
        <div className="section-head">
          <p className="kicker">CLUB IDENTITY</p>
          <h2>队徽与队标</h2>
          <p className="section-note">
            2023 年 7 月公示的新队徽以「陕西长安联合」英文首字母 S、C、U 为基础型，西北狼图腾居中，古城墙剪影与看台轮廓构成盾形外框。
          </p>
        </div>

        <div className="media-feature">
          <Reveal>
            <article className="media-crest-card">
              <div className="media-crest-stage">
                <img src={crest.image} alt={crest.alt} />
              </div>
              <div className="media-card-body">
                <p className="kicker">CURRENT CREST</p>
                <h2>{crest.title}</h2>
                <p className="media-card-note">{crest.note}</p>
                <div className="media-specs" aria-label="队徽设计要素">
                  <span>盾形外框</span>
                  <span>西北狼图腾</span>
                  <span>古城墙剪影</span>
                  <span>UNION</span>
                </div>
                <div className="media-actions">
                  <button className="chip-btn" type="button" onClick={() => setActive(crest)}>
                    查看大图
                  </button>
                  <a className="text-link" href={crest.image} download>
                    下载 WebP ↓
                  </a>
                </div>
                <p className="media-source">
                  来源：
                  <a href={crest.sourceUrl} target="_blank" rel="noreferrer noopener">
                    {crest.sourceName}
                  </a>
                </p>
                <p className="media-rights">{crest.rights}</p>
              </div>
            </article>
          </Reveal>

          <div className="media-side">
            <Reveal delay={80}>
              <AssetCard asset={wordmark} onOpen={setActive} />
            </Reveal>
            <Reveal delay={140}>
              <article className="media-card">
                <button
                  type="button"
                  className="media-thumb"
                  onClick={() => setActive(crest2023)}
                  aria-label={`查看大图：${crest2023.title}`}
                >
                  <img src={crest2023.image} alt={crest2023.alt} loading="lazy" />
                </button>
                <div className="media-card-body">
                  <div className="media-card-top">
                    <h3>{crest2023.title}</h3>
                    <span className="media-date">{crest2023.date}</span>
                  </div>
                  <p className="media-card-note">{crest2023.note}</p>
                  <p className="media-source">
                    来源：
                    <a href={crest2023.sourceUrl} target="_blank" rel="noreferrer noopener">
                      {crest2023.sourceName}
                    </a>
                  </p>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="kicker">EVOLUTION</p>
          <h2>队徽演化</h2>
        </div>
        <ol className="media-timeline">
          {evolution.map((item) => (
            <li key={item.date}>
              <time>{item.date}</time>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="section-note">
          本站不主张对俱乐部名称、队徽与标准字的所有权；图片来自公开报道或公开百科页面，仅作非商业性资料展示，商用需联系俱乐部或权利人。
        </p>
      </section>

      <AssetLightbox active={active} onClose={() => setActive(null)} />
    </>
  );
}
