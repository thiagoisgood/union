import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <strong>陕西联合足球俱乐部</strong>
          <span>Shaanxi Union Football Club · SUFC</span>
          <p>以陕西为家，为球迷而生</p>
        </div>
        <div className="footer-col">
          <h4>站内</h4>
          <Link to="/history">历史沿革</Link>
          <Link to="/results">战绩</Link>
          <Link to="/fans">球迷大会</Link>
          <Link to="/progress">开发进度</Link>
        </div>
        <div className="footer-col">
          <h4>数据说明</h4>
          <span>资料截至 2026-11-08</span>
          <span>来源均为公开网络信息</span>
          <Link to="/sources">查看全部来源</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>本站为球迷向信息可视化项目，非俱乐部官方站点。</span>
        <span>© {new Date().getFullYear()} union.mountainscene.top</span>
      </div>
    </footer>
  );
}
