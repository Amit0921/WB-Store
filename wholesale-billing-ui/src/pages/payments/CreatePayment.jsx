import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getAllCustomers } from "../../api/customerApi";
import { receivePayment } from "../../api/paymentApi";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Icon from "../../components/ui/Icon";
import { colors, radius, shadows } from "../../utils/theme";

export default function CreatePayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get("customerId");
  const preselectedInvoiceId = searchParams.get("invoiceId");

  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState(preselectedCustomerId || "");
  const [invoiceId, setInvoiceId] = useState(preselectedInvoiceId || "");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllCustomers()
      .then((data) => setCustomers(data || []))
      .catch((err) => console.error("Error loading customers:", err));
  }, []);

  const isWholesaleCustomer = (c) => {
    if (!c || c.status === "INACTIVE") return false;
    const name = (c.shopName || "").toLowerCase();
    const owner = (c.ownerName || "").toLowerCase();
    const addr = (c.address || "").toLowerCase();
    if (name.includes("walk-in") || name.includes("walkin") || name.includes("counter cash")) return false;
    if (addr.includes("retail counter sale") || addr.includes("counter sale")) return false;
    if (name.endsWith(" retail") || owner.endsWith(" retail")) return false;
    return true;
  };
  const wholesaleCustomers = customers.filter(isWholesaleCustomer);

  const selectedCustomer = customers.find((c) => String(c.id) === String(customerId));
  const currentDue = selectedCustomer ? Number(selectedCustomer.currentDue || 0) : 0;
  const payAmt = Number(amount) || 0;
  const remainingDue = Math.max(0, currentDue - payAmt);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId) {
      setError("Please select a customer.");
      return;
    }
    if (payAmt <= 0) {
      setError("Payment amount must be greater than zero.");
      return;
    }
    if (payAmt > currentDue && currentDue > 0) {
      if (!window.confirm("Payment amount exceeds current due. Continue as advance?")) {
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        customerId: Number(customerId),
        invoiceId: invoiceId ? Number(invoiceId) : null,
        amount: payAmt,
        paymentMode: paymentMode,
        referenceNumber: referenceNumber || "N/A",
        notes: notes || "Payment received at counter",
      };

      const res = await receivePayment(payload);
      alert("Payment recorded successfully and posted to ledger!");
      if (res && res.id) {
        navigate(`/payments/${res.id}`);
      } else {
        navigate(`/payments`);
      }
    } catch (err) {
      console.error("Error recording payment:", err);
      setError(err.response?.data?.message || "Failed to record payment.");
    } finally {
      setLoading(false);
    }
  };

  const paymentModes = [
    { id: "UPI", label: "UPI / QR", icon: "zap" },
    { id: "CASH", label: "Cash", icon: "credit-card" },
    { id: "BANK_TRANSFER", label: "Bank Transfer", icon: "store" },
    { id: "CHEQUE", label: "Cheque", icon: "file-text" },
    { id: "CARD", label: "Card", icon: "credit-card" },
  ];

  return (
    <MainLayout>
      <div style={{ maxWidth: 740, margin: "0 auto", paddingBottom: 60 }}>
        <PageHeader
          title="Record Customer Payment"
          subtitle="Collect cash, UPI, or bank transfer against customer ledger and auto-settle outstanding invoices"
          breadcrumbs={[{ label: "Finance" }, { label: "Payments", href: "/payments" }, { label: "Record Payment" }]}
          actions={
            <Button
              variant="secondary"
              size="sm"
              icon="arrow-left"
              onClick={() => navigate("/payments")}
            >
              Cancel
            </Button>
          }
        />

        {error && (
          <div
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

        <Card>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Wholesale Customer Selection */}
            <div>
              <Select
                label="Wholesale Customer"
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                options={[
                  { label: "-- Choose a Wholesale Customer --", value: "" },
                  ...wholesaleCustomers.map((c) => ({
                    label: `${c.shopName || c.ownerName} (${c.phone}) — Outstanding: ₹${Number(c.currentDue || 0).toLocaleString("en-IN")}`,
                    value: c.id,
                  })),
                ]}
              />
            </div>

            {/* Current Due and Live Balance Preview */}
            {selectedCustomer && (
              <div
                className="form-grid-responsive"
                style={{
                  gap: 16,
                  background: colors.background,
                  padding: "16px 20px",
                  borderRadius: radius.md,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    CURRENT OUTSTANDING
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: currentDue > 0 ? colors.danger : colors.success,
                      marginTop: 4,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    ₹{currentDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    REMAINING AFTER THIS PAYMENT
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: remainingDue > 0 ? colors.warning : colors.success,
                      marginTop: 4,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    ₹{remainingDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            )}

            {/* Amount Field */}
            <div>
              <Input
                label="Amount Received (₹)"
                type="number"
                min="1"
                step="any"
                required
                placeholder="e.g. 25000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary, fontVariantNumeric: "tabular-nums" }}
              />
            </div>

            {/* Payment Mode Selector */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: colors.textPrimary, marginBottom: 8 }}>
                Payment Mode <span style={{ color: colors.danger }}>*</span>
              </label>
              <div className="payment-modes-grid" style={{ gap: 8 }}>
                {paymentModes.map((mode) => {
                  const active = paymentMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentMode(mode.id)}
                      style={{
                        padding: "10px 6px",
                        borderRadius: radius.md,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        border: `1px solid ${active ? colors.primary : colors.border}`,
                        background: active ? "#EEF2FF" : colors.surface,
                        color: active ? colors.primary : colors.textSecondary,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Icon name={mode.icon} size={16} />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reference Number */}
            <div>
              <Input
                label={`Transaction Reference / UTR Number ${paymentMode !== "CASH" ? "*" : "(Optional for Cash)"}`}
                placeholder={paymentMode === "UPI" ? "e.g. UPI Ref / GooglePay Transaction ID" : "e.g. Cheque No / Bank Transfer UTR"}
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: colors.textPrimary, marginBottom: 6 }}>
                Notes / Remarks
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Part payment received against festive season wholesale delivery"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: radius.md,
                  border: `1px solid ${colors.border}`,
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/payments")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                size="md"
                icon="check"
                loading={loading}
              >
                Confirm &amp; Post to Ledger
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
