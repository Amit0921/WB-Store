import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getCustomerSummary, getCustomerStatement } from "../../api/customerApi";
import { THEME } from "../../utils/theme";
import Icon from "../../components/ui/Icon";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import PageHeader from "../../components/ui/PageHeader";

export default function CustomerSummary() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [statement, setStatement] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ledger"); // "ledger" or "profile"

  useEffect(() => {
    Promise.all([getCustomerSummary(customerId), getCustomerStatement(customerId)])
      .then(([s, st]) => {
        setSummary(s?.data || s);
        setStatement(st?.data || st || []);
      })
      .catch((err) => console.error("Error loading customer summary:", err))
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: 48, textAlign: "center", color: THEME.colors.textMuted }}>
          Loading customer account details...
        </div>
      </MainLayout>
    );
  }

  if (!summary) {
    return (
      <MainLayout>
        <div style={{ padding: 48, textAlign: "center" }}>
          <h3 style={{ color: THEME.colors.danger }}>Customer profile not found.</h3>
          <Button variant="secondary" onClick={() => navigate("/customers")} style={{ marginTop: 12 }}>
            ← Back to Customer Directory
          </Button>
        </div>
      </MainLayout>
    );
  }

  const shopName = summary.shopName || "Customer Details";
  const ownerName = summary.ownerName || "—";
  const phone = summary.phone || "—";
  const gstin = summary.gstin || "Unregistered";
  const address = summary.address || "—";
  const status = summary.status || "ACTIVE";
  const creditLimit = summary.creditLimit ? `₹${Number(summary.creditLimit).toLocaleString("en-IN")}` : "No Limit";
  const currentDue = Number(summary.currentDue || 0);
  const totalInvoiced = Number(summary.totalInvoiceAmount || 0);
  const totalPaid = Number(summary.totalPaidAmount || 0);

  const whatsappMessage = encodeURIComponent(
    `Namaste ${shopName},\n\nYour account statement from WB-Store (Surat):\n` +
    `• Outstanding Balance Due: ₹${currentDue.toFixed(2)}\n` +
    `• Total Invoiced: ₹${totalInvoiced.toFixed(2)}\n` +
    `• Total Payments Recorded: ₹${totalPaid.toFixed(2)}\n\n` +
    `Please settle the pending balance at your earliest convenience. Thank you!`
  );

  return (
    <MainLayout>
      <PageHeader
        title={shopName}
        subtitle={`Owner: ${ownerName} • Phone: ${phone}`}
        badge={<Badge variant={status === "ACTIVE" ? "success" : "danger"}>{status}</Badge>}
        breadcrumbs={[
          { label: "Directory", path: "/customers" },
          { label: "Customers", path: "/customers" },
          { label: shopName },
        ]}
        actions={
          <>
            <a
              href={`https://wa.me/91${phone.replace(/\D/g, "")}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: THEME.radius.md,
                background: "#25D366",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 1px 2px rgba(37, 211, 102, 0.2)",
              }}
            >
              <Icon name="whatsapp" size={15} color="#FFFFFF" />
              WhatsApp Statement
            </a>

            <Link
              to={`/customers/${customerId}/statement`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: THEME.radius.md,
                background: "#FFFFFF",
                border: `1px solid ${THEME.colors.border}`,
                color: THEME.colors.textPrimary,
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <Icon name="printer" size={15} />
              Print Ledger
            </Link>

            <Button
              variant="outline"
              onClick={() => navigate(`/invoices/new?customerId=${customerId}`)}
              icon={<Icon name="plus" size={14} />}
            >
              Create Bill
            </Button>

            <Button
              variant="success"
              onClick={() => navigate(`/payments/create?customerId=${customerId}`)}
              icon={<Icon name="credit-card" size={14} />}
            >
              Collect Due
            </Button>
          </>
        }
      />

      {/* Financial Metrics Strip */}
      <div className="grid-cols-4-responsive" style={{ marginBottom: 24 }}>
        <StatCard
          label="Current Due Balance"
          value={`₹${currentDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          subtext={currentDue > 0 ? "Requires payment collection" : "All dues settled"}
          iconName="alert-triangle"
          variant={currentDue > 0 ? "danger" : "success"}
        />

        <StatCard
          label="Total Billed"
          value={`₹${totalInvoiced.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          subtext="Lifetime wholesale invoicing"
          iconName="file-text"
          variant="primary"
        />

        <StatCard
          label="Total Paid"
          value={`₹${totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          subtext="Lifetime collections logged"
          iconName="credit-card"
          variant="success"
        />

        <StatCard
          label="Credit Limit"
          value={creditLimit}
          subtext={`GSTIN: ${gstin}`}
          iconName="shield-check"
          variant="info"
        />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: `1px solid ${THEME.colors.border}`, paddingBottom: 8 }}>
        <button
          type="button"
          onClick={() => setActiveTab("ledger")}
          style={{
            background: activeTab === "ledger" ? THEME.colors.primaryLight : "transparent",
            color: activeTab === "ledger" ? THEME.colors.primary : THEME.colors.textSecondary,
            border: activeTab === "ledger" ? `1px solid rgba(76, 60, 206, 0.2)` : "1px solid transparent",
            borderRadius: THEME.radius.md,
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Icon name="bar-chart" size={15} color={activeTab === "ledger" ? THEME.colors.primary : THEME.colors.textSecondary} />
          Double-Entry Ledger ({statement.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          style={{
            background: activeTab === "profile" ? THEME.colors.primaryLight : "transparent",
            color: activeTab === "profile" ? THEME.colors.primary : THEME.colors.textSecondary,
            border: activeTab === "profile" ? `1px solid rgba(76, 60, 206, 0.2)` : "1px solid transparent",
            borderRadius: THEME.radius.md,
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Icon name="user" size={15} color={activeTab === "profile" ? THEME.colors.primary : THEME.colors.textSecondary} />
          Account Profile &amp; KYC
        </button>
      </div>

      {/* Tab 1: Ledger Statement */}
      {activeTab === "ledger" ? (
        <Card title="Ledger Audit Trail" subtitle="Chronological double-entry debit, credit, and running balance" padding={0}>
          {statement.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: THEME.colors.textMuted }}>
              No ledger transactions recorded for this client yet.
            </div>
          ) : (
            <div className="table-responsive-container">
              <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: `1px solid ${THEME.colors.borderSubtle}` }}>
                    <th style={{ padding: "10px 16px", fontSize: "11px", fontWeight: 700, color: THEME.colors.textSecondary, textTransform: "uppercase" }}>DATE</th>
                    <th style={{ padding: "10px 16px", fontSize: "11px", fontWeight: 700, color: THEME.colors.textSecondary, textTransform: "uppercase" }}>TYPE</th>
                    <th style={{ padding: "10px 16px", fontSize: "11px", fontWeight: 700, color: THEME.colors.textSecondary, textTransform: "uppercase" }}>REFERENCE #</th>
                    <th style={{ padding: "10px 16px", fontSize: "11px", fontWeight: 700, color: THEME.colors.textSecondary, textTransform: "uppercase", textAlign: "right" }}>DEBIT (+)</th>
                    <th style={{ padding: "10px 16px", fontSize: "11px", fontWeight: 700, color: THEME.colors.textSecondary, textTransform: "uppercase", textAlign: "right" }}>CREDIT (-)</th>
                    <th style={{ padding: "10px 16px", fontSize: "11px", fontWeight: 700, color: THEME.colors.textSecondary, textTransform: "uppercase", textAlign: "right" }}>RUNNING BALANCE</th>
                  </tr>
                </thead>
                <tbody>
                  {statement.map((entry, idx) => {
                    const isInvoice = entry.transactionType === "INVOICE";
                    return (
                      <tr
                        key={idx}
                        style={{ borderBottom: `1px solid ${THEME.colors.borderSubtle}` }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "12px 16px", color: THEME.colors.textSecondary, fontVariantNumeric: "tabular-nums" }}>
                          {entry.transactionDate ? new Date(entry.transactionDate).toLocaleDateString("en-IN") : "—"}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Badge size="sm" variant={isInvoice ? "primary" : "success"}>
                            {entry.transactionType}
                          </Badge>
                        </td>
                        <td style={{ padding: "12px 16px", fontFamily: "monospace", fontWeight: 600 }}>
                          {entry.referenceNo || "—"}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", color: THEME.colors.danger, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                          {Number(entry.debit) > 0 ? `₹${Number(entry.debit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", color: THEME.colors.success, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                          {Number(entry.credit) > 0 ? `₹${Number(entry.credit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 800, color: THEME.colors.textPrimary, fontVariantNumeric: "tabular-nums" }}>
                          ₹{Number(entry.runningBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        /* Tab 2: Profile KYC */
        <Card title="Business Profile &amp; KYC Verification" subtitle="Complete registration information">
          <div className="form-grid-responsive" style={{ gap: 20 }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: THEME.colors.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Shop Name</div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: THEME.colors.textPrimary }}>{shopName}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: THEME.colors.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Owner Name</div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: THEME.colors.textPrimary }}>{ownerName}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: THEME.colors.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Primary Phone</div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: THEME.colors.textPrimary }}>{phone}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: THEME.colors.textMuted, textTransform: "uppercase", marginBottom: 4 }}>GSTIN Registration</div>
              <div style={{ fontSize: "14px", fontFamily: "monospace", fontWeight: 600, color: THEME.colors.primary }}>{gstin}</div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: THEME.colors.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Billing Address</div>
              <div style={{ fontSize: "14px", color: THEME.colors.textPrimary, lineHeight: 1.5 }}>{address}</div>
            </div>
          </div>
        </Card>
      )}
    </MainLayout>
  );
}
