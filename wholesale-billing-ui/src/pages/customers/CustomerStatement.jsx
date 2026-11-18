import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getCustomerById, getCustomerStatement, getCustomerSummary } from "../../api/customerApi";
import { THEME } from "../../utils/theme";
import Icon from "../../components/ui/Icon";
import Button from "../../components/ui/Button";

export default function CustomerStatement() {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [summary, setSummary] = useState(null);
  const [statement, setStatement] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const [custRes, sumRes, stmtRes] = await Promise.all([
          getCustomerById(customerId),
          getCustomerSummary(customerId),
          getCustomerStatement(customerId),
        ]);
        setCustomer(custRes.data?.data || custRes);
        setSummary(sumRes.data?.data || sumRes);
        setStatement(stmtRes.data?.data || stmtRes || []);
      } catch (err) {
        console.error("Error loading statement:", err);
        setError("Failed to load customer account statement.");
      } finally {
        setLoading(false);
      }
    })();
  }, [customerId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: 48, textAlign: "center", color: THEME.colors.textMuted }}>
          Loading account statement...
        </div>
      </MainLayout>
    );
  }

  const currentDue = Number(summary?.currentDue || 0);
  const totalBilled = Number(summary?.totalInvoiceAmount || 0);
  const totalPaid = Number(summary?.totalPaidAmount || 0);

  const phone = customer?.phone || "";
  const whatsappMessage = encodeURIComponent(
    `Namaste ${customer?.shopName || "Customer"},\n\nYour account ledger statement from WB-Store (Surat):\n` +
    `• Outstanding Balance Due: ₹${currentDue.toFixed(2)}\n` +
    `• Total Invoiced: ₹${totalBilled.toFixed(2)}\n` +
    `• Total Payments Logged: ₹${totalPaid.toFixed(2)}\n\n` +
    `Please settle the pending balance. Thank you!`
  );

  return (
    <MainLayout>
      <div style={{ maxWidth: 880, margin: "0 auto", paddingBottom: 60 }}>
        {/* Screen Action Bar (Hidden on print) */}
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <Link
            to={`/customers/${customerId}/summary`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
              color: THEME.colors.textSecondary,
              padding: "7px 14px",
              borderRadius: THEME.radius.md,
              border: `1px solid ${THEME.colors.border}`,
              background: "#FFFFFF",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <Icon name="arrow-left" size={14} />
            Back to Summary
          </Link>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {phone && (
              <a
                href={`https://wa.me/91${phone.replace(/\D/g, "")}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#25D366",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  padding: "8px 14px",
                  borderRadius: THEME.radius.md,
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Icon name="whatsapp" size={15} color="#FFFFFF" />
                WhatsApp Statement
              </a>
            )}

            <Button
              variant="success"
              onClick={() => (window.location.href = `/payments/create?customerId=${customerId}`)}
              icon={<Icon name="credit-card" size={14} />}
            >
              Record Payment
            </Button>

            <Button
              variant="primary"
              onClick={handlePrint}
              icon={<Icon name="printer" size={14} />}
            >
              Print Statement
            </Button>
          </div>
        </div>

        {error && (
          <div className="no-print" style={{ background: THEME.colors.dangerBg, color: THEME.colors.danger, borderRadius: 8, padding: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Printable Statement Document */}
        <div
          id="printable-statement"
          className="printable-document-card"
          style={{
            fontFamily: THEME.typography.fontFamily,
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, borderBottom: `2px solid ${THEME.colors.primary}`, paddingBottom: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: THEME.colors.textPrimary }}>
                WB-STORE WHOLESALE GARMENTS
              </div>
              <div style={{ fontSize: "12px", color: THEME.colors.textSecondary, marginTop: 2 }}>
                142/B Surat Textile Market, Ring Road, Surat, Gujarat - 395002
              </div>
              <div style={{ fontSize: "11px", color: THEME.colors.textSecondary, marginTop: 2 }}>
                Phone: +91 98765 43210 • GSTIN: 24AAACW1234F1Z8
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ display: "inline-block", background: THEME.colors.primaryLight, color: THEME.colors.primary, fontWeight: 700, fontSize: "12px", padding: "4px 10px", borderRadius: 4, marginBottom: 4 }}>
                CUSTOMER ACCOUNT LEDGER
              </div>
              <div style={{ fontSize: "12px", color: THEME.colors.textSecondary, marginTop: 4 }}>
                Statement Date: <strong>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</strong>
              </div>
            </div>
          </div>

          {/* Account Details Box */}
          <div className="form-grid-responsive" style={{ background: "#F8FAFC", padding: "16px 20px", borderRadius: 8, border: `1px solid ${THEME.colors.borderSubtle}`, marginBottom: 20, gap: 16 }}>
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: THEME.colors.textSecondary, textTransform: "uppercase", marginBottom: 4 }}>
                ACCOUNT STATEMENT FOR:
              </div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: THEME.colors.textPrimary }}>
                {customer?.shopName || customer?.ownerName}
              </div>
              {customer?.ownerName && (
                <div style={{ fontSize: "12px", color: THEME.colors.textSecondary, marginTop: 2 }}>Prop: {customer.ownerName}</div>
              )}
              {customer?.address && (
                <div style={{ fontSize: "12px", color: THEME.colors.textSecondary, marginTop: 2 }}>{customer.address}</div>
              )}
              {customer?.phone && (
                <div style={{ fontSize: "12px", color: THEME.colors.textSecondary, marginTop: 2 }}>Phone: {customer.phone}</div>
              )}
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: THEME.colors.textSecondary, textTransform: "uppercase", marginBottom: 4 }}>
                FINANCIAL STATUS:
              </div>
              <div style={{ fontSize: "12px", color: THEME.colors.textSecondary }}>GSTIN: <strong>{customer?.gstin || "Unregistered"}</strong></div>
              <div style={{ fontSize: "12px", color: THEME.colors.textSecondary, marginTop: 2 }}>Credit Limit: <strong>₹{Number(customer?.creditLimit || 0).toLocaleString("en-IN")}</strong></div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: currentDue > 0 ? THEME.colors.danger : THEME.colors.success, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
                Current Due: ₹{currentDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="table-responsive-container" style={{ marginBottom: 20 }}>
            <table style={{ width: "100%", minWidth: 580, borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#F1F5F9", borderBottom: `2px solid ${THEME.colors.border}` }}>
                <th style={{ padding: "8px 10px", fontWeight: 700, color: THEME.colors.textSecondary }}>DATE</th>
                <th style={{ padding: "8px 10px", fontWeight: 700, color: THEME.colors.textSecondary }}>TYPE</th>
                <th style={{ padding: "8px 10px", fontWeight: 700, color: THEME.colors.textSecondary }}>REF #</th>
                <th style={{ padding: "8px 10px", fontWeight: 700, color: THEME.colors.textSecondary, textAlign: "right" }}>DEBIT (+)</th>
                <th style={{ padding: "8px 10px", fontWeight: 700, color: THEME.colors.textSecondary, textAlign: "right" }}>CREDIT (-)</th>
                <th style={{ padding: "8px 10px", fontWeight: 700, color: THEME.colors.textSecondary, textAlign: "right" }}>BALANCE (₹)</th>
              </tr>
            </thead>
            <tbody>
              {statement.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 24, textAlign: "center", color: THEME.colors.textMuted }}>
                    No ledger entries recorded yet.
                  </td>
                </tr>
              ) : (
                statement.map((entry, idx) => (
                  <tr key={idx} style={{ borderBottom: `1px solid ${THEME.colors.borderSubtle}` }}>
                    <td style={{ padding: "8px 10px", fontVariantNumeric: "tabular-nums" }}>
                      {entry.transactionDate ? new Date(entry.transactionDate).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td style={{ padding: "8px 10px", fontWeight: 600 }}>{entry.transactionType}</td>
                    <td style={{ padding: "8px 10px", fontFamily: "monospace" }}>{entry.referenceNo || "—"}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", color: THEME.colors.danger, fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                      {Number(entry.debit) > 0 ? `₹${Number(entry.debit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                    </td>
                    <td style={{ padding: "8px 10px", textAlign: "right", color: THEME.colors.success, fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
                      {Number(entry.credit) > 0 ? `₹${Number(entry.credit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—"}
                    </td>
                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 800, color: THEME.colors.textPrimary, fontVariantNumeric: "tabular-nums" }}>
                      ₹{Number(entry.runningBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr style={{ background: "#F8FAFC", borderTop: `2px solid ${THEME.colors.border}`, fontWeight: 800 }}>
                <td colSpan={3} style={{ padding: "10px 10px", textAlign: "right" }}>NET OUTSTANDING BALANCE:</td>
                <td colSpan={3} style={{ padding: "10px 10px", textAlign: "right", color: currentDue > 0 ? THEME.colors.danger : THEME.colors.success, fontSize: "14px", fontVariantNumeric: "tabular-nums" }}>
                  ₹{currentDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
          </div>

          {/* Document Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, borderTop: `1px dashed ${THEME.colors.border}`, paddingTop: 20, fontSize: "11px", color: THEME.colors.textSecondary }}>
            <div>
              • This is a computer-generated double-entry financial ledger statement.<br />
              • For any reconciliation queries, please contact WB-Store Accounts at +91 98765 43210.
            </div>
            <div style={{ textAlign: "right" }}>
              Authorized Signatory<br />
              <strong>WB-Store (Surat)</strong>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            background: #fff !important;
            padding: 0 !important;
          }
          .no-print, aside, header {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          #printable-statement {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </MainLayout>
  );
}
