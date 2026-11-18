import { useState } from "react";
import { THEME } from "../../utils/theme";
import Icon from "./Icon";

export default function Select({
  label,
  value,
  onChange,
  children,
  options = [],
  required = false,
  error,
  helperText,
  disabled = false,
  name,
  id,
  style = {},
  selectStyle = {},
  className = "",
}) {
  const [focused, setFocused] = useState(false);

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

      <div style={{ position: "relative", width: "100%" }}>
        <select
          id={id || name}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            height: 38,
            padding: "8px 32px 8px 12px",
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
            appearance: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
            boxSizing: "border-box",
            ...selectStyle,
          }}
        >
          {options && options.length > 0
            ? options.map((opt, idx) => {
                const optVal = typeof opt === "object" ? opt.value : opt;
                const optLbl = typeof opt === "object" ? opt.label : opt;
                return (
                  <option key={opt.key || optVal || idx} value={optVal}>
                    {optLbl}
                  </option>
                );
              })
            : children}
        </select>

        <div
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: THEME.colors.textMuted,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Icon name="chevron-down" size={14} />
        </div>
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
