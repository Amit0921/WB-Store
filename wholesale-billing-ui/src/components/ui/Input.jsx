import { useState } from "react";
import { THEME } from "../../utils/theme";
import Icon from "./Icon";

export default function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  icon = null,
  prefixIcon = null,
  iconRight = null,
  disabled = false,
  readOnly = false,
  name,
  id,
  list,
  autoComplete,
  onKeyDown,
  style = {},
  inputStyle = {},
  className = "",
}) {
  const [focused, setFocused] = useState(false);

  const activeIcon = icon || prefixIcon;
  const renderIcon = (ic) => {
    if (!ic) return null;
    if (typeof ic === "string") return <Icon name={ic} size={15} />;
    return ic;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, width: "100%", ...style }} className={className}>
      {label && (
        <label
          htmlFor={id || name}
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: error ? THEME.colors.danger : THEME.colors.textPrimary,
            letterSpacing: "-0.01em",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {label}
          {required && <span style={{ color: THEME.colors.danger }}>*</span>}
        </label>
      )}

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        {activeIcon && (
          <div
            style={{
              position: "absolute",
              left: 11,
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
              color: focused ? THEME.colors.primary : THEME.colors.textMuted,
              transition: "color 0.15s ease",
            }}
          >
            {renderIcon(activeIcon)}
          </div>
        )}

        <input
          id={id || name}
          name={name}
          type={type}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          list={list}
          autoComplete={autoComplete}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            height: 38,
            padding: `8px 12px 8px ${activeIcon ? "36px" : "12px"}`,
            paddingRight: iconRight ? "36px" : "12px",
            fontSize: "13px",
            fontFamily: THEME.typography.fontFamily,
            color: THEME.colors.textPrimary,
            background: disabled ? "#F8FAFC" : "#FFFFFF",
            border: `1px solid ${error ? THEME.colors.danger : focused ? THEME.colors.primary : THEME.colors.border}`,
            borderRadius: THEME.radius.md,
            boxShadow: focused
              ? `0 0 0 3px ${error ? "rgba(229, 72, 77, 0.16)" : THEME.colors.primaryFocus}`
              : "none",
            outline: "none",
            transition: "all 0.15s ease",
            boxSizing: "border-box",
            ...inputStyle,
          }}
        />

        {iconRight && (
          <div
            style={{
              position: "absolute",
              right: 10,
              display: "flex",
              alignItems: "center",
              color: THEME.colors.textMuted,
            }}
          >
            {iconRight}
          </div>
        )}
      </div>

      {error ? (
        <span style={{ fontSize: "11px", color: THEME.colors.danger, fontWeight: 500 }}>
          {error}
        </span>
      ) : helperText ? (
        <span style={{ fontSize: "11px", color: THEME.colors.textSecondary }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
}
