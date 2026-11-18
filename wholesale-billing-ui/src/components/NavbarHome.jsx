import { useNavigate } from "react-router-dom";
import { THEME } from "../utils/theme";
import Icon from "./ui/Icon";
import Button from "./ui/Button";

export default function NavbarHome({
  buttonText = "Sign In to Store",
  buttonPath = "/login",
}) {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 40px",
        height: 70,
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: `1px solid ${THEME.colors.border}`,
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand */}
      <div
        onClick={() => navigate("/")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: THEME.radius.md,
            background: `linear-gradient(135deg, ${THEME.colors.primary} 0%, #3629A6 100%)`,
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(76, 60, 206, 0.3)",
          }}
        >
          <Icon name="store" size={20} color="#FFFFFF" />
        </div>

        <div>
          <div
            style={{
              fontSize: "17px",
              fontWeight: 800,
              color: THEME.colors.textPrimary,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            WB-Store
          </div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: THEME.colors.textSecondary,
              letterSpacing: "0.01em",
            }}
          >
            Wholesale &amp; Retail Garments ERP
          </div>
        </div>
      </div>

      {/* Nav Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          className="navbar-home-badge"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "12px",
            color: THEME.colors.textSecondary,
            background: "#F8FAFC",
            padding: "6px 12px",
            borderRadius: "999px",
            border: `1px solid ${THEME.colors.border}`,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: THEME.colors.success,
              boxShadow: "0 0 0 2px rgba(22, 163, 106, 0.2)",
            }}
          />
          GST-Ready • Version 2.4
        </div>

        <Button
          onClick={() => navigate(buttonPath)}
          iconRight={<Icon name="arrow-right" size={14} />}
        >
          {buttonText}
        </Button>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .navbar-home-badge {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
