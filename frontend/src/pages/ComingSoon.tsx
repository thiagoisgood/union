import { Link } from "react-router-dom";

export function ComingSoon({
  stage,
  title,
  desc,
}: {
  stage: string;
  title: string;
  desc: string;
}) {
  return (
    <section className="page-head coming">
      <p className="kicker">{stage}</p>
      <h1>{title}</h1>
      <p className="lede">{desc}</p>
      <div className="hero-actions">
        <Link className="btn btn-solid" to="/progress">
          查看开发进度
        </Link>
        <Link className="btn btn-ghost" to="/">
          返回首页
        </Link>
      </div>
      <div className="coming-lines" aria-hidden="true">
        <span /><span /><span />
      </div>
    </section>
  );
}
