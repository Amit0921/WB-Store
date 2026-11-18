import { useState } from "react";
import { THEME } from "../../utils/theme";
import Icon from "./Icon";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon = null,
  iconRight = null,
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  style = {},
  className = "",
  title,
}) {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  const defaultIconSize = size === "sm" ? 13 : size === "lg" ? 16 : 14;

  const renderIcon = (ic) => {
    if (!ic) return null;
    if (typeof ic === "string") {
      return <Icon name={ic} size={defaultIconSize} />;
    }
    return ic;
  };

  const sizeStyles = {
    sm: { padding: "6px 12px", fontSize: "12px", height: "32px", gap: "6px", borderRadius: THEME.radius.md },
    md: { padding: "8px 16px", fontSize: "13px", height: "38px", gap: "7px", borderRadius: THEME.radius.md },
    lg: { padding: "10px 20px", fontSize: "14px", height: "44px", gap: "8px", borderRadius: THEME.radius.md },
  };

  const baseStyles = {
    primary: {
      bg: THEME.colors.primary,
      bgHover: THEME.colors.primaryHover,
      color: "#FFFFFF",
      border: "1px solid transparent",
      shadow: "0 1px 2px rgba(76, 60, 206, 0.2)",
    },
    secondary: {
      bg: "#FFFFFF",
      bgHover: "#F8FAFC",
      color: THEME.colors.textPrimary,
      border: `1px solid ${THEME.colors.border}`,
      shadow: THEME.shadows.xs,
    },
    outline: {
      bg: "transparent",
      bgHover: THEME.colors.primaryLight,
      color: THEME.colors.primary,
      border: `1px solid ${THEME.colors.primary}`,
      shadow: "none",
    },
    ghost: {
      bg: "transparent",
      bgHover: "#F1F5F9",
      color: THEME.colors.textSecondary,
      border: "1px solid transparent",
      shadow: "none",
    },
    danger: {
      bg: "#FFF1F2",
      bgHover: "#FFE4E6",
      color: THEME.colors.danger,
      border: `1px solid ${THEME.colors.dangerBorder}`,
      shadow: "none",
    },
    dangerSolid: {
      bg: THEME.colors.danger,
      bgHover: "#CD2B31",
      color: "#FFFFFF",
      border: "1px solid transparent",
      shadow: "0 1px 2px rgba(229, 72, 77, 0.2)",
    },
    success: {
      bg: THEME.colors.success,
      bgHover: "#128053",
      color: "#FFFFFF",
      border: "1px solid transparent",
      shadow: "0 1px 2px rgba(22, 163, 106, 0.2)",
    },
  };

  const v = baseStyles[variant] || baseStyles.primary;
  const sz = sizeStyles[size] || sizeStyles.md;

  const bg = hovered && !disabled && !loading ? v.bgHover : v.bg;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: THEME.typography.fontFamily,
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
        outline: "none",
        boxSizing: "border-box",
        whiteSpace: "nowrap",
        userSelect: "none",
        transform: active && !disabled && !loading ? "scale(0.98)" : "none",
        ...sz,
        backgroundColor: bg,
        color: v.color,
        border: v.border,
        boxShadow: v.shadow,
        ...style,
      }}
    >
      {loading ? (
        <span
          style={{
            width: 14,
            height: 14,
            border: "2px solid rgba(255,255,255,0.4)",
            borderTopColor: "currentColor",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.6s linear infinite",
          }}
        />
      ) : (
        icon && <span style={{ display: "inline-flex", alignItems: "center" }}>{renderIcon(icon)}</span>
      )}
      {children}
      {!loading && iconRight && <span style={{ display: "inline-flex", alignItems: "center" }}>{renderIcon(iconRight)}</span>}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}
