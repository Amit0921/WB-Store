import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getDailySalesReport, getMonthlySummaryReport } from "../../api/reportApi";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Icon from "../../components/ui/Icon";
import { colors, radius, shadows } from "../../utils/theme";

export default function SalesReport() {
  const [activeTab, setActiveTab] = useState("daily"); // "daily" | "monthly"

  // Daily State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [dailyData, setDailyData] = useState(null);
  const [dailyLoading, setDailyLoading] = useState(false);

  // Monthly State
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [monthlyData, setMonthlyData] = useState(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);

  const loadDaily = useCallback(async () => {
    try {
      setDailyLoading(true);
      const res = await getDailySalesReport(selectedDate);
      setDailyData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setDailyLoading(false);
    }
  }, [selectedDate]);

  const loadMonthly = useCallback(async () => {
    try {
      setMonthlyLoading(true);
      const res = await getMonthlySummaryReport(selectedYear, selectedMonth);
      setMonthlyData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setMonthlyLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (activeTab === "daily") {
      loadDaily();
    } else {
      loadMonthly();
    }
  }, [activeTab, loadDaily, loadMonthly]);

  const handlePrint = () => {
    window.print();
  };

  const months = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];

  return (
    <MainLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
        {/* Header */}
        <div className="no-print">
          <PageHeader
            title="Sales & Revenue Reports"
            subtitle="Daily counter sales audit, GST tax collections, and monthly revenue performance analytics"
            breadcrumbs={[{ label: "Analytics" }, { label: "Sales Audit" }]}
            actions={
              <Button
                variant="secondary"
                size="sm"
                icon="printer"
                onClick={handlePrint}
              >
                Print Report
              </Button>
            }
          />
        </div>

        {/* Tab Controls */}
        <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <button
            onClick={() => setActiveTab("daily")}
            style={{
              padding: "9px 18px",
              borderRadius: radius.md,
              border: `1px solid ${activeTab === "daily" ? colors.primary : colors.border}`,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              background: activeTab === "daily" ? colors.primary : colors.surface,
              color: activeTab === "daily" ? "#fff" : colors.textSecondary,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s ease",
            }}
          >
            <Icon name="file-text" size={14} color={activeTab === "daily" ? "#fff" : colors.textSecondary} />
            <span>Daily Sales Audit</span>
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            style={{
              padding: "9px 18px",
              borderRadius: radius.md,
              border: `1px solid ${activeTab === "monthly" ? colors.primary : colors.border}`,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              background: activeTab === "monthly" ? colors.primary : colors.surface,
              color: activeTab === "monthly" ? "#fff" : colors.textSecondary,
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.15s ease",
            }}
          >
            <Icon name="bar-chart" size={14} color={activeTab === "monthly" ? "#fff" : colors.textSecondary} />
            <span>Monthly Financial Summary</span>
          </button>
        </div>

        {/* DAILY REPORT VIEW */}
        {activeTab === "daily" && (
          <div>
            {/* Date Selector Filter Bar */}
            <div
              className="no-print"
              style={{
                background: colors.surface,
                borderRadius: radius.lg,
                border: `1px solid ${colors.border}`,
                padding: "12px 18px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                boxShadow: shadows.xs,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>Select Audit Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: "6px 12px",
                  border: `1px solid ${colors.border}`,
                  borderRadius: radius.md,
                  fontSize: 13,
                  outline: "none",
                  background: colors.surface,
                }}
              />
            </div>

            {/* Daily Metrics */}
            <div className="grid-cols-4-responsive" style={{ marginBottom: 20 }}>
              <StatCard
                title="Net Sales Revenue"
                value={`₹${Number(dailyData?.netSales || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                caption={`${dailyData?.totalInvoices || 0} total invoices issued`}
                icon="bar-chart"
              />
              <StatCard
                title="Immediate Collections"
                value={`₹${Number(dailyData?.cashCollections || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                caption="Cash &amp; instant UPI received"
                icon="credit-card"
              />
              <StatCard
                title="Credit Given (Dues)"
                value={`₹${Number(dailyData?.creditIssued || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                caption="Billed to customer ledger"
                icon="alert-triangle"
              />
              <StatCard
                title="GST Tax Collected"
                value={`₹${Number(dailyData?.gstCollected || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                caption="Included in net sales total"
                icon="file-text"
              />
            </div>

            {/* Invoices List */}
            <div
              style={{
                background: colors.surface,
                borderRadius: radius.xl,
                border: `1px solid ${colors.border}`,
                overflow: "hidden",
                boxShadow: shadows.xs,
              }}
            >
              <div
                style={{
                  padding: "14px 18px",
                  borderBottom: `1px solid ${colors.border}`,
                  fontWeight: 700,
                  fontSize: 14,
                  color: colors.textPrimary,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Daily Invoices Breakdown</span>
                <span style={{ fontSize: 12, color: colors.textSecondary, fontWeight: 500 }}>Date: {selectedDate}</span>
              </div>

              {dailyLoading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 240, color: colors.textSecondary, gap: 10 }}>
                  <Icon name="spinner" size={18} className="spin" color={colors.primary} />
                  <span style={{ fontSize: 13 }}>Compiling daily sales ledger...</span>
                </div>
              ) : !dailyData?.invoices || dailyData.invoices.length === 0 ? (
                <div style={{ padding: 48, textAlign: "center", color: colors.textSecondary }}>
                  No invoices created on {selectedDate}.
                </div>
              ) : (
                <div className="table-responsive-container">
                  <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: colors.background, borderBottom: `1px solid ${colors.border}`, textAlign: "left" }}>
                        <th style={{ padding: "11px 16px", color: colors.textSecondary, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>BILL #</th>
                        <th style={{ padding: "11px 16px", color: colors.textSecondary, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>CUSTOMER</th>
                        <th style={{ padding: "11px 16px", color: colors.textSecondary, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>FINAL AMOUNT</th>
                        <th style={{ padding: "11px 16px", color: colors.textSecondary, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>PAID</th>
                        <th style={{ padding: "11px 16px", color: colors.textSecondary, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "right" }}>CREDIT DUE</th>
                        <th style={{ padding: "11px 16px", color: colors.textSecondary, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyData.invoices.map((inv) => (
                        <tr key={inv.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                          <td style={{ padding: "11px 16px", fontFamily: "monospace", fontWeight: 700 }}>
                            <Link to={`/invoices/${inv.id}`} style={{ color: colors.primary, textDecoration: "none" }}>
                              {inv.invoiceNo}
                            </Link>
                          </td>
                          <td style={{ padding: "11px 16px", fontWeight: 600, color: colors.textPrimary }}>{inv.customerName}</td>
                          <td style={{ padding: "11px 16px", textAlign: "right", fontWeight: 700, color: colors.textPrimary, fontVariantNumeric: "tabular-nums" }}>
                            ₹{Number(inv.finalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: "11px 16px", textAlign: "right", color: colors.success, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                            ₹{Number(inv.paidAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td
                            style={{
                              padding: "11px 16px",
                              textAlign: "right",
                              color: Number(inv.dueAmount || 0) > 0 ? colors.danger : colors.textSecondary,
                              fontWeight: 700,
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            ₹{Number(inv.dueAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: "11px 16px", textAlign: "center" }}>
                            <Badge variant={inv.paymentStatus === "PAID" ? "success" : inv.paymentStatus === "PARTIAL" ? "warning" : "danger"}>
                              {inv.paymentStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MONTHLY SUMMARY VIEW */}
        {activeTab === "monthly" && (
          <div>
            {/* Year & Month Selector */}
            <div
              className="no-print"
              style={{
                background: colors.surface,
                borderRadius: radius.lg,
                border: `1px solid ${colors.border}`,
                padding: "12px 18px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 18,
                boxShadow: shadows.xs,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>Month:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  style={{
                    padding: "6px 12px",
                    border: `1px solid ${colors.border}`,
                    borderRadius: radius.md,
                    fontSize: 13,
                    background: colors.surface,
                    outline: "none",
                  }}
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>Year:</span>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  style={{
                    width: 90,
                    padding: "6px 10px",
                    border: `1px solid ${colors.border}`,
                    borderRadius: radius.md,
                    fontSize: 13,
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Monthly Cards */}
            <div className="grid-cols-3-responsive" style={{ marginBottom: 20 }}>
              <StatCard
                title="Total Monthly Revenue"
                value={`₹${Number(monthlyData?.totalRevenue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                caption={`${monthlyData?.totalInvoices || 0} invoices issued in ${months.find((m) => m.value === selectedMonth)?.label}`}
                icon="bar-chart"
              />
              <StatCard
                title="Collections &amp; Vouchers"
                value={`₹${Number(monthlyData?.totalPaymentsCollected || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                caption="Verified receipts posted to customer ledgers"
                icon="credit-card"
              />
              <StatCard
                title="GST Tax Component"
                value={`₹${Number(monthlyData?.totalGstCollected || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                caption="Ready for GSTR-1 &amp; GSTR-3B compliance filing"
                icon="file-text"
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body { background: #fff !important; }
          aside, nav, .no-print, header { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; }
        }
      `}</style>
    </MainLayout>
  );
}
