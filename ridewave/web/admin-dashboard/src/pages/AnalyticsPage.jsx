import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const revenueData = [
  { d: "Mon", revenue: 320000 },
  { d: "Tue", revenue: 360000 },
  { d: "Wed", revenue: 410000 },
  { d: "Thu", revenue: 380000 },
  { d: "Fri", revenue: 470000 }
];

export default function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics</h1>
      <div className="card">
        <h3>Revenue Over Time</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={revenueData}>
            <XAxis dataKey="d" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#1A1A2E" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="kpis">
        <div className="card"><h3>Driver Utilization</h3><p>78%</p></div>
        <div className="card"><h3>Cancellation Rate</h3><p>6.1%</p></div>
        <div className="card"><h3>Avg ETA</h3><p>4.8 min</p></div>
      </div>
    </div>
  );
}
