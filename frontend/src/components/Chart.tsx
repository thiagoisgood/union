import { lazy, Suspense } from "react";
import type { EChartsCoreOption } from "echarts/core";

export { baseTextStyle, chartColors } from "./chartTheme";

const EChart = lazy(() => import("./EChart").then((m) => ({ default: m.EChart })));

export function Chart({
  option,
  height = 320,
  label = "数据图表",
}: {
  option: EChartsCoreOption;
  height?: number;
  label?: string;
}) {
  return (
    <Suspense
      fallback={
        <div
          className="skeleton chart-loading"
          style={{ height }}
          role="status"
          aria-label="图表加载中"
        />
      }
    >
      <EChart option={option} height={height} label={label} />
    </Suspense>
  );
}
