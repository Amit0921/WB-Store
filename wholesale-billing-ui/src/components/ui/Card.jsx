import { THEME } from "../../utils/theme";

export default function Card({
  title,
  subtitle,
  action,
  children,
  padding = 20,
  style = {},
  headerStyle = {},
  bodyStyle = {},
  className = "",
  noBorder = false,
}) {
  const hasHeader = Boolean(title || subtitle || action);

  return (
    <div
      className={className}
      style={{
        background: THEME.colors.surface,
        borderRadius: THEME.radius.lg,
        border: noBorder ? "none" : `1px solid ${THEME.colors.border}`,
        boxShadow: THEME.shadows.card,
        overflow: "hidden",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        ...style,
      }}
    >
      {hasHeader && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${THEME.colors.borderSubtle}`,
            background: "#FFFFFF",
            gap: 12,
            ...headerStyle,
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: 700,
                  color: THEME.colors.textPrimary,
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "12px",
                  color: THEME.colors.textSecondary,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action && <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{action}</div>}
        </div>
      )}

      <div style={{ padding, ...bodyStyle }}>{children}</div>
    </div>
  );
}
