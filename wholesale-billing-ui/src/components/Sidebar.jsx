import { NavLink, useNavigate } from "react-router-dom";
import { THEME } from "../utils/theme";
import Icon from "./ui/Icon";
import Badge from "./ui/Badge";

const menuGroups = [
  {
    section: "Commerce",
    items: [
      { title: "Dashboard", path: "/dashboard", icon: "layout-dashboard" },
      { title: "Invoices", path: "/invoices", icon: "file-text" },
      { title: "Retail Counter (POS)", path: "/billing/retail", icon: "zap", highlight: true },
    ],
  },
  {
    section: "Directory",
    items: [
      { title: "Customers", path: "/customers", icon: "users" },
      { title: "Product Catalogue", path: "/products", icon: "package" },
    ],
  },
  {
    section: "Finance",
    items: [
      { title: "Payment Receipts", path: "/payments", icon: "credit-card" },
    ],
  },
  {
    section: "Analytics & Audit",
    items: [
      { title: "Dues Aging", path: "/reports/dues", icon: "alert-triangle" },
      { title: "Sales Audit", path: "/reports/sales", icon: "bar-chart" },
    ],
  },
  {
    section: "Administration",
    adminOnly: true,
    items: [
      { title: "Staff & Users", path: "/users", icon: "shield-check" },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const rawRoles = Array.isArray(user?.roles) ? user.roles : (user?.roles ? Array.from(user.roles) : []);
  const roles = rawRoles.map((r) => (typeof r === "string" ? r.replace(/^ROLE_/, "") : r));
  const isAdmin = roles.includes("ADMIN");
  const primaryRole = roles[0] || "STAFF";

  const displayName =
    (user?.fullName || user?.username || "Admin")
      .split(" ")
      .slice(0, 2)
      .join(" ");
  const initials = (user?.fullName || user?.username || "A").charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  const visibleGroups = menuGroups
    .map((group) => {
      if (group.adminOnly && !isAdmin) return null;
      return group;
    })
    .filter(Boolean);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(2px)",
            zIndex: 90,
            display: "none",
          }}
          className="sidebar-mobile-backdrop"
        />
      )}

      <aside
        className={`app-sidebar ${isOpen ? "sidebar-open" : ""}`}
        style={{
          width: 240,
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          background: "#FFFFFF",
          borderRight: `1px solid ${THEME.colors.border}`,
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
          transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "0 0 20px rgba(0,0,0,0.02)",
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 60,
            padding: "0 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${THEME.colors.borderSubtle}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: THEME.radius.md,
                background: `linear-gradient(135deg, ${THEME.colors.primary} 0%, #3629A6 100%)`,
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(76, 60, 206, 0.3)",
              }}
            >
              <Icon name="store" size={17} color="#FFFFFF" />
            </div>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: THEME.colors.textPrimary,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                WB-Store
              </div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: THEME.colors.textMuted,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Commerce ERP
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              background: "none",
              border: "none",
              color: THEME.colors.textMuted,
              cursor: "pointer",
              padding: 4,
              borderRadius: THEME.radius.sm,
              display: "none",
            }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav
          style={{
            flex: 1,
            padding: "14px 12px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {visibleGroups.map((group) => (
            <div key={group.section}>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: THEME.colors.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "0 10px 6px",
                }}
              >
                {group.section}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024 && onClose) onClose();
                    }}
                    style={({ isActive }) => ({
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: THEME.radius.md,
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? THEME.colors.primary : THEME.colors.textSecondary,
                      background: isActive ? THEME.colors.primaryLight : "transparent",
                      transition: "all 0.12s ease",
                      border: isActive ? `1px solid rgba(76, 60, 206, 0.15)` : "1px solid transparent",
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Icon
                            name={item.icon}
                            size={17}
                            color={isActive ? THEME.colors.primary : THEME.colors.textSecondary}
                          />
                          <span>{item.title}</span>
                        </div>
                        {item.highlight && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              background: isActive ? THEME.colors.primary : "#E0F2FE",
                              color: isActive ? "#FFFFFF" : "#0284C7",
                              padding: "1px 6px",
                              borderRadius: "999px",
                              letterSpacing: "0.02em",
                            }}
                          >
                            POS
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer Profile */}
        <div
          style={{
            padding: "12px 14px",
            borderTop: `1px solid ${THEME.colors.borderSubtle}`,
            background: "#FAFAFD",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: THEME.colors.primaryLight,
                color: THEME.colors.primary,
                border: `1px solid rgba(76, 60, 206, 0.25)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: THEME.colors.textPrimary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                }}
              >
                {displayName}
              </div>
              <div style={{ marginTop: 2 }}>
                <Badge size="sm" variant={isAdmin ? "primary" : primaryRole === "MANAGER" ? "info" : "neutral"}>
                  {primaryRole}
                </Badge>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign out of account"
            style={{
              background: "none",
              border: "none",
              color: THEME.colors.textMuted,
              cursor: "pointer",
              padding: 6,
              borderRadius: THEME.radius.sm,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = THEME.colors.danger;
              e.currentTarget.style.background = THEME.colors.dangerBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = THEME.colors.textMuted;
              e.currentTarget.style.background = "none";
            }}
          >
            <Icon name="log-out" size={16} />
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 1024px) {
          .app-sidebar {
            transform: translateX(-100%);
          }
          .app-sidebar.sidebar-open {
            transform: translateX(0);
          }
          .sidebar-mobile-backdrop {
            display: block !important;
          }
          .sidebar-close-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
