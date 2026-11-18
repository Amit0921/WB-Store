import { Link } from "react-router-dom";
import { THEME } from "../../utils/theme";
import Icon from "./Icon";
import Badge from "./Badge";

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs = [], // e.g. [{ label: "Commerce", path: "/dashboard" }, { label: "Invoices" }]
  actions = null,
  badge = null,
  badgeVariant = "primary",
  style = {},
}) {
  const renderBadge = () => {
    if (!badge) return null;
    if (typeof badge === "string") {
      return <Badge variant={badgeVariant}>{badge}</Badge>;
    }
    return badge;
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 24,
        flexWrap: "wrap",
        ...style,
      }}
    >
      <div>
        {breadcrumbs.length > 0 && (
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: "12px",
              color: THEME.colors.textMuted,
              marginBottom: 6,
            }}
          >
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              const linkPath = crumb.path || crumb.href;
              return (
                <span key={idx} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {linkPath && !isLast ? (
                    <Link
                      to={linkPath}
                      style={{
                        color: THEME.colors.textSecondary,
                        textDecoration: "none",
                        fontWeight: 500,
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = THEME.colors.primary)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = THEME.colors.textSecondary)}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span style={{ color: isLast ? THEME.colors.textPrimary : THEME.colors.textSecondary, fontWeight: isLast ? 600 : 500 }}>
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && <Icon name="chevron-right" size={11} color={THEME.colors.textMuted} />}
                </span>
              );
            })}
          </nav>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "22px",
              fontWeight: 800,
              color: THEME.colors.textPrimary,
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
            }}
          >
            {title}
          </h1>
          {renderBadge()}
        </div>

        {subtitle && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "13px",
              color: THEME.colors.textSecondary,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {actions}
        </div>
      )}
    </div>
  );
}
