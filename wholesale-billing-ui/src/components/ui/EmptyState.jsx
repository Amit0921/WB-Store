import { THEME } from "../../utils/theme";
import Icon from "./Icon";
import Button from "./Button";

export default function EmptyState({
  icon = "package",
  title = "No data found",
  description = "Get started by creating your first entry.",
  actionLabel,
  onAction,
  style = {},
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        borderRadius: THEME.radius.lg,
        background: THEME.colors.surface,
        border: `1px dashed ${THEME.colors.border}`,
        ...style,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: THEME.colors.primaryLight,
          color: THEME.colors.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Icon name={icon} size={24} />
      </div>

      <h4
        style={{
          margin: 0,
          fontSize: "15px",
          fontWeight: 700,
          color: THEME.colors.textPrimary,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h4>

      {description && (
        <p
          style={{
            margin: "6px 0 20px",
            fontSize: "13px",
            color: THEME.colors.textSecondary,
            maxWidth: "380px",
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button onClick={onAction} icon={<Icon name="plus" size={15} />}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
