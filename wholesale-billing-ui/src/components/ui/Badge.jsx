import { THEME } from "../../utils/theme";
import Icon from "./Icon";

export default function Badge({ children, variant = "neutral", size = "md", icon = null, style = {} }) {
  const renderIcon = (ic) => {
    if (!ic) return null;
    if (typeof ic === "string") return <Icon name={ic} size={size === "sm" ? 11 : 13} />;
    return ic;
  };
  const variantStyles = {
    neutral: {
      bg: "#F1F3F9",
      color: "#475569",
      border: "1px solid #E2E8F0",
    },
    primary: {
      bg: THEME.colors.primaryLight,
      color: THEME.colors.primary,
      border: `1px solid rgba(76, 60, 206, 0.2)`,
    },
    success: {
      bg: THEME.colors.successBg,
      color: THEME.colors.successText,
      border: `1px solid ${THEME.colors.successBorder}`,
    },
    warning: {
      bg: THEME.colors.warningBg,
      color: THEME.colors.warningText,
      border: `1px solid ${THEME.colors.warningBorder}`,
    },
    danger: {
      bg: THEME.colors.dangerBg,
      color: THEME.colors.dangerText,
      border: `1px solid ${THEME.colors.dangerBorder}`,
    },
    info: {
      bg: THEME.colors.infoBg,
      color: THEME.colors.infoText,
      border: `1px solid ${THEME.colors.infoBorder}`,
    },
  };

  const sizeStyles = {
    sm: { padding: "2px 6px", fontSize: "11px", height: "20px" },
    md: { padding: "3px 8px", fontSize: "12px", height: "22px" },
    lg: { padding: "4px 10px", fontSize: "13px", height: "26px" },
  };

  // Auto-detect variant from common string values if none explicitly set
  let activeVariant = variant;
  if (typeof children === "string" && variant === "neutral") {
    const s = children.toUpperCase();
    if (["PAID", "ACTIVE", "COMPLETED", "SUCCESS"].includes(s)) activeVariant = "success";
    else if (["UNPAID", "CANCELLED", "INACTIVE", "DUE", "60+ DAYS"].includes(s)) activeVariant = "danger";
    else if (["PARTIAL", "PENDING", "31-60 DAYS"].includes(s)) activeVariant = "warning";
    else if (["ADMIN"].includes(s)) activeVariant = "primary";
    else if (["MANAGER", "0-30 DAYS"].includes(s)) activeVariant = "info";
    else if (["BILLING_STAFF"].includes(s)) activeVariant = "neutral";
  }

  const v = variantStyles[activeVariant] || variantStyles.neutral;
  const sz = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontWeight: 600,
        borderRadius: "9999px",
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        lineHeight: 1,
        ...v,
        ...sz,
        ...style,
      }}
    >
      {icon && <span style={{ display: "inline-flex", alignItems: "center" }}>{renderIcon(icon)}</span>}
      {children}
    </span>
  );
}
