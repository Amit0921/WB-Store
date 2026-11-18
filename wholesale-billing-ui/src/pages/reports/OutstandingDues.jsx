import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getOutstandingDuesReport } from "../../api/reportApi";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Icon from "../../components/ui/Icon";
import { colors, radius, shadows } from "../../utils/theme";

export default function OutstandingDues() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [bracketFilter, setBracketFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getOutstandingDuesReport();
        setData(res);
      } catch (err) {
        console.error("Error loading dues:", err);
        setError("Failed to load outstanding dues report.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const customers = data?.customers || [];
  const filteredCustomers = customers.filter((c) => {
    const matchQuery =
      !searchQuery ||
      c.shopName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery);

    const matchBracket = !bracketFilter || c.agingBracket === bracketFilter;
    return matchQuery && matchBracket;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
        {/* Header */}
        <div className="no-print">
          <PageHeader
            title="Outstanding Dues & Aging Analysis"
            subtitle="Receivables credit control categorized by payment delays (0–30, 31–60, and 60+ days overdue)"
            breadcrumbs={[{ label: "Analytics" }, { label: "Dues Aging" }]}
            actions={
              <Button
                variant="secondary"
                size="sm"
                icon="printer"
                onClick={handlePrint}
              >
                Print Aging Report
              </Button>
            }
          />
        </div>

        {error && (
          <div
            className="no-print"
            style={{
              background: "#FEE2E2",
              border: `1px solid #FECDD3`,
              color: colors.danger,
              borderRadius: radius.md,
              padding: "10px 14px",
              fontSize: 13,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Icon name="alert-triangle" size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Aging Summary Row - Interactive Cards */}
        <div className="grid-cols-4-responsive" style={{ marginBottom: 20 }}>
          {/* Total Due */}
          <div
            onClick={() => setBracketFilter("")}
            style={{
              background: bracketFilter === "" ? "#FFFFFF" : colors.surface,
              borderRadius: radius.lg,
              padding: "18px 20px",
              border: `1px solid ${bracketFilter === "" ? colors.primary : colors.border}`,
              boxShadow: bracketFilter === "" ? shadows.sm : shadows.xs,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              TOTAL OUTSTANDING
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              ₹{Number(data?.totalOutstanding || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
              {customers.length} total debtors
            </div>
          </div>

          {/* 0-30 Days */}
          <div
            onClick={() => setBracketFilter(bracketFilter === "0-30 days" ? "" : "0-30 days")}
            style={{
              background: bracketFilter === "0-30 days" ? "#F0FDF4" : colors.surface,
              borderRadius: radius.lg,
              padding: "18px 20px",
              border: `1px solid ${bracketFilter === "0-30 days" ? colors.success : colors.border}`,
              boxShadow: bracketFilter === "0-30 days" ? shadows.sm : shadows.xs,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.success, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              0–30 DAYS (CURRENT)
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.success, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              ₹{Number(data?.bracket0To30 || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
              Normal credit terms
            </div>
          </div>

          {/* 31-60 Days */}
          <div
            onClick={() => setBracketFilter(bracketFilter === "31-60 days" ? "" : "31-60 days")}
            style={{
              background: bracketFilter === "31-60 days" ? "#FFFBEB" : colors.surface,
              borderRadius: radius.lg,
              padding: "18px 20px",
              border: `1px solid ${bracketFilter === "31-60 days" ? colors.warning : colors.border}`,
              boxShadow: bracketFilter === "31-60 days" ? shadows.sm : shadows.xs,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.warning, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              31–60 DAYS (ATTENTION)
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.warning, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              ₹{Number(data?.bracket31To60 || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
              Follow-up reminder sent
            </div>
          </div>

          {/* 60+ Days */}
          <div
            onClick={() => setBracketFilter(bracketFilter === "60+ days" ? "" : "60+ days")}
            style={{
              background: bracketFilter === "60+ days" ? "#FEF2F2" : colors.surface,
              borderRadius: radius.lg,
              padding: "18px 20px",
              border: `1px solid ${bracketFilter === "60+ days" ? colors.danger : colors.border}`,
              boxShadow: bracketFilter === "60+ days" ? shadows.sm : shadows.xs,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.danger, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              60+ DAYS (HIGH RISK)
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.danger, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              ₹{Number(data?.bracket60Plus || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
              Credit hold advised
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div
          className="no-print"
          style={{
            background: colors.surface,
            borderRadius: radius.lg,
            border: `1px solid ${colors.border}`,
            padding: "12px 18px",
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
            boxShadow: shadows.xs,
          }}
        >
          <div style={{ flex: 1, maxWidth: 380 }}>
            <Input
              placeholder="Search by shop name or phone..."
              prefixIcon="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {bracketFilter && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: colors.textSecondary }}>
              <span>Filtered by:</span>
              <Badge variant={bracketFilter === "60+ days" ? "danger" : bracketFilter === "31-60 days" ? "warning" : "success"}>
                {bracketFilter}
              </Badge>
              <button
                onClick={() => setBracketFilter("")}
                style={{
                  background: "none",
                  border: "none",
                  color: colors.primary,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                Clear filter
              </button>
            </div>
          )}
        </div>

        {/* Aging Table Card */}
        <div
          id="printable-aging-table"
          style={{
            background: colors.surface,
            borderRadius: radius.xl,
            border: `1px solid ${colors.border}`,
            overflow: "hidden",
            boxShadow: shadows.xs,
          }}
        >
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280, color: colors.textSecondary, gap: 10 }}>
              <Icon name="spinner" size={18} className="spin" color={colors.primary} />
              <span style={{ fontSize: 13 }}>Analyzing debtor aging profiles...</span>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: colors.success }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <Icon name="check" size={20} color={colors.success} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>No outstanding dues matching filters!</div>
              <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>All debtor accounts in this segment are fully settled.</div>
            </div>
          ) : (
            <div className="table-responsive-container">
              <table style={{ width: "100%", minWidth: 700, borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: colors.background, borderBottom: `1px solid ${colors.border}`, textAlign: "left" }}>
                    <th style={{ padding: "12px 16px", color: colors.textSecondary, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>CUSTOMER / SHOP</th>
                    <th style={{ padding: "12px 16px", color: colors.textSecondary, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>PHONE</th>
                    <th style={{ padding: "12px 16px", color: colors.textSecondary, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>CREDIT LIMIT</th>
                    <th style={{ padding: "12px 16px", color: colors.textSecondary, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>OLDEST BILL</th>
                    <th style={{ padding: "12px 16px", color: colors.textSecondary, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>AGING BRACKET</th>
                    <th style={{ padding: "12px 16px", color: colors.textSecondary, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>CURRENT DUE</th>
                    <th className="no-print" style={{ padding: "12px 16px", color: colors.textSecondary, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c) => (
                    <tr key={c.customerId} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{ padding: "12px 16px" }}>
                        <Link
                          to={`/customers/${c.customerId}/summary`}
                          style={{ fontWeight: 700, color: colors.textPrimary, textDecoration: "none" }}
                        >
                          {c.shopName}
                        </Link>
                        {c.ownerName && <div style={{ fontSize: 11, color: colors.textSecondary }}>Prop: {c.ownerName}</div>}
                      </td>
                      <td style={{ padding: "12px 16px", color: colors.textSecondary }}>{c.phone}</td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: colors.textPrimary, fontVariantNumeric: "tabular-nums" }}>
                        ₹{Number(c.creditLimit || 0).toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", color: colors.textSecondary, fontSize: 12 }}>
                        {c.oldestPendingInvoiceDate
                          ? new Date(c.oldestPendingInvoiceDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                          : "—"}
                        {c.daysOverdue > 0 && (
                          <div style={{ fontSize: 11, color: colors.danger, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                            ({c.daysOverdue} days)
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <Badge
                          variant={c.agingBracket === "60+ days" ? "danger" : c.agingBracket === "31-60 days" ? "warning" : "success"}
                        >
                          {c.agingBracket}
                        </Badge>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 800, color: colors.danger, fontVariantNumeric: "tabular-nums" }}>
                        ₹{Number(c.currentDue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="no-print" style={{ padding: "12px 16px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <Button
                            variant="success"
                            size="sm"
                            icon="credit-card"
                            onClick={() => navigate(`/payments/create?customerId=${c.customerId}`)}
                          >
                            Collect
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon="file-text"
                            onClick={() => navigate(`/customers/${c.customerId}/statement`)}
                          >
                            Statement
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          body { background: #fff !important; }
          aside, nav, .no-print, header { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; }
          #printable-aging-table { border: none !important; box-shadow: none !important; }
        }
      `}</style>
    </MainLayout>
  );
}
