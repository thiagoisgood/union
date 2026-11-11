import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "首页" },
  { to: "/history", label: "历史沿革" },
  { to: "/squad", label: "球员" },
  { to: "/staff", label: "教练组" },
  { to: "/results", label: "战绩" },
  { to: "/stadium", label: "主场" },
  { to: "/fans", label: "球迷大会" },
  { to: "/progress", label: "开发进度" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header ref={headerRef} className={`nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="nav-inner">
        <Link to="/" className="brand" aria-label="陕西联合足球俱乐部首页">
          <span className="brand-badge" aria-hidden="true">
            <img src="/media/identity/crest-nav.webp" alt="" width={38} height={38} />
          </span>
          <span className="brand-text">
            <strong>陕西联合</strong>
            <em>SHAANXI UNION</em>
          </span>
        </Link>

        <nav id="main-nav" className={`nav-links ${open ? "is-open" : ""}`} aria-label="主导航">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) => (isActive ? "is-active" : "")}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button
          className={`nav-toggle ${open ? "is-open" : ""}`}
          aria-label={open ? "关闭菜单" : "打开菜单"}
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
