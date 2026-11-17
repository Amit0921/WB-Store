import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getAllCustomers } from "../../api/customerApi";
import { createInvoice } from "../../api/invoiceApi";

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get("customerId");

  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState(preselectedCustomerId || "");
  const [gstPercentage, setGstPercentage] = useState("5");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [paidAmount, setPaidAmount] = useState("0");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [items, setItems] = useState([
    { itemCode: "ITM-01", itemName: "Men's Cotton Shirt", brand: "WB", color: "Blue", size: "L", quantity: 10, unit: "PCS", rate: 450 },
  ]);

  useEffect(() => {
    getAllCustomers()
      .then((data) => setCustomers(data || []))
      .catch((err) => console.error("Error loading customers:", err));
  }, []);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      { itemCode: `ITM-0${items.length + 1}`, itemName: "", brand: "", color: "", size: "M", quantity: 1, unit: "PCS", rate: 0 },
    ]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, it) => sum + (Number(it.quantity || 0) * Number(it.rate || 0)), 0);
  const discount = Number(discountAmount) || 0;
  const taxable = Math.max(0, subtotal - discount);
  const gstRate = Number(gstPercentage) || 0;
  const gstAmount = (taxable * gstRate) / 100;
  const grandTotal = taxable + gstAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId) {
      setError("Please select a wholesale customer.");
      return;
    }
    if (items.some((it) => !it.itemName || Number(it.quantity) <= 0 || Number(it.rate) <= 0)) {
      setError("All line items must have a valid name, quantity > 0, and rate > 0.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        customerId: Number(customerId),
        discountAmount: discount,
        paidAmount: Number(paidAmount) || 0,
        gstPercentage: gstRate,
        notes: notes || "Wholesale garment invoice",
        items: items.map((it) => ({
          itemCode: it.itemCode || "GARMENT",
          itemName: it.itemName,
          brand: it.brand || "Standard",
          color: it.color || "Standard",
          size: it.size || "Free",
          quantity: Number(it.quantity),
          unit: it.unit || "PCS",
          rate: Number(it.rate),
        })),
      };

      await createInvoice(payload);
      alert("Invoice created successfully!");
      navigate(`/customers/${customerId}/summary`);
    } catch (err) {
      console.error("Error creating invoice:", err);
      setError(err.response?.data?.message || "Failed to generate invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 1080, paddingBottom: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Create Wholesale Invoice</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Generate GST bill and update customer ledger balance</p>
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
          {/* Left Form: Customer & Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Customer Picker */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20 }}>
              <label style={labelStyle}>Select Wholesale Customer *</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                style={inputStyle}
              >
                <option value="">-- Choose a Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.shopName || c.ownerName} ({c.phone}) — Due: ₹{Number(c.currentDue || 0).toLocaleString("en-IN")}
                  </option>
                ))}
              </select>
            </div>

            {/* Line Items Table */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Garment Line Items</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>Unit: Pieces (PCS)</span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "8px 6px", textAlign: "left", width: "35%" }}>ITEM / GARMENT</th>
                      <th style={{ padding: "8px 6px", textAlign: "left", width: "15%" }}>SIZE</th>
                      <th style={{ padding: "8px 6px", textAlign: "right", width: "15%" }}>QTY</th>
                      <th style={{ padding: "8px 6px", textAlign: "right", width: "15%" }}>RATE (₹)</th>
                      <th style={{ padding: "8px 6px", textAlign: "right", width: "15%" }}>TOTAL</th>
                      <th style={{ padding: "8px 6px", width: "5%" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px 4px" }}>
                          <input
                            type="text"
                            placeholder="e.g. Cotton Shirt"
                            value={it.itemName}
                            onChange={(e) => handleItemChange(idx, "itemName", e.target.value)}
                            style={{ ...inputStyle, padding: "6px 8px" }}
                          />
                        </td>
                        <td style={{ padding: "8px 4px" }}>
                          <input
                            type="text"
                            placeholder="M, L, XL"
                            value={it.size}
                            onChange={(e) => handleItemChange(idx, "size", e.target.value)}
                            style={{ ...inputStyle, padding: "6px 8px" }}
                          />
                        </td>
                        <td style={{ padding: "8px 4px" }}>
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                            style={{ ...inputStyle, textAlign: "right", padding: "6px 8px" }}
                          />
                        </td>
                        <td style={{ padding: "8px 4px" }}>
                          <input
                            type="number"
                            min="0"
                            value={it.rate}
                            onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                            style={{ ...inputStyle, textAlign: "right", padding: "6px 8px" }}
                          />
                        </td>
                        <td style={{ padding: "8px 6px", textAlign: "right", fontWeight: 600, color: "#1e293b" }}>
                          ₹{(Number(it.quantity || 0) * Number(it.rate || 0)).toLocaleString("en-IN")}
                        </td>
                        <td style={{ padding: "8px 4px", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14 }}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  onClick={addItem}
                  style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >
                  + Add Line Item
                </button>
              </div>
            </div>

            {/* Notes */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20 }}>
              <label style={labelStyle}>Invoice Notes / Terms</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special remarks or delivery details..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Bill Summary & Tax</span>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b" }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: 600, color: "#1e293b" }}>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#64748b" }}>
              <span>Discount (₹):</span>
              <input
                type="number"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                style={{ width: 90, padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1", textAlign: "right", fontSize: 12 }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#64748b" }}>
              <span>GST Rate:</span>
              <select
                value={gstPercentage}
                onChange={(e) => setGstPercentage(e.target.value)}
                style={{ width: 90, padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12 }}
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b" }}>
              <span>GST Amount:</span>
              <span style={{ fontWeight: 600, color: "#1e293b" }}>₹{gstAmount.toFixed(2)}</span>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Grand Total:</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#2563eb" }}>₹{grandTotal.toFixed(2)}</span>
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
              <label style={{ ...labelStyle, fontSize: 11 }}>Advance Paid on Delivery (₹):</label>
              <input
                type="number"
                min="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="0"
                style={{ ...inputStyle, padding: "6px 10px" }}
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: "100%", padding: "12px", background: "#4361ee", color: "#fff",
                  border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}
              >
                {loading ? "Generating Invoice..." : "✓ Generate Invoice"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

const labelStyle = { display: "block", fontSize: 12, color: "#475569", marginBottom: 6, fontWeight: 600 };
const inputStyle = { width: "100%", padding: "9px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" };
const btnSecondary = { padding: "8px 16px", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 };
