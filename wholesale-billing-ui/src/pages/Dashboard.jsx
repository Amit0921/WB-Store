import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getAllCustomers } from "../api/customerApi";
import { getAllUsers } from "../api/userApi";

const BRAND = "#4c3cce";

function initials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

const AV_COLORS = [
  { bg: "#ede9fe", color: "#4c3cce" },
  { bg: "#e0f2fe", color: "#0369a1" },
  { bg: "#fef9c3", color: "#854d0e" },
  { bg: "#fce7f3", color: "#9d174d" },
  { bg: "#dcfce7", color: "#166534" },
];
const avColor = (name = "") => AV_COLORS[name.charCodeAt(0) % AV_COLORS.length];

function StatCard({ label, value, icon, iconBg, valueColor = "#1e1b4b", trend }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #f0eeff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 500 }}>
          {label}
        </span>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: valueColor, lineHeight: 1 }}>{value}</div>
      {trend && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 5 }}>{trend}</div>}
    </div>
  );
}

const quickActions = [
  { label: "Add Customer", icon: "➕", path: "/customers/create" },
  { label: "Create Invoice", icon: "🧾", path: "/invoices/create" },
  { label: "Receive Payment", icon: "💳", path: "/payments/create" },
];

const thStyle = {
  padding: "9px 14px", textAlign: "left", color: "#94a3b8",
  fontWeight: 500, borderBottom: "1px solid #f0eeff",
  fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px",
};
const tdStyle = { padding: "10px 14px", borderBottom: "1px solid #faf9ff", fontSize: 13, color: "#374151" };

export default function Dashboard() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllCustomers(), getAllUsers()])
      .then(([c, u]) => {
        setCustomers(Array.isArray(c.data) ? c.data : Array.isArray(c) ? c : []);
        setUsers(Array.isArray(u.data) ? u.data : Array.isArray(u) ? u : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeCustomers = customers.filter((c) => c.status === "ACTIVE").length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName =
    (user?.username || "User")
      .charAt(0)
      .toUpperCase() +
    (user?.username || "User").slice(1);

  const stats = [
    { label: "Customers", value: loading ? "—" : customers.length, icon: "👥", iconBg: "#ede9fe", valueColor: BRAND, trend: `${activeCustomers} active` },
    { label: "Active", value: loading ? "—" : activeCustomers, icon: "✅", iconBg: "#dcfce7", valueColor: "#16a34a", trend: "of total customers" },
    { label: "Users", value: loading ? "—" : users.length, icon: "👤", iconBg: "#fef3c7", valueColor: "#d97706", trend: "system users" },
    { label: "Invoices", value: "0", icon: "🧾", iconBg: "#fee2e2", valueColor: "#dc2626", trend: "this month" },
  ];

  return (
    <MainLayout>
      <div style={{ padding: "20px 24px", background: "#f5f6fa", minHeight: "100%" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1e1b4b" }}>
              {greeting} {displayName}👋</h1>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => navigate("/invoices/create")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 18px", background: BRAND, color: "#fff",
              border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            ＋ Create Invoice
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 14 }}>
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </div>

        {/* ── Row 2 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 14 }}>
          {/* Business overview */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #f0eeff" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b", marginBottom: 14 }}>Business Overview</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {[
                { label: "Total Revenue", value: "₹0", color: BRAND },
                { label: "Received", value: "₹0", color: "#16a34a" },
                { label: "Pending", value: "₹0", color: "#dc2626" },
              ].map((o) => (
                <div key={o.label} style={{ background: "#f8f7ff", borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: o.color, marginBottom: 3 }}>{o.value}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{o.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #f0eeff" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b", marginBottom: 12 }}>Quick Actions</div>
            {quickActions.map((a) => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "9px 12px", background: "#f8f7ff",
                  border: "1px solid #ede9fe", borderRadius: 8,
                  fontSize: 12, fontWeight: 500, color: BRAND,
                  cursor: "pointer", width: "100%", marginBottom: 7,
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#ede9fe"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#f8f7ff"}
              >
                <div style={{ width: 24, height: 24, borderRadius: 6, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>
                  {a.icon}
                </div>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Recent customers ── */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #f0eeff", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid #f5f3ff" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1e1b4b" }}>Recent Customers</span>
            <span onClick={() => navigate("/customers")} style={{ fontSize: 11, color: BRAND, cursor: "pointer", fontWeight: 500 }}>
              View All →
            </span>
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Loading…</div>
          ) : customers.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No customers yet.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#faf9ff" }}>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Shop Name</th>
                  <th style={thStyle}>Phone</th>
                  <th style={thStyle}>Current Due</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.slice(0, 6).map((c) => {
                  const av = avColor(c.shopName || c.ownerName || "");
                  return (
                    <tr key={c.id}
                      onClick={() => navigate(`/customers/${c.id}/summary`)}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#faf9ff"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={tdStyle}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: av.bg, color: av.color,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 600, flexShrink: 0,
                          }}>
                            {initials(c.shopName || c.ownerName || "")}
                          </div>
                          {c.shopName || c.ownerName || "—"}
                        </div>
                      </td>
                      <td style={tdStyle}>{c.ownerName || c.shopName || "—"}</td>
                      <td style={tdStyle}>{c.phone || "—"}</td>
                      <td style={{ ...tdStyle, fontWeight: c.currentDue > 0 ? 600 : 400, color: c.currentDue > 0 ? "#dc2626" : "#374151" }}>
                        ₹{(c.currentDue || 0).toLocaleString("en-IN")}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: "inline-block", padding: "2px 9px", borderRadius: 12,
                          fontSize: 10, fontWeight: 600,
                          background: c.status === "ACTIVE" ? "#dcfce7" : "#fee2e2",
                          color: c.status === "ACTIVE" ? "#166534" : "#991b1b",
                        }}>{c.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </MainLayout>
  );
}