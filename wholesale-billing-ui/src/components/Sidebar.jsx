import { NavLink, useNavigate } from "react-router-dom";

const BRAND = "#4c3cce";

const menu = [
  {
    section: "Main",
    items: [
      { title: "Dashboard", path: "/dashboard", icon: "📊" },
      { title: "Customers",  path: "/customers",  icon: "👥" },
      { title: "Invoices",   path: "/invoices",   icon: "🧾" },
    ],
  },
  {
    section: "Finance",
    items: [
      { title: "Payments", path: "/payments", icon: "💳" },
    ],
  },
  {
    section: "Admin",
    items: [
      { title: "Users", path: "/users", icon: "👤" },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName =
    (user?.username || "User")
      .charAt(0)
      .toUpperCase() +
    (user?.username || "User").slice(1);
  const initials = (user.username || "A").charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside style={{
      width: 210,
      height: "100vh",
      position: "fixed",
      left: 0,
      top: 0,
      background: "#fff",
      borderRight: "1px solid #ede9fe",
      display: "flex",
      flexDirection: "column",
      zIndex: 50,
    }}>
      {/* Brand */}
      <div style={{
        display: "flex", alignItems: "center", gap: 9,
        padding: "18px 16px 14px",
        borderBottom: "1px solid #f0eeff",
        flexShrink: 0,
      }}>
        <div style={{
          width: 30, height: 30, background: BRAND, borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, flexShrink: 0,
        }}>🧾</div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#1e1b4b", letterSpacing: "-0.3px" }}>
          WB-Store
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 10px", overflowY: "auto" }}>
        {menu.map((group) => (
          <div key={group.section}>
            <div style={{
              fontSize: 10, color: "#a0aec0", textTransform: "uppercase",
              letterSpacing: "1px", padding: "10px 8px 4px", fontWeight: 600,
            }}>{group.section}</div>

            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: 8,
                  color: isActive ? BRAND : "#64748b",
                  textDecoration: "none", fontSize: 13, fontWeight: 500,
                  background: isActive ? "#ede9fe" : "transparent",
                  marginBottom: 2, transition: "all 0.12s",
                })}
              >
                {({ isActive }) => (
                  <>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13,
                      background: isActive ? BRAND : "transparent",
                      filter: isActive ? "none" : "grayscale(0.3)",
                    }}>
                      {item.icon}
                    </div>
                    {item.title}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: "12px 14px", borderTop: "1px solid #f0eeff",
        display: "flex", alignItems: "center", gap: 9, flexShrink: 0,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%", background: BRAND,
          color: "#fff", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0,
        }}>{initials}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#1e1b4b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displayName || "Test"}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8" }}>{user.fullName || "Test Data"}</div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out"
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 14, color: "#94a3b8", flexShrink: 0, padding: 2,
          }}
        >↩</button>
      </div>
    </aside>
  );
}