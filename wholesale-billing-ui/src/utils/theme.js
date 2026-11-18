// Modern Commerce SaaS Design Tokens (Shopify Admin + Stripe + Linear inspiration)
export const THEME = {
  colors: {
    primary: "#4C3CCE",
    primaryHover: "#3E30B8",
    primaryLight: "#EEF0FD",
    primarySubtle: "rgba(76, 60, 206, 0.08)",
    primaryFocus: "rgba(76, 60, 206, 0.16)",

    textPrimary: "#171923",
    textSecondary: "#667085",
    textMuted: "#94A3B8",
    textLight: "#FFFFFF",

    bgMain: "#F7F8FC",
    background: "#F7F8FC",
    surface: "#FFFFFF",
    surfaceHover: "#F9FAFC",
    surfaceActive: "#F1F3F9",

    border: "#E8EAF2",
    borderSubtle: "#F1F3F9",
    borderFocus: "#4C3CCE",

    success: "#16A36A",
    successBg: "#ECFDF5",
    successBorder: "#A7F3D0",
    successText: "#065F46",

    warning: "#E9A23B",
    warningBg: "#FFFBEB",
    warningBorder: "#FDE68A",
    warningText: "#92400E",

    danger: "#E5484D",
    dangerBg: "#FFF1F2",
    dangerBorder: "#FECDD3",
    dangerText: "#9F1239",

    info: "#0284C7",
    infoBg: "#F0F9FF",
    infoBorder: "#BAE6FD",
    infoText: "#0369A1",
  },

  shadows: {
    xs: "0 1px 2px 0 rgba(16, 24, 40, 0.05)",
    sm: "0 1px 3px 0 rgba(16, 24, 40, 0.08), 0 1px 2px -1px rgba(16, 24, 40, 0.06)",
    md: "0 4px 8px -2px rgba(16, 24, 40, 0.08), 0 2px 4px -2px rgba(16, 24, 40, 0.04)",
    lg: "0 12px 24px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)",
    card: "0 1px 3px 0 rgba(16, 24, 40, 0.05), 0 0 0 1px #E8EAF2",
    modal: "0 20px 40px -8px rgba(16, 24, 40, 0.16), 0 0 0 1px rgba(16, 24, 40, 0.08)",
  },

  radius: {
    sm: "6px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },

  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    tabularNums: { fontVariantNumeric: "tabular-nums" },
  },
};

export const colors = THEME.colors;
export const shadows = THEME.shadows;
export const radius = THEME.radius;
export const typography = THEME.typography;

export default THEME;
