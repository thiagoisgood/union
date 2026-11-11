import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "https://union.mountainscene.top";
const SITE_NAME = "陕西联合足球俱乐部";
const OG_IMAGE = `${SITE}/og-cover.png`;

type PageMeta = {
  title: string;
  description: string;
  noindex?: boolean;
};

const routes: Record<string, PageMeta> = {
  "/": {
    title: "陕西联合足球俱乐部 · 西北狼的联合之路",
    description:
      "陕西联合足球俱乐部（Shaanxi Union FC）历史与数据可视化：球队沿革、球员、教练组、主场、战绩与球迷大会。",
  },
  "/history": {
    title: "历史沿革 · 从彬州辉龙到中甲季军",
    description:
      "陕西联合四年三级跳的完整时间线：2013 年前身成立、2023 中冠冲乙、2024 中乙第 4、2025 中甲首季、2026 中甲季军，并收录队徽公示、更名与队徽演化。",
  },
  "/squad": {
    title: "球员阵容 · 2026 赛季名单与位置结构",
    description:
      "2026 赛季陕西联合球员名单、位置分布、外援构成与已收录比赛的进球贡献，并收录 2023—2025 赛季全队合影与赛场影像。",
  },
  "/staff": {
    title: "教练组 · 五任主帅执教沿革",
    description:
      "从奥斯卡到陈涛，陕西联合五任主教练的任期、履历与执教数据，以及教练组其他成员构成。",
  },
  "/results": {
    title: "战绩中心 · 2023—2026 赛季比赛与积分",
    description:
      "陕西联合 2023 至 2026 赛季的胜平负结构、主客场表现与已收录比赛列表，支持赛季与主客场筛选。",
  },
  "/stadium": {
    title: "主场与城市 · 三座球场与上座数据",
    description:
      "陕西省体育场、渭南市体育中心与西安国际足球中心三座主场档案及球场影像，以及 2026 赛季 44 万人次上座数据。",
  },
  "/fans": {
    title: "球迷大会 · 会员制与球迷文化",
    description:
      "陕西联合会员制治理、三届球迷会员大会、11,511 名 2026 会员的数据画像与球迷故事，含看台巨幅队旗、助威影像与可免费收听的原创主题曲《联合战歌》。",
  },
  "/progress": {
    title: "开发进度 · 逐轮迭代记录",
    description:
      "本站按模块逐轮补充与核验的公开记录：前 10 轮完成主体建设，此后逐页核对数据、修正表述，并列出仍待核实的事项。",
  },
  "/sources": {
    title: "数据来源 · 公开资料清单",
    description:
      "陕西联合数据可视化站引用的全部公开来源清单，以及来源引用、比分与日期格式的实时自检结果。",
  },
};

const fallback: PageMeta = {
  title: "页面未找到",
  description: "你访问的页面不存在，请从导航返回陕西联合足球俱乐部数据站首页。",
  noindex: true,
};

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function PageMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname !== "/" ? pathname.replace(/\/+$/, "") : "/";
    const meta = routes[path] ?? fallback;
    const fullTitle = path === "/" ? meta.title : `${meta.title} · ${SITE_NAME}`;
    const canonical = `${SITE}${path === "/" ? "/" : path}`;

    document.title = fullTitle;
    setMeta("name", "description", meta.description);
    setMeta("name", "robots", meta.noindex ? "noindex, follow" : "index, follow");

    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:locale", "zh_CN");
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:image", OG_IMAGE);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:image:alt", "陕西联合足球俱乐部数据可视化站");

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", meta.description);
    setMeta("name", "twitter:image", OG_IMAGE);

    setCanonical(canonical);
  }, [pathname]);

  return null;
}
