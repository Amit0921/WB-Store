import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getInvoiceById, cancelInvoice } from "../../api/invoiceApi";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Icon from "../../components/ui/Icon";
import { colors, radius, shadows } from "../../utils/theme";

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = currentUser?.roles?.includes("ADMIN");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getInvoiceById(id);
        setInvoice(data);
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setError("Failed to load invoice details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel and void this invoice? This will reverse any pending due on customer ledger.")) {
      return;
    }
    try {
      setCancelling(true);
      const updated = await cancelInvoice(id);
      setInvoice(updated);
      alert("Invoice has been cancelled and voided.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel invoice.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 360, color: colors.textSecondary, gap: 10 }}>
          <Icon name="spinner" size={20} className="spin" color={colors.primary} />
          <span style={{ fontSize: 14 }}>Loading invoice #{id}...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !invoice) {
    return (
      <MainLayout>
        <div style={{ maxWidth: 640, margin: "40px auto" }}>
          <Card style={{ textAlign: "center", padding: 32 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FEE2E2", color: colors.danger, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Icon name="alert-triangle" size={22} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary, margin: "0 0 6px" }}>Invoice Not Found</h2>
            <p style={{ fontSize: 13, color: colors.textSecondary, margin: "0 0 20px" }}>{error || "The requested invoice could not be located."}</p>
            <Button variant="secondary" onClick={() => navigate("/invoices")} icon="arrow-left">
              Back to Invoices
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const isCancelled = invoice.invoiceStatus === "CANCELLED";
  const formattedDate = invoice.invoiceDate
    ? new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <MainLayout>
      <div style={{ maxWidth: 880, margin: "0 auto", paddingBottom: 60 }}>
        {/* Screen Action Bar (Hidden on print) */}
        <div
          className="no-print"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: radius.lg,
            padding: "12px 18px",
            boxShadow: shadows.xs,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button
              variant="secondary"
              size="sm"
              icon="arrow-left"
              onClick={() => navigate("/invoices")}
            >
              Back
            </Button>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: colors.textSecondary }}>Invoice:</span>
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: colors.textPrimary }}>
                {invoice.invoiceNo}
              </span>
              <Badge
                variant={isCancelled ? "danger" : invoice.paymentStatus === "PAID" ? "success" : invoice.paymentStatus === "PARTIAL" ? "warning" : "danger"}
              >
                {isCancelled ? "CANCELLED / VOID" : invoice.paymentStatus}
              </Badge>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {!isCancelled && (
              <a
                href={`https://api.whatsapp.com/send?phone=${encodeURIComponent(invoice.customerPhone || "")}&text=${encodeURIComponent(
                  `Hello ${invoice.customerName},\n\nYour GST Invoice #${invoice.invoiceNo} from WB-STORE WHOLESALE GARMENTS has been issued.\nTotal Amount: ₹${Number(invoice.finalAmount || 0).toLocaleString("en-IN")}\nAmount Paid: ₹${Number(invoice.paidAmount || 0).toLocaleString("en-IN")}\nBalance Due: ₹${Number(invoice.dueAmount || 0).toLocaleString("en-IN")}\n\nBank Payment Details:\nHDFC Bank: 50200012345678 (IFSC: HDFC0001234)\nUPI: wbstore@hdfcbank\n\nThank you for doing business with WB-Store!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  icon="whatsapp"
                  style={{ color: "#16A34A", borderColor: "#86EFAC", background: "#F0FDF4" }}
                >
                  WhatsApp Bill
                </Button>
              </a>
            )}

            {!isCancelled && Number(invoice.dueAmount || 0) > 0 && (
              <Button
                variant="success"
                size="sm"
                icon="credit-card"
                onClick={() => navigate(`/payments/create?customerId=${invoice.customerId}&invoiceId=${invoice.id}`)}
              >
                Record Payment
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              icon="printer"
              onClick={handlePrint}
            >
              Print Tax Invoice (A4)
            </Button>

            {isOwner && !isCancelled && (
              <Button
                variant="danger"
                size="sm"
                icon="x"
                loading={cancelling}
                onClick={handleCancel}
              >
                Void Invoice
              </Button>
            )}
          </div>
        </div>

        {/* Printable A4 Tax Invoice Card */}
        <div
          id="printable-tax-invoice"
          className="printable-document-card"
          style={{
            position: "relative",
            color: colors.textPrimary,
          }}
        >
          {/* Watermark if Cancelled */}
          {isCancelled && (
            <div
              style={{
                position: "absolute",
                top: "40%",
                left: "25%",
                transform: "rotate(-30deg)",
                fontSize: 64,
                fontWeight: 900,
                color: "rgba(229, 72, 77, 0.14)",
                border: "6px dashed rgba(229, 72, 77, 0.25)",
                padding: "10px 40px",
                borderRadius: 16,
                pointerEvents: "none",
                userSelect: "none",
                letterSpacing: 4,
              }}
            >
              CANCELLED
            </div>
          )}

          {/* Invoice Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 14,
              borderBottom: `2px solid ${colors.primary}`,
              paddingBottom: 20,
              marginBottom: 24,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: colors.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  <Icon name="store" size={18} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, letterSpacing: "-0.5px" }}>
                  WB-STORE WHOLESALE GARMENTS
                </div>
              </div>
              <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                142/B Textile Market, Ring Road, Surat, Gujarat - 395002
              </div>
              <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                Phone: <strong style={{ color: colors.textPrimary }}>+91 98765 43210</strong> • GSTIN: <strong style={{ color: colors.textPrimary, fontFamily: "monospace" }}>24AAACW1234F1Z8</strong>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  display: "inline-block",
                  background: "#EEF2FF",
                  color: colors.primary,
                  fontWeight: 700,
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: radius.sm,
                  marginBottom: 8,
                  letterSpacing: "0.5px",
                }}
              >
                TAX INVOICE
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: colors.textPrimary, fontFamily: "monospace" }}>
                {invoice.invoiceNo}
              </div>
              <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 3 }}>
                Date: <strong style={{ color: colors.textPrimary }}>{formattedDate}</strong>
              </div>
              <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>State Code: 24 (Gujarat)</div>
            </div>
          </div>

          {/* Billed To / Consignee */}
          <div
            className="form-grid-responsive"
            style={{
              background: colors.background,
              padding: "16px 20px",
              borderRadius: radius.md,
              border: `1px solid ${colors.border}`,
              marginBottom: 24,
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                BILLED TO (CUSTOMER DETAILS)
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>{invoice.customerName}</div>
              {invoice.customerAddress && (
                <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 3 }}>{invoice.customerAddress}</div>
              )}
              <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                Phone: <strong style={{ color: colors.textPrimary }}>{invoice.customerPhone || "—"}</strong>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                TAX &amp; SUPPLY INFORMATION
              </div>
              <div style={{ fontSize: 13, color: colors.textPrimary }}>
                Customer GSTIN: <strong style={{ fontFamily: "monospace" }}>{invoice.customerGstin || "URP (Unregistered)"}</strong>
              </div>
              <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                Place of Supply: <strong style={{ color: colors.textPrimary }}>Gujarat (24)</strong>
              </div>
              <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                Payment Status:{" "}
                <Badge
                  variant={isCancelled ? "danger" : invoice.paymentStatus === "PAID" ? "success" : invoice.paymentStatus === "PARTIAL" ? "warning" : "danger"}
                >
                  {invoice.paymentStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="table-responsive-container" style={{ marginBottom: 24 }}>
            <table style={{ width: "100%", minWidth: 580, borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: colors.background, borderBottom: `2px solid ${colors.border}`, textAlign: "left" }}>
                <th style={{ padding: "10px 10px", width: "5%", color: colors.textSecondary, fontWeight: 600 }}>#</th>
                <th style={{ padding: "10px 10px", width: "38%", color: colors.textSecondary, fontWeight: 600 }}>DESCRIPTION OF GOODS</th>
                <th style={{ padding: "10px 10px", width: "12%", color: colors.textSecondary, fontWeight: 600 }}>HSN/SAC</th>
                <th style={{ padding: "10px 10px", width: "11%", color: colors.textSecondary, fontWeight: 600 }}>SIZE</th>
                <th style={{ padding: "10px 10px", textAlign: "right", width: "10%", color: colors.textSecondary, fontWeight: 600 }}>QTY</th>
                <th style={{ padding: "10px 10px", textAlign: "right", width: "12%", color: colors.textSecondary, fontWeight: 600 }}>RATE (₹)</th>
                <th style={{ padding: "10px 10px", textAlign: "right", width: "12%", color: colors.textSecondary, fontWeight: 600 }}>AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, idx) => (
                  <tr key={item.id || idx} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: "10px 10px", color: colors.textSecondary, fontVariantNumeric: "tabular-nums" }}>{idx + 1}</td>
                    <td style={{ padding: "10px 10px" }}>
                      <div style={{ fontWeight: 600, color: colors.textPrimary }}>{item.itemName}</div>
                      {item.brand && <div style={{ fontSize: 11, color: colors.textSecondary }}>Brand: {item.brand}</div>}
                    </td>
                    <td style={{ padding: "10px 10px", color: colors.textSecondary, fontFamily: "monospace" }}>{item.hsnCode || "6205"}</td>
                    <td style={{ padding: "10px 10px", color: colors.textPrimary }}>{item.size || "Free"}</td>
                    <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 600, color: colors.textPrimary, fontVariantNumeric: "tabular-nums" }}>
                      {Number(item.quantity || 0)} {item.unit || "PCS"}
                    </td>
                    <td style={{ padding: "10px 10px", textAlign: "right", color: colors.textPrimary, fontVariantNumeric: "tabular-nums" }}>
                      ₹{Number(item.rate || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 700, color: colors.textPrimary, fontVariantNumeric: "tabular-nums" }}>
                      ₹{Number(item.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ padding: 24, textAlign: "center", color: colors.textSecondary }}>No line items found.</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>

          {/* Financial Totals Calculation Box */}
          <div className="layout-split-responsive" style={{ gap: 20, marginBottom: 28 }}>
            {/* Bank details & Terms */}
            <div
              style={{
                fontSize: 11,
                color: colors.textSecondary,
                lineHeight: 1.6,
                background: colors.background,
                padding: "14px 18px",
                borderRadius: radius.md,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div style={{ fontWeight: 700, color: colors.textPrimary, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="credit-card" size={13} color={colors.primary} />
                <span>BANK PAYMENT DETAILS</span>
              </div>
              <div>Bank: <strong>HDFC Bank Ltd</strong> (Ring Road Branch)</div>
              <div>A/C Name: <strong>WB-Store Garments Wholesale</strong></div>
              <div>A/C No: <strong style={{ fontFamily: "monospace" }}>50200012345678</strong> | IFSC: <strong style={{ fontFamily: "monospace" }}>HDFC0001234</strong></div>
              <div>UPI ID: <strong style={{ color: colors.primary }}>wbstore@hdfcbank</strong></div>
              <div style={{ marginTop: 10, borderTop: `1px solid ${colors.border}`, paddingTop: 6, fontSize: 10, color: colors.textSecondary }}>
                * Goods once sold will not be accepted back without prior written approval. Subject to Surat jurisdiction.
              </div>
            </div>

            {/* Calculations Panel */}
            <div style={{ border: `1px solid ${colors.border}`, borderRadius: radius.md, overflow: "hidden", fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: `1px solid ${colors.border}` }}>
                <span style={{ color: colors.textSecondary }}>Subtotal:</span>
                <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  ₹{Number(invoice.subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {Number(invoice.discountAmount || 0) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: `1px solid ${colors.border}`, color: colors.success }}>
                  <span>Trade Discount:</span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    - ₹{Number(invoice.discountAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: `1px solid ${colors.border}` }}>
                <span style={{ color: colors.textSecondary }}>GST Tax (5%):</span>
                <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  ₹{Number(invoice.gstAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "#EEF2FF",
                  borderBottom: `1px solid #E0E7FF`,
                  fontSize: 14,
                  fontWeight: 800,
                  color: colors.primary,
                }}
              >
                <span>Invoice Total:</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  ₹{Number(invoice.finalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderBottom: `1px solid ${colors.border}`, color: colors.success }}>
                <span style={{ color: colors.textSecondary }}>Amount Paid:</span>
                <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  ₹{Number(invoice.paidAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: colors.surface,
                  fontWeight: 800,
                  color: Number(invoice.dueAmount || 0) > 0 ? colors.danger : colors.success,
                  fontSize: 13,
                }}
              >
                <span>Balance Due:</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  ₹{Number(invoice.dueAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 32, paddingTop: 18, borderTop: `1px solid ${colors.border}` }}>
            <div style={{ fontSize: 11, color: colors.textSecondary }}>
              Customer Signature: _______________________
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.textPrimary }}>For WB-STORE WHOLESALE</div>
              <div style={{ height: 44 }}></div>
              <div style={{ fontSize: 11, color: colors.textSecondary, borderTop: `1px dashed ${colors.border}`, paddingTop: 4 }}>
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body {
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          aside, nav, .no-print, header {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
          }
          #printable-tax-invoice {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </MainLayout>
  );
}
