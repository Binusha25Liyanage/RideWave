import React from "react";

export default function UsersPage() {
  return (
    <div>
      <h1>User Management</h1>
      <div className="card">
        <input className="input" placeholder="Search riders or drivers" />
        <table className="table" style={{ marginTop: 12 }}>
          <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Alex Silva</td><td>Rider</td><td>alex@mail.com</td><td>Active</td></tr>
            <tr><td>Dasun Perera</td><td>Driver</td><td>dasun@mail.com</td><td>Suspended</td></tr>
          </tbody>
        </table>
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <button className="btn">Export CSV</button>
          <button className="btn">Send Notification</button>
          <button className="btn danger">Suspend Selected</button>
        </div>
      </div>
    </div>
  );
}
