import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Nav } from "./components/Nav";
import { PageMeta } from "./components/PageMeta";
import { BackToTop, ScrollProgress } from "./components/ScrollUX";

const Home = lazy(() => import("./pages/Home").then((m) => ({ default: m.Home })));
const History = lazy(() => import("./pages/History").then((m) => ({ default: m.History })));
const Squad = lazy(() => import("./pages/Squad").then((m) => ({ default: m.Squad })));
const Staff = lazy(() => import("./pages/Staff").then((m) => ({ default: m.Staff })));
const Results = lazy(() => import("./pages/Results").then((m) => ({ default: m.Results })));
const Stadium = lazy(() => import("./pages/Stadium").then((m) => ({ default: m.Stadium })));
const Fans = lazy(() => import("./pages/Fans").then((m) => ({ default: m.Fans })));
const Progress = lazy(() => import("./pages/Progress").then((m) => ({ default: m.Progress })));
const Sources = lazy(() => import("./pages/Sources").then((m) => ({ default: m.Sources })));
const ComingSoon = lazy(() =>
  import("./pages/ComingSoon").then((m) => ({ default: m.ComingSoon })),
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        跳到主要内容
      </a>
      <ScrollProgress />
      <ScrollToTop />
      <PageMeta />
      <Nav />
      <main id="main" tabIndex={-1} key={location.pathname} className="page">
        <Suspense
          fallback={
            <div className="page-loading" role="status" aria-live="polite">
              <div className="skeleton skeleton-card" />
              <span>正在加载页面…</span>
            </div>
          }
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/squad" element={<Squad />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/results" element={<Results />} />
            <Route path="/stadium" element={<Stadium />} />
            <Route path="/fans" element={<Fans />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/sources" element={<Sources />} />
            <Route
              path="*"
              element={
                <ComingSoon stage="404" title="页面未找到" desc="你访问的页面不存在，请从导航返回。" />
              }
            />
          </Routes>
        </Suspense>
      </main>
      <BackToTop />
      <Footer />
    </div>
  );
}
