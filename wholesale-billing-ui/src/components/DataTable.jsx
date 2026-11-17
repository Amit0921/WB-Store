import { useState } from "react";

export default function DataTable({ columns, data, onRowClick, loading, emptyText = "No records found." }) {
  const [search, setSearch] = useState("");

  // const filtered = data.filter((row) =>
  //   columns.some((col) => String(row[col.key] ?? "").toLowerCase().includes(search.toLowerCase()))
  // );

  const filtered = (data || []).filter((row) =>
    columns.some((col) =>
      String(row[col.key] ?? "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #e2e8f0" }}>
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "7px 12px", border: "1px solid #e2e8f0", borderRadius: 8,
            fontSize: 13, width: 220, outline: "none",
          }}
        />
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>Loading…</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {columns.map((col) => (
                  <th key={col.key} style={{
                    padding: "10px 16px", textAlign: "left", fontWeight: 600,
                    color: "#64748b", borderBottom: "1px solid #e2e8f0",
                    whiteSpace: "nowrap",
                  }}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={columns.length} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>{emptyText}</td></tr>
              ) : (
                filtered.map((row, i) => (
                  <tr key={i} onClick={() => onRowClick?.(row)} style={{
                    borderBottom: "1px solid #f1f5f9", cursor: onRowClick ? "pointer" : "default",
                    transition: "background 0.1s",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    {columns.map((col) => (
                      <td key={col.key} style={{ padding: "11px 16px", color: "#1e293b" }}>
                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ padding: "10px 16px", fontSize: 12, color: "#94a3b8", borderTop: "1px solid #f1f5f9" }}>
        {filtered.length} record{filtered.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}