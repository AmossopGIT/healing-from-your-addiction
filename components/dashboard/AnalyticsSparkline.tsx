"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";
import type { AnalyticsDailyPoint } from "@/lib/analytics/types";

export function AnalyticsSparkline({ data }: { data: AnalyticsDailyPoint[] }) {
  if (!data.length) {
    return <div className="dashboard-sparkline dashboard-sparkline-empty">No trend yet</div>;
  }

  return (
    <div className="dashboard-sparkline">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="pageViews" stroke="#0f5b52" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
