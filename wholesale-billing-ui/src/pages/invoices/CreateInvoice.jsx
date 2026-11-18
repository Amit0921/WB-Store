import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getAllCustomers } from "../../api/customerApi";
import { createInvoice } from "../../api/invoiceApi";
import { autocompleteProducts } from "../../api/productApi";
import { THEME } from "../../utils/theme";
import Icon from "../../components/ui/Icon";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get("customerId");

  const [customers, setCustomers] = useState([]);
  const [productList, setProductList] = useState([]);
  const [customerId, setCustomerId] = useState(preselectedCustomerId || "");
  const [gstPercentage, setGstPercentage] = useState("5");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [paidAmount, setPaidAmount] = useState("0");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [items, setItems] = useState([
    { itemCode: "ITM-01", itemName: "", brand: "Standard", color: "Standard", size: "L", quantity: 10, unit: "PCS", rate: 0 },
  ]);

  useEffect(() => {
    getAllCustomers()
      .then((data) => setCustomers(data || []))
      .catch((err) => console.error("Error loading customers:", err));

    autocompleteProducts()
      .then((res) => setProductList(res.data?.data || []))
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === "itemName") {
      const match = productList.find(
        (p) => p.name.toLowerCase() === value.toLowerCase()
      );
      if (match) {
        if (match.sku) updated[index].itemCode = match.sku;
        if (match.brand) updated[index].brand = match.brand;
        if (match.unit) updated[index].unit = match.unit;
        if (match.defaultPrice) updated[index].rate = Number(match.defaultPrice);
      }
    }
    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      { itemCode: `ITM-0${items.length + 1}`, itemName: "", brand: "Standard", color: "Standard", size: "M", quantity: 1, unit: "PCS", rate: 0 },
    ]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

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

  // Financial Calculations
  const subtotal = items.reduce((sum, it) => sum + (Number(it.quantity || 0) * Number(it.rate || 0)), 0);
  const discount = Number(discountAmount) || 0;
  const taxable = Math.max(0, subtotal - discount);
  const gstRate = Number(gstPercentage) || 0;
  const gstAmount = Math.round((taxable * gstRate) / 100);
  const finalAmount = taxable + gstAmount;
  const advance = Number(paidAmount) || 0;
  const dueAmount = Math.max(0, finalAmount - advance);

  const selectedCustomer = customers.find((c) => c.id === Number(customerId));

  const handleSubmit = async () => {
    if (!customerId) {
      setError("Please select a wholesale customer account.");
      return;
    }
    if (items.some((it) => !it.itemName.trim() || Number(it.quantity) <= 0 || Number(it.rate) <= 0)) {
      setError("All line items must have a garment name, quantity > 0, and rate > 0.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        customerId: Number(customerId),
        discountAmount: discount,
        paidAmount: advance,
        gstPercentage: gstRate,
        notes: notes || "Wholesale garment tax invoice",
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

      const res = await createInvoice(payload);
      navigate(`/invoices/${res.id}`);
    } catch (err) {
      console.error("Error creating invoice:", err);
      setError(err.response?.data?.message || "Failed to generate invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout maxWidth={1120}>
      <PageHeader
        title="Create Wholesale Invoice"
        subtitle="Generate GST tax bill and record debit entry to client ledger"
        breadcrumbs={[
          { label: "Commerce", path: "/dashboard" },
          { label: "Invoices", path: "/invoices" },
          { label: "New Bill" },
        ]}
        actions={
          <Button variant="secondary" onClick={() => navigate("/invoices")}>
            Cancel
          </Button>
        }
      />

      {error && (
        <div
          style={{
            background: THEME.colors.dangerBg,
            border: `1px solid ${THEME.colors.dangerBorder}`,
            color: THEME.colors.danger,
            borderRadius: THEME.radius.md,
            padding: "12px 16px",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
          }}
        >
          <Icon name="alert-circle" size={16} color={THEME.colors.danger} />
          <span>{error}</span>
        </div>
      )}

      <datalist id="wholesale-products-list">
        {productList.map((p) => (
          <option key={p.id} value={p.name}>
            [{p.sku || "SKU"}] ₹{p.defaultPrice} - {p.category}
          </option>
        ))}
      </datalist>

      <div
        className="layout-split-responsive create-invoice-grid"
        style={{
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Left Column: Customer & Line Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Customer Selection Card */}
          <Card title="Customer Account" subtitle="Select buyer or shop profile">
            <Select
              label="Wholesale Buyer"
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">-- Choose Registered Customer --</option>
              {wholesaleCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.shopName || c.ownerName} ({c.phone}) — Current Due: ₹{Number(c.currentDue || 0).toLocaleString("en-IN")}
                </option>
              ))}
            </Select>

            {selectedCustomer && (
              <div
                style={{
                  marginTop: 14,
                  padding: "12px 14px",
                  background: "#F8FAFC",
                  borderRadius: THEME.radius.md,
                  border: `1px solid ${THEME.colors.borderSubtle}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                  fontSize: "12px",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: THEME.colors.textPrimary }}>
                    {selectedCustomer.shopName}
                  </div>
                  <div style={{ color: THEME.colors.textMuted, marginTop: 2 }}>
                    GSTIN: {selectedCustomer.gstin || "Unregistered"} • Ph: {selectedCustomer.phone}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: THEME.colors.textSecondary }}>Outstanding Balance:</div>
                  <div style={{ fontWeight: 800, color: Number(selectedCustomer.currentDue) > 0 ? THEME.colors.danger : THEME.colors.success, fontVariantNumeric: "tabular-nums" }}>
                    ₹{Number(selectedCustomer.currentDue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Line Items Card */}
          <Card
            title="Garment Line Items"
            subtitle="Pieces, rates, sizes, and item codes"
            action={
              <Button size="sm" variant="secondary" onClick={addItem} icon={<Icon name="plus" size={13} />}>
                Add Item
              </Button>
            }
          >
            <div className="table-responsive-container">
              <table style={{ width: "100%", minWidth: 540, borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: `1px solid ${THEME.colors.borderSubtle}` }}>
                    <th style={{ padding: "8px 10px", width: "35%", color: THEME.colors.textSecondary, fontWeight: 700 }}>ITEM / GARMENT</th>
                    <th style={{ padding: "8px 8px", width: "15%", color: THEME.colors.textSecondary, fontWeight: 700 }}>SIZE</th>
                    <th style={{ padding: "8px 8px", width: "12%", textAlign: "right", color: THEME.colors.textSecondary, fontWeight: 700 }}>QTY</th>
                    <th style={{ padding: "8px 8px", width: "18%", textAlign: "right", color: THEME.colors.textSecondary, fontWeight: 700 }}>RATE (₹)</th>
                    <th style={{ padding: "8px 8px", width: "15%", textAlign: "right", color: THEME.colors.textSecondary, fontWeight: 700 }}>AMOUNT (₹)</th>
                    <th style={{ padding: "8px 4px", width: "5%" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => {
                    const rowAmount = Number(it.quantity || 0) * Number(it.rate || 0);
                    return (
                      <tr key={idx} style={{ borderBottom: `1px solid ${THEME.colors.borderSubtle}` }}>
                        <td style={{ padding: "8px 6px" }}>
                          <input
                            type="text"
                            list="wholesale-products-list"
                            placeholder="Select garment or type..."
                            value={it.itemName}
                            onChange={(e) => handleItemChange(idx, "itemName", e.target.value)}
                            style={{
                              width: "100%",
                              padding: "6px 8px",
                              border: `1px solid ${THEME.colors.border}`,
                              borderRadius: THEME.radius.sm,
                              fontSize: "12px",
                              boxSizing: "border-box",
                              outline: "none",
                            }}
                          />
                        </td>
                        <td style={{ padding: "8px 6px" }}>
                          <input
                            type="text"
                            placeholder="Free, M, L"
                            value={it.size}
                            onChange={(e) => handleItemChange(idx, "size", e.target.value)}
                            style={{
                              width: "100%",
                              padding: "6px 8px",
                              border: `1px solid ${THEME.colors.border}`,
                              borderRadius: THEME.radius.sm,
                              fontSize: "12px",
                              boxSizing: "border-box",
                              outline: "none",
                            }}
                          />
                        </td>
                        <td style={{ padding: "8px 6px" }}>
                          <input
                            type="number"
                            min="1"
                            value={it.quantity}
                            onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                            style={{
                              width: "100%",
                              padding: "6px 8px",
                              border: `1px solid ${THEME.colors.border}`,
                              borderRadius: THEME.radius.sm,
                              fontSize: "12px",
                              textAlign: "right",
                              boxSizing: "border-box",
                              outline: "none",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          />
                        </td>
                        <td style={{ padding: "8px 6px" }}>
                          <input
                            type="number"
                            min="0"
                            value={it.rate}
                            onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                            style={{
                              width: "100%",
                              padding: "6px 8px",
                              border: `1px solid ${THEME.colors.border}`,
                              borderRadius: THEME.radius.sm,
                              fontSize: "12px",
                              textAlign: "right",
                              fontWeight: 600,
                              boxSizing: "border-box",
                              outline: "none",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          />
                        </td>
                        <td style={{ padding: "8px 6px", textAlign: "right", fontWeight: 700, color: THEME.colors.textPrimary, fontVariantNumeric: "tabular-nums" }}>
                          ₹{rowAmount.toFixed(2)}
                        </td>
                        <td style={{ padding: "8px 4px", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            disabled={items.length <= 1}
                            style={{
                              background: "none",
                              border: "none",
                              color: items.length <= 1 ? "#CBD5E1" : THEME.colors.danger,
                              cursor: items.length <= 1 ? "not-allowed" : "pointer",
                              padding: 4,
                            }}
                          >
                            <Icon name="x" size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={addItem}
              style={{ marginTop: 12 }}
              icon={<Icon name="plus" size={13} />}
            >
              Add Another Garment Line
            </Button>
          </Card>

          {/* Notes Card */}
          <Card title="Invoice Remarks" subtitle="Optional transport / delivery notes">
            <Input
              placeholder="e.g. Dispatched via Surat Roadways LR# 9482, Delivery at Surat Depot"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Card>
        </div>

        {/* Right Column: Order Summary & Checkout */}
        <div style={{ position: "sticky", top: 80 }}>
          <Card title="Financial Summary">
            <div style={{ display: "flex", flexDirection: "column", gap: 12, borderBottom: `1px solid ${THEME.colors.borderSubtle}`, paddingBottom: 16, marginBottom: 16, fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: THEME.colors.textSecondary }}>Subtotal:</span>
                <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>₹{subtotal.toFixed(2)}</span>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: THEME.colors.textSecondary, display: "block", marginBottom: 4 }}>
                  Discount Amount (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    border: `1px solid ${THEME.colors.border}`,
                    borderRadius: THEME.radius.sm,
                    fontSize: "13px",
                    fontWeight: 600,
                    textAlign: "right",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: THEME.colors.textSecondary }}>Taxable Value:</span>
                <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>₹{taxable.toFixed(2)}</span>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: 600, color: THEME.colors.textSecondary, display: "block", marginBottom: 4 }}>
                  GST Tax Slab
                </label>
                <select
                  value={gstPercentage}
                  onChange={(e) => setGstPercentage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    border: `1px solid ${THEME.colors.border}`,
                    borderRadius: THEME.radius.sm,
                    fontSize: "13px",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                >
                  <option value="0">0% (Nil / Exempted)</option>
                  <option value="5">5% (Garments &lt; ₹1,000 / Standard)</option>
                  <option value="12">12% (Garments &gt; ₹1,000)</option>
                  <option value="18">18% (Synthetic / Fabrics)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: THEME.colors.textSecondary }}>GST Amount ({gstPercentage}%):</span>
                <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>₹{gstAmount.toFixed(2)}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "18px",
                  fontWeight: 800,
                  color: THEME.colors.primary,
                  paddingTop: 10,
                  borderTop: `1px solid ${THEME.colors.borderSubtle}`,
                }}
              >
                <span>Grand Total:</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>₹{finalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Advance Payment Settlement */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: THEME.colors.textSecondary, display: "block", marginBottom: 4 }}>
                ADVANCE PAID NOW (₹)
              </label>
              <input
                type="number"
                min="0"
                max={finalAmount}
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: `1px solid ${THEME.colors.border}`,
                  borderRadius: THEME.radius.sm,
                  fontSize: "14px",
                  fontWeight: 700,
                  color: THEME.colors.success,
                  textAlign: "right",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: "12px" }}>
                <span style={{ color: THEME.colors.textSecondary }}>Remaining Balance:</span>
                <strong style={{ color: dueAmount > 0 ? THEME.colors.danger : THEME.colors.success, fontVariantNumeric: "tabular-nums" }}>
                  ₹{dueAmount.toFixed(2)}
                </strong>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || finalAmount <= 0}
              loading={loading}
              style={{ width: "100%" }}
              size="lg"
              iconRight={<Icon name="arrow-right" size={15} />}
            >
              Generate Bill &amp; Save
            </Button>
          </Card>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .create-invoice-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </MainLayout>
  );
}
