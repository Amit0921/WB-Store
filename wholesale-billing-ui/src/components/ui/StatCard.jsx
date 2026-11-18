import { THEME } from "../../utils/theme";
import Icon from "./Icon";

export default function StatCard({
  label,
  title,
  value,
  subtext,
  caption,
  iconName,
  icon,
  variant = "primary", // primary, success, warning, danger, info
  loading = false,
  trend = null, // e.g. { positive: true, text: "+12% vs last month" }
  style = {},
  onClick,
}) {
  const displayLabel = label || title || "";
  const displaySubtext = subtext || caption || "";
  const displayIcon = iconName || icon || "bar-chart";
  const variantMap = {
    primary: {
      color: THEME.colors.primary,
      bg: THEME.colors.primaryLight,
      border: "rgba(76, 60, 206, 0.15)",
    },
    success: {
      color: THEME.colors.success,
      bg: THEME.colors.successBg,
      border: THEME.colors.successBorder,
    },
    warning: {
      color: THEME.colors.warning,
      bg: THEME.colors.warningBg,
      border: THEME.colors.warningBorder,
    },
    danger: {
      color: THEME.colors.danger,
      bg: THEME.colors.dangerBg,
      border: THEME.colors.dangerBorder,
    },
    info: {
      color: THEME.colors.info,
      bg: THEME.colors.infoBg,
      border: THEME.colors.infoBorder,
    },
  };

  const v = variantMap[variant] || variantMap.primary;

  return (
    <div
      onClick={onClick}
      style={{
        background: THEME.colors.surface,
        borderRadius: THEME.radius.lg,
        border: `1px solid ${THEME.colors.border}`,
        boxShadow: THEME.shadows.card,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: THEME.colors.textSecondary,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          {displayLabel}
        </span>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: THEME.radius.md,
            background: v.bg,
            color: v.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${v.border}`,
            flexShrink: 0,
          }}
        >
          <Icon name={displayIcon} size={18} color={v.color} />
        </div>
      </div>

      <div
        style={{
          fontSize: "24px",
          fontWeight: 800,
          color: THEME.colors.textPrimary,
          letterSpacing: "-0.03em",
          lineHeight: 1.2,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {loading ? (
          <span
            style={{
              display: "inline-block",
              width: "120px",
              height: "24px",
              background: "#F1F5F9",
              borderRadius: "4px",
              animation: "pulse 1.5s infinite",
            }}
          />
        ) : (
          value ?? "—"
        )}
      </div>

      {(displaySubtext || trend) && (
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: "12px" }}>
          {trend && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
                fontWeight: 600,
                color: trend.positive ? THEME.colors.success : THEME.colors.danger,
              }}
            >
              <Icon name={trend.positive ? "trending-up" : "trending-down"} size={13} />
              {trend.text}
            </span>
          )}
          {displaySubtext && <span style={{ color: THEME.colors.textMuted }}>{displaySubtext}</span>}
        </div>
      )}
    </div>
  );
}
