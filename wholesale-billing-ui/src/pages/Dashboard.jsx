import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getDashboardMetrics } from "../api/reportApi";
import { THEME } from "../utils/theme";
import Icon from "../components/ui/Icon";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";

export default function Dashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardMetrics()
      .then((data) => setMetrics(data))
      .catch((err) => console.error("Error fetching dashboard metrics:", err))
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const displayName = (user?.fullName || user?.username || "Admin").split(" ")[0];

  const currentDateFormatted = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <MainLayout>
      {/* Header */}
      <PageHeader
        title={`${greeting}, ${displayName}`}
        subtitle={`${currentDateFormatted} • Live Garments Billing & Ledger Overview`}
        actions={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate("/billing/retail")}
              icon={<Icon name="zap" size={15} color={THEME.colors.primary} />}
            >
              Retail Counter POS
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/invoices/new")}
              icon={<Icon name="plus" size={15} />}
            >
              New Wholesale Bill
            </Button>
            <Button
              variant="success"
              size="md"
              onClick={() => navigate("/payments/create")}
              icon={<Icon name="credit-card" size={15} />}
            >
              Collect Due
            </Button>
          </>
        }
      />

      {/* 4 Financial KPI Stat Cards */}
      <div className="grid-cols-4-responsive" style={{ marginBottom: 24 }}>
        <StatCard
          label="Today's Sales Revenue"
          value={`₹${Number(metrics?.todaySales || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          subtext={`${metrics?.todayInvoicesCount || 0} bills issued today`}
          iconName="file-text"
          variant="primary"
          loading={loading}
          onClick={() => navigate("/invoices")}
        />

        <StatCard
          label="Collections Today"
          value={`₹${Number(metrics?.todayPayments || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          subtext="Cash &amp; UPI settlements"
          iconName="credit-card"
          variant="success"
          loading={loading}
          onClick={() => navigate("/payments")}
        />

        <StatCard
          label="Total Receivables Due"
          value={`₹${Number(metrics?.totalOutstandingDue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          subtext="Total unsettled balance"
          iconName="alert-triangle"
          variant="danger"
          loading={loading}
          onClick={() => navigate("/reports/dues")}
        />

        <StatCard
          label="Active Client Accounts"
          value={metrics?.activeCustomers ?? "—"}
          subtext="Registered wholesale buyers"
          iconName="users"
          variant="info"
          loading={loading}
          onClick={() => navigate("/customers")}
        />
      </div>

      {/* Two Column Layout: Recent Invoices & Top Due Debtors */}
      <div className="layout-split-responsive dashboard-columns-grid">
        {/* Recent Invoices Card */}
        <Card
          title="Recent Invoices"
          subtitle="Latest transactions issued across counters"
          padding={0}
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/invoices")}
              iconRight={<Icon name="arrow-right" size={13} />}
            >
              View All
            </Button>
          }
        >
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: THEME.colors.textMuted }}>
              Loading recent transactions...
            </div>
          ) : !metrics?.recentInvoices || metrics.recentInvoices.length === 0 ? (
            <div style={{ padding: 36, textAlign: "center", color: THEME.colors.textMuted }}>
              No bills recorded yet.
            </div>
          ) : (
            <div className="table-responsive-container">
              <table style={{ width: "100%", minWidth: 440, borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: `1px solid ${THEME.colors.borderSubtle}` }}>
                    <th style={{ padding: "10px 16px", color: THEME.colors.textSecondary, fontWeight: 700, fontSize: "11px", letterSpacing: "0.04em" }}>BILL #</th>
                    <th style={{ padding: "10px 16px", color: THEME.colors.textSecondary, fontWeight: 700, fontSize: "11px", letterSpacing: "0.04em" }}>CUSTOMER</th>
                    <th style={{ padding: "10px 16px", color: THEME.colors.textSecondary, fontWeight: 700, fontSize: "11px", letterSpacing: "0.04em", textAlign: "right" }}>AMOUNT</th>
                    <th style={{ padding: "10px 16px", color: THEME.colors.textSecondary, fontWeight: 700, fontSize: "11px", letterSpacing: "0.04em", textAlign: "center" }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      style={{ borderBottom: `1px solid ${THEME.colors.borderSubtle}`, transition: "background 0.12s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "11px 16px", fontFamily: "monospace", fontWeight: 700 }}>
                        <Link
                          to={`/invoices/${inv.id}`}
                          style={{ color: THEME.colors.primary, textDecoration: "none" }}
                        >
                          {inv.invoiceNo}
                        </Link>
                      </td>
                      <td style={{ padding: "11px 16px", color: THEME.colors.textPrimary, fontWeight: 600 }}>
                        {inv.customerName}
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          textAlign: "right",
                          fontWeight: 700,
                          color: THEME.colors.textPrimary,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        ₹{Number(inv.finalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "11px 16px", textAlign: "center" }}>
                        <Badge size="sm">{inv.paymentStatus}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Top Outstanding Debtors Card */}
        <Card
          title="Top Receivables"
          subtitle="Customers with highest pending balances"
          padding={0}
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/reports/dues")}
              iconRight={<Icon name="arrow-right" size={13} />}
            >
              Aging Report
            </Button>
          }
        >
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: THEME.colors.textMuted }}>
              Loading pending dues...
            </div>
          ) : !metrics?.topDueCustomers || metrics.topDueCustomers.length === 0 ? (
            <div style={{ padding: 36, textAlign: "center", color: THEME.colors.success, fontSize: "13px", fontWeight: 600 }}>
              All customer dues are completely settled!
            </div>
          ) : (
            <div className="table-responsive-container">
              <table style={{ width: "100%", minWidth: 440, borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: `1px solid ${THEME.colors.borderSubtle}` }}>
                    <th style={{ padding: "10px 16px", color: THEME.colors.textSecondary, fontWeight: 700, fontSize: "11px", letterSpacing: "0.04em" }}>CUSTOMER</th>
                    <th style={{ padding: "10px 16px", color: THEME.colors.textSecondary, fontWeight: 700, fontSize: "11px", letterSpacing: "0.04em" }}>AGING</th>
                    <th style={{ padding: "10px 16px", color: THEME.colors.textSecondary, fontWeight: 700, fontSize: "11px", letterSpacing: "0.04em", textAlign: "right" }}>BALANCE</th>
                    <th style={{ padding: "10px 16px", textAlign: "right" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.topDueCustomers.map((c) => (
                    <tr
                      key={c.customerId}
                      style={{ borderBottom: `1px solid ${THEME.colors.borderSubtle}`, transition: "background 0.12s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "11px 16px" }}>
                        <Link
                          to={`/customers/${c.customerId}/summary`}
                          style={{ color: THEME.colors.textPrimary, fontWeight: 600, textDecoration: "none" }}
                        >
                          {c.shopName || c.ownerName}
                        </Link>
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <Badge size="sm">{c.agingBracket}</Badge>
                      </td>
                      <td
                        style={{
                          padding: "11px 16px",
                          textAlign: "right",
                          fontWeight: 800,
                          color: THEME.colors.danger,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        ₹{Number(c.currentDue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "11px 16px", textAlign: "right" }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/payments/create?customerId=${c.customerId}`)}
                        >
                          Collect
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
