import { THEME } from "../../utils/theme";
import Icon from "./Icon";
import Button from "./Button";
import EmptyState from "./EmptyState";

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = "No records found",
  emptyDescription = "There are no entries available to display.",
  emptyIcon = "package",
  emptyAction = null,
  // Pagination props (support either direct props or pagination object)
  pagination = null,
  page: propPage = 0,
  totalPages: propTotalPages = 1,
  totalElements: propTotalElements = 0,
  onPageChange: propOnPageChange = null,
  style = {},
}) {
  const activePage = pagination?.page ?? propPage;
  const activeTotalPages = pagination?.totalPages ?? propTotalPages;
  const activeTotalElements = pagination?.totalElements ?? propTotalElements;
  const activeOnPageChange = pagination?.onPageChange ?? propOnPageChange;
  return (
    <div
      style={{
        background: THEME.colors.surface,
        borderRadius: THEME.radius.lg,
        border: `1px solid ${THEME.colors.border}`,
        boxShadow: THEME.shadows.card,
        overflow: "hidden",
        width: "100%",
        ...style,
      }}
    >
      <div style={{ overflowX: "auto", width: "100%" }}>
        <table
          style={{
            width: "100%",
            minWidth: 700,
            borderCollapse: "collapse",
            fontSize: "13px",
            fontFamily: THEME.typography.fontFamily,
            textAlign: "left",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#F8FAFC",
                borderBottom: `1px solid ${THEME.colors.border}`,
              }}
            >
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: "10px 16px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: THEME.colors.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    textAlign: col.align || "left",
                    width: col.width || "auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr
                  key={rIdx}
                  style={{
                    borderBottom: `1px solid ${THEME.colors.borderSubtle}`,
                  }}
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} style={{ padding: "14px 16px", textAlign: col.align || "left" }}>
                      <div
                        style={{
                          height: 14,
                          width: cIdx === 0 ? "70%" : cIdx === 1 ? "50%" : "30%",
                          background: "#F1F5F9",
                          borderRadius: 4,
                          display: "inline-block",
                          animation: "pulse 1.5s infinite",
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: "40px 20px" }}>
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                    actionLabel={emptyAction?.label}
                    onAction={emptyAction?.onClick}
                    style={{ border: "none", background: "transparent", padding: 0 }}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={row.id || rIdx}
                  style={{
                    borderBottom: `1px solid ${THEME.colors.borderSubtle}`,
                    transition: "background-color 0.1s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = THEME.colors.surfaceHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      style={{
                        padding: "12px 16px",
                        color: THEME.colors.textPrimary,
                        verticalAlign: "middle",
                        textAlign: col.align || "left",
                        width: col.width || "auto",
                      }}
                    >
                      {col.render ? col.render(row) : col.cell ? col.cell(row) : row[col.accessor] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {activeOnPageChange && activeTotalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderTop: `1px solid ${THEME.colors.borderSubtle}`,
            background: "#FFFFFF",
            fontSize: "12px",
            color: THEME.colors.textSecondary,
          }}
        >
          <div>
            Showing Page <strong style={{ color: THEME.colors.textPrimary }}>{activePage + 1}</strong> of{" "}
            <strong style={{ color: THEME.colors.textPrimary }}>{activeTotalPages}</strong>
            {activeTotalElements > 0 && ` (${activeTotalElements} total entries)`}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Button
              variant="secondary"
              size="sm"
              disabled={activePage <= 0 || loading}
              onClick={() => activeOnPageChange(activePage - 1)}
              icon={<Icon name="chevron-left" size={14} />}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={activePage >= activeTotalPages - 1 || loading}
              onClick={() => activeOnPageChange(activePage + 1)}
              iconRight={<Icon name="chevron-right" size={14} />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
