import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const chartData = [
  { hour: "08", rides: 25 },
  { hour: "10", rides: 42 },
  { hour: "12", rides: 58 },
  { hour: "14", rides: 73 },
  { hour: "16", rides: 65 },
  { hour: "18", rides: 89 }
];

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <div className="kpis">
        <div className="card"><h3>Active Rides</h3><p>142</p></div>
        <div className="card"><h3>Drivers Online</h3><p>318</p></div>
        <div className="card"><h3>Revenue Today</h3><p>LKR 1.2M</p></div>
        <div className="card"><h3>Avg Rating</h3><p>4.8</p></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Live Map</h3>
          <MapContainer center={[6.9271, 79.8612]} zoom={12} style={{ height: 320, borderRadius: 12 }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[6.93, 79.86]}><Popup>Driver #D-104</Popup></Marker>
            <Marker position={[6.94, 79.89]}><Popup>Ride #R-582</Popup></Marker>
          </MapContainer>
        </div>
        <div className="card">
          <h3>Rides per Hour</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="rides" stroke="#E94560" fill="#E94560" fillOpacity={0.25} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card">
        <h3>Recent Rides</h3>
        <table className="table">
          <thead><tr><th>Ride ID</th><th>Rider</th><th>Driver</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>R-921</td><td>Nimali</td><td>Kasun</td><td><span className="badge success">completed</span></td></tr>
            <tr><td>R-922</td><td>Chathura</td><td>Ruwan</td><td><span className="badge warning">started</span></td></tr>
            <tr><td>R-923</td><td>Tharindu</td><td>Nuwan</td><td><span className="badge error">cancelled</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
