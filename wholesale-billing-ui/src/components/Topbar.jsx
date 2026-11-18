import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { THEME } from "../utils/theme";
import Icon from "./ui/Icon";
import Badge from "./ui/Badge";

export default function Topbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const roles = Array.isArray(user?.roles) ? user.roles : (user?.roles ? Array.from(user.roles) : []);
  const primaryRole = roles[0] || "STAFF";
  const initials = (user?.fullName || user?.username || "A").charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Route to appropriate search page based on query or customer search
    navigate(`/customers?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header
      className="app-topbar"
      style={{
        height: 60,
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: `1px solid ${THEME.colors.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left Area: Mobile Menu Trigger + Global Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, maxWidth: 480 }}>
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
          className="topbar-menu-toggle"
          style={{
            background: "none",
            border: `1px solid ${THEME.colors.border}`,
            color: THEME.colors.textSecondary,
            padding: "6px 8px",
            borderRadius: THEME.radius.md,
            cursor: "pointer",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="menu" size={18} />
        </button>

        <form onSubmit={handleSearchSubmit} style={{ position: "relative", width: "100%", maxWidth: 360 }}>
          <div
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: THEME.colors.textMuted,
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <Icon name="search" size={15} />
          </div>

          <input
            type="text"
            placeholder="Search customers, bills, or items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              height: 34,
              padding: "6px 42px 6px 32px",
              background: "#F8FAFC",
              border: `1px solid ${THEME.colors.border}`,
              borderRadius: THEME.radius.md,
              fontSize: "12px",
              color: THEME.colors.textPrimary,
              outline: "none",
              transition: "all 0.15s ease",
            }}
            onFocus={(e) => {
              e.target.style.background = "#FFFFFF";
              e.target.style.borderColor = THEME.colors.primary;
              e.target.style.boxShadow = `0 0 0 3px ${THEME.colors.primaryFocus}`;
            }}
            onBlur={(e) => {
              e.target.style.background = "#F8FAFC";
              e.target.style.borderColor = THEME.colors.border;
              e.target.style.boxShadow = "none";
            }}
          />

          <span
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "10px",
              fontWeight: 700,
              color: THEME.colors.textMuted,
              background: "#FFFFFF",
              border: `1px solid ${THEME.colors.border}`,
              padding: "2px 5px",
              borderRadius: 4,
              pointerEvents: "none",
            }}
          >
            ↵
          </span>
        </form>
      </div>

      {/* Right Area: Store Status + Quick Actions + User Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Market Status Pill */}
        <div
          className="store-status-pill"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#F1F5F9",
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 600,
            color: THEME.colors.textSecondary,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: THEME.colors.success,
              display: "inline-block",
              boxShadow: "0 0 0 2px rgba(22, 163, 106, 0.2)",
            }}
          />
          Surat Market • Counter Active
        </div>

        {/* Quick POS Link */}
        <Link
          to="/billing/retail"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: THEME.radius.md,
            background: "#E0F2FE",
            color: "#0369A1",
            border: "1px solid #BAE6FD",
            fontSize: "12px",
            fontWeight: 700,
            textDecoration: "none",
            transition: "all 0.15s ease",
          }}
        >
          <Icon name="zap" size={14} color="#0369A1" />
          <span className="pos-btn-text">Quick POS</span>
        </Link>

        {/* User Profile Dropdown */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: profileOpen ? "#F1F5F9" : "transparent",
              border: "1px solid transparent",
              padding: "4px 8px",
              borderRadius: THEME.radius.md,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: THEME.colors.primary,
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>

            <div style={{ textAlign: "left", lineHeight: 1.1 }} className="topbar-user-info">
              <div style={{ fontSize: "12px", fontWeight: 700, color: THEME.colors.textPrimary }}>
                {user?.fullName || user?.username || "Admin"}
              </div>
              <div style={{ fontSize: "10px", color: THEME.colors.textMuted }}>{primaryRole}</div>
            </div>

            <Icon name="chevron-down" size={13} color={THEME.colors.textMuted} />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                marginTop: 6,
                width: 220,
                background: "#FFFFFF",
                borderRadius: THEME.radius.md,
                boxShadow: THEME.shadows.modal,
                border: `1px solid ${THEME.colors.border}`,
                padding: "6px",
                zIndex: 60,
                animation: "modalFadeIn 0.15s ease-out",
              }}
            >
              <div style={{ padding: "8px 10px 10px", borderBottom: `1px solid ${THEME.colors.borderSubtle}` }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: THEME.colors.textPrimary }}>
                  {user?.fullName || "System User"}
                </div>
                <div style={{ fontSize: "11px", color: THEME.colors.textMuted, marginTop: 2 }}>
                  @{user?.username} {user?.email ? `• ${user.email}` : ""}
                </div>
                <div style={{ marginTop: 6 }}>
                  <Badge size="sm" variant={primaryRole === "ADMIN" ? "primary" : "info"}>
                    {primaryRole}
                  </Badge>
                </div>
              </div>

              <div style={{ padding: "6px 0 2px" }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    background: "none",
                    border: "none",
                    borderRadius: THEME.radius.sm,
                    color: THEME.colors.danger,
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.12s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = THEME.colors.dangerBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  <Icon name="log-out" size={15} color={THEME.colors.danger} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .topbar-menu-toggle {
            display: inline-flex !important;
          }
          .store-status-pill {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .topbar-user-info {
            display: none !important;
          }
          .pos-btn-text {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
