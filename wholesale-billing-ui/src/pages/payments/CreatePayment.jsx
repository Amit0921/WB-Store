import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getAllCustomers } from "../../api/customerApi";
import { receivePayment } from "../../api/paymentApi";

export default function CreatePayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get("customerId");

  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState(preselectedCustomerId || "");
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
        amount: payAmt,
        paymentMode: paymentMode,
        referenceNumber: referenceNumber || "N/A",
        notes: notes || "Payment received at counter",
      };

      await receivePayment(payload);
      alert("Payment recorded successfully and posted to ledger!");
      navigate(`/customers/${customerId}/summary`);
    } catch (err) {
      console.error("Error recording payment:", err);
      setError(err.response?.data?.message || "Failed to record payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 720, paddingBottom: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Record Customer Payment</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Collect cash, UPI, or bank transfer against customer ledger</p>
          </div>
          <button onClick={() => navigate("/customers")} style={btnSecondary}>
            Cancel
          </button>
        </div>

        {error && (
          <div style={{ background: "#fdecea", color: "#c0392b", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Customer Selection */}
          <div>
            <label style={labelStyle}>Wholesale Customer *</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              style={inputStyle}
              required
            >
              <option value="">-- Choose a Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.shopName || c.ownerName} ({c.phone}) — Outstanding: ₹{Number(c.currentDue || 0).toLocaleString("en-IN")}
                </option>
              ))}
            </select>
          </div>

          {/* Current Due and Live Balance Preview */}
          {selectedCustomer && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div>
                <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>CURRENT OUTSTANDING:</span>
                <div style={{ fontSize: 18, fontWeight: 700, color: currentDue > 0 ? "#dc2626" : "#16a34a", marginTop: 2 }}>
                  ₹{currentDue.toLocaleString("en-IN")}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>REMAINING AFTER THIS PAYMENT:</span>
                <div style={{ fontSize: 18, fontWeight: 700, color: remainingDue > 0 ? "#b45309" : "#16a34a", marginTop: 2 }}>
                  ₹{remainingDue.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          )}

          {/* Amount Field */}
          <div>
            <label style={labelStyle}>Amount Received (₹) *</label>
            <input
              type="number"
              min="1"
              step="any"
              placeholder="e.g. 25000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ ...inputStyle, fontSize: 18, fontWeight: 700, color: "#1e293b" }}
              required
            />
          </div>

          {/* Payment Mode Selector */}
          <div>
            <label style={labelStyle}>Payment Mode *</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "CARD"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  style={{
                    padding: "10px 4px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
                    border: paymentMode === mode ? "2px solid #4361ee" : "1px solid #cbd5e1",
                    background: paymentMode === mode ? "#eff6ff" : "#fff",
                    color: paymentMode === mode ? "#4361ee" : "#475569",
                  }}
                >
                  {mode.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Reference Number */}
          <div>
            <label style={labelStyle}>Transaction Reference / UTR Number {paymentMode !== "CASH" ? "*" : ""}</label>
            <input
              type="text"
              placeholder={paymentMode === "UPI" ? "e.g. PhonePe / GPay Ref ID" : "e.g. Cheque No / Bank UTR"}
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={labelStyle}>Notes / Remarks</label>
            <textarea
              rows={2}
              placeholder="e.g. Received part payment for Diwali stock"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 28px", background: "#10b981", color: "#fff",
                border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
            >
              {loading ? "Recording Payment..." : "✓ Confirm & Post to Ledger"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}

const labelStyle = { display: "block", fontSize: 12, color: "#475569", marginBottom: 6, fontWeight: 600 };
const inputStyle = { width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" };
const btnSecondary = { padding: "8px 16px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 };
