import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getPaymentById } from "../../api/paymentApi";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/ui/Icon";
import { colors, radius, shadows } from "../../utils/theme";

export default function PaymentReceipt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getPaymentById(id);
        setPayment(data);
      } catch (err) {
        console.error("Error fetching payment:", err);
        setError("Failed to load payment voucher details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 360, color: colors.textSecondary, gap: 10 }}>
          <Icon name="spinner" size={20} className="spin" color={colors.primary} />
          <span style={{ fontSize: 14 }}>Loading payment receipt #{id}...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !payment) {
    return (
      <MainLayout>
        <div style={{ maxWidth: 640, margin: "40px auto" }}>
          <Card style={{ textAlign: "center", padding: 32 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FEE2E2", color: colors.danger, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Icon name="alert-triangle" size={22} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary, margin: "0 0 6px" }}>Payment Voucher Not Found</h2>
            <p style={{ fontSize: 13, color: colors.textSecondary, margin: "0 0 20px" }}>{error || "The requested payment voucher could not be loaded."}</p>
            <Button variant="secondary" onClick={() => navigate("/payments")} icon="arrow-left">
              Back to Payments
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const formattedDate = payment.paymentDate
    ? new Date(payment.paymentDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <MainLayout>
      <div style={{ maxWidth: 740, margin: "0 auto", paddingBottom: 60 }}>
        {/* Action bar (Hidden on print) */}
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
          <Button
            variant="secondary"
            size="sm"
            icon="arrow-left"
            onClick={() => navigate("/payments")}
          >
            Back to Payments
          </Button>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <a
              href={`https://api.whatsapp.com/send?phone=${encodeURIComponent(payment.customerPhone || "")}&text=${encodeURIComponent(
                `Hello ${payment.customerName},\n\nWe have received your payment of ₹${Number(payment.amount || 0).toLocaleString("en-IN")} via ${payment.paymentMode}.\nReceipt Voucher No: ${payment.receiptNo || "REC-" + payment.id}\nRemaining Ledger Due: ₹${Number(payment.remainingDue || 0).toLocaleString("en-IN")}.\n\nThank you!\nWB-Store Wholesale Garments`
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
                WhatsApp Receipt
              </Button>
            </a>

            <Button
              variant="success"
              size="sm"
              icon="printer"
              onClick={handlePrint}
            >
              Print Receipt Voucher
            </Button>
          </div>
        </div>

        {/* Payment Receipt Card */}
        <div
          id="printable-payment-receipt"
          className="printable-document-card"
          style={{
            color: colors.textPrimary,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 14,
              borderBottom: `2px solid ${colors.success}`,
              paddingBottom: 18,
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
                    background: colors.success,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  <Icon name="check" size={18} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: colors.textPrimary, letterSpacing: "-0.5px" }}>
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
                  background: "#ECFDF5",
                  color: colors.success,
                  fontWeight: 700,
                  fontSize: 11,
                  padding: "4px 10px",
                  borderRadius: radius.sm,
                  marginBottom: 6,
                  letterSpacing: "0.5px",
                }}
              >
                PAYMENT RECEIPT
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary, fontFamily: "monospace" }}>
                {payment.receiptNo || `REC-${payment.id}`}
              </div>
              <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 3 }}>
                Date: <strong style={{ color: colors.textPrimary }}>{formattedDate}</strong>
              </div>
            </div>
          </div>

          {/* Received From Box */}
          <div
            style={{
              background: colors.background,
              padding: "16px 20px",
              borderRadius: radius.md,
              border: `1px solid ${colors.border}`,
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
              RECEIVED WITH THANKS FROM:
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary }}>
              {payment.customerName}
            </div>
            {payment.customerPhone && (
              <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 3 }}>
                Phone: <strong style={{ color: colors.textPrimary }}>{payment.customerPhone}</strong>
              </div>
            )}
            {payment.invoiceNo && (
              <div style={{ fontSize: 12, color: colors.primary, fontWeight: 600, marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="file-text" size={13} />
                <span>Settled Against Wholesale Invoice: <strong style={{ fontFamily: "monospace" }}>#{payment.invoiceNo}</strong></span>
              </div>
            )}
          </div>

          {/* Amount Box */}
          <div
            style={{
              border: `2px dashed #86EFAC`,
              background: "#F0FDF4",
              padding: "20px 24px",
              borderRadius: radius.lg,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 14,
              marginBottom: 24,
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: colors.success, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                AMOUNT RECEIVED:
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: "#15803D",
                  marginTop: 2,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ₹{Number(payment.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: "#166534" }}>
                Mode of Payment: <Badge variant="success">{payment.paymentMode}</Badge>
              </div>
              {payment.referenceNumber && (
                <div style={{ fontSize: 11, color: "#166534", marginTop: 4, fontFamily: "monospace" }}>
                  Ref / UTR: <strong>{payment.referenceNumber}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Remaining Balance status */}
          <div
            className="form-grid-responsive"
            style={{
              gap: 16,
              fontSize: 12,
              borderBottom: `1px solid ${colors.border}`,
              paddingBottom: 16,
              marginBottom: 24,
            }}
          >
            <div>
              <span style={{ color: colors.textSecondary }}>Payment Remarks: </span>
              <strong style={{ color: colors.textPrimary }}>{payment.notes || "Payment received with thanks."}</strong>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ color: colors.textSecondary }}>Remaining Customer Ledger Due: </span>
              <strong
                style={{
                  color: Number(payment.remainingDue || 0) > 0 ? colors.danger : colors.success,
                  fontSize: 14,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                ₹{Number(payment.remainingDue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          {/* Signatures */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 36 }}>
            <div style={{ fontSize: 11, color: colors.textSecondary }}>
              * Computer generated receipt voucher • Valid without physical signature
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.textPrimary }}>WB-STORE WHOLESALE</div>
              <div style={{ height: 44 }}></div>
              <div style={{ fontSize: 11, color: colors.textSecondary, borderTop: `1px dashed ${colors.border}`, paddingTop: 4 }}>
                Authorized Receiver / Cashier
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body {
            background: #fff !important;
            margin: 0 !important;
          }
          aside, nav, .no-print, header {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
          }
          #printable-payment-receipt {
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
