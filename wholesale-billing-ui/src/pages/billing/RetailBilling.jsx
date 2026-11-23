import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getAllCustomers, createCustomer, searchCustomers } from "../../api/customerApi";
import { autocompleteProducts } from "../../api/productApi";
import { createInvoice } from "../../api/invoiceApi";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Icon from "../../components/ui/Icon";
import { colors, radius, shadows } from "../../utils/theme";

export default function RetailBilling() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [customerType, setCustomerType] = useState("WALK_IN"); // "WALK_IN" or "REGISTERED"
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [walkinName, setWalkinName] = useState("Walk-in Customer");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [products, setProducts] = useState([]);

  const [items, setItems] = useState([
    { itemCode: "", itemName: "", size: "Free", quantity: 1, rate: 0 },
  ]);

  const [paymentMode, setPaymentMode] = useState("CASH");
  const [cashTendered, setCashTendered] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Completed thermal bill slip state
  const [completedBill, setCompletedBill] = useState(null);

  useEffect(() => {
    getAllCustomers()
      .then((data) => {
        setCustomers(data || []);
      })
      .catch((err) => console.error("Error loading customers:", err));

    autocompleteProducts()
      .then((res) => setProducts(res.data?.data || []))
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  const handleItemChange = (idx, field, val) => {
    const updated = [...items];
    updated[idx][field] = val;

    if (field === "itemName") {
      const match = products.find(
        (p) => p.name.toLowerCase() === val.toLowerCase()
      );
      if (match) {
        if (match.sku) updated[idx].itemCode = match.sku;
        if (match.defaultPrice) updated[idx].rate = Number(match.defaultPrice);
      }
    }
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { itemCode: "", itemName: "", size: "Free", quantity: 1, rate: 0 }]);
  };

  const removeItem = (idx) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const isWholesaleCustomer = (c) => {
    if (!c || c.status === "INACTIVE") return false;
    const name = (c.shopName || "").toLowerCase();
    const owner = (c.ownerName || "").toLowerCase();
    const addr = (c.address || "").toLowerCase();

    // Filter out generic walk-ins and retail counter buyer profiles
    if (name.includes("walk-in") || name.includes("walkin") || name.includes("counter cash")) {
      return false;
    }
    if (addr.includes("retail counter sale") || addr.includes("counter sale")) {
      return false;
    }
    if (name.endsWith(" retail") || owner.endsWith(" retail")) {
      return false;
    }

    return true;
  };

  const wholesaleCustomers = customers.filter(isWholesaleCustomer);
  const selectedWholesaleCustomer = wholesaleCustomers.find((c) => String(c.id) === String(selectedCustomerId));

  const subtotal = items.reduce((s, it) => s + Number(it.quantity || 0) * Number(it.rate || 0), 0);
  const gstAmount = Math.round((subtotal * 5) / 100);
  const grandTotal = subtotal + gstAmount;
  const changeDue = Math.max(0, (Number(cashTendered) || 0) - grandTotal);

  const handleCompleteSale = async () => {
    if (items.some((it) => !it.itemName || Number(it.rate) <= 0)) {
      setError("Please ensure all line items have a valid name and price.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      let custId = null;
      let customerNameOnReceipt = "";

      if (customerType === "REGISTERED") {
        if (!selectedCustomerId) {
          setError("Please select a registered customer.");
          setLoading(false);
          return;
        }
        custId = Number(selectedCustomerId);
        const match = customers.find((c) => c.id === custId);
        customerNameOnReceipt = match ? match.shopName : "Registered Customer";
      } else {
        // Walk-in Retail Customer flow
        const targetName = walkinName.trim() || "Walk-in Customer";
        const targetPhone = walkinPhone.trim();

        if (targetPhone) {
          let existing = customers.find((c) => c.phone === targetPhone);
          if (!existing) {
            try {
              const searchRes = await searchCustomers({ keyword: targetPhone });
              if (Array.isArray(searchRes) && searchRes.length > 0) {
                existing = searchRes.find((c) => c.phone === targetPhone) || searchRes[0];
              }
            } catch (err) {
              console.warn("Search check failed:", err);
            }
          }

          if (existing) {
            custId = existing.id;
            customerNameOnReceipt = existing.shopName;
          } else {
            const created = await createCustomer({
              shopName: targetName,
              ownerName: targetName,
              phone: targetPhone,
              address: "Retail Counter Sale",
              creditLimit: 0,
            });
            custId = created.id;
            customerNameOnReceipt = created.shopName;
            setCustomers((prev) => [created, ...prev]);
          }
        } else {
          // No phone entered
          const isGenericWalkin =
            targetName.toLowerCase() === "walk-in customer" ||
            targetName.toLowerCase() === "walk-in retail customer" ||
            targetName.toLowerCase() === "walkin";

          let existing = null;
          if (isGenericWalkin) {
            existing = customers.find(
              (c) =>
                c.shopName?.toLowerCase().includes("walk-in") ||
                c.shopName?.toLowerCase().includes("counter cash")
            );
          } else {
            existing = customers.find(
              (c) => c.shopName?.toLowerCase() === targetName.toLowerCase()
            );
          }

          if (existing) {
            custId = existing.id;
            customerNameOnReceipt = existing.shopName;
          } else {
            const counterPhone = isGenericWalkin
              ? "9999999999"
              : `9${Date.now().toString().slice(-9)}`;

            try {
              const created = await createCustomer({
                shopName: targetName,
                ownerName: targetName,
                phone: counterPhone,
                address: "Retail Counter Sale",
                creditLimit: 0,
              });
              custId = created.id;
              customerNameOnReceipt = created.shopName;
              setCustomers((prev) => [created, ...prev]);
            } catch (err) {
              const searchRes = await searchCustomers({ keyword: counterPhone });
              if (Array.isArray(searchRes) && searchRes.length > 0) {
                custId = searchRes[0].id;
                customerNameOnReceipt = searchRes[0].shopName;
              } else {
                throw err;
              }
            }
          }
        }
      }

      if (!custId) {
        throw new Error("Unable to resolve customer profile for retail sale.");
      }

      const payload = {
        customerId: Number(custId),
        gstPercentage: 5,
        discountAmount: 0,
        paidAmount: grandTotal, // Immediate full payment for retail counter
        notes: `Retail Counter Sale (${paymentMode})`,
        items: items.map((it) => ({
          itemCode: it.itemCode || "RET-ITEM",
          itemName: it.itemName,
          brand: "Standard",
          color: "Standard",
          size: it.size || "Free",
          quantity: Number(it.quantity),
          unit: "PCS",
          rate: Number(it.rate),
        })),
      };

      const inv = await createInvoice(payload);
      setCompletedBill({
        billNo: inv.invoiceNo,
        date: new Date(),
        customer: customerNameOnReceipt || walkinName || "Walk-in Customer",
        items: [...items],
        subtotal,
        gstAmount,
        grandTotal,
        paymentMode,
        cashTendered: Number(cashTendered) || grandTotal,
        changeDue,
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to complete retail sale.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintThermal = () => {
    window.print();
  };

  const handleNewBill = () => {
    setCompletedBill(null);
    setItems([{ itemCode: "", itemName: "", size: "Free", quantity: 1, rate: 0 }]);
    setCashTendered("");
    setWalkinName("Walk-in Customer");
    setWalkinPhone("");
    setSelectedCustomerId("");
    setCustomerType("WALK_IN");
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
        {/* Page Header */}
        <div className="no-print">
          <PageHeader
            title="Retail Counter POS"
            subtitle="Rapid walk-in sales with automatic inventory matching and 80mm thermal receipt generation"
            breadcrumbs={[{ label: "Commerce" }, { label: "Retail POS" }]}
            badge="Counter Active"
            badgeVariant="success"
            actions={
              <Button
                variant="secondary"
                size="sm"
                icon="file-text"
                onClick={() => navigate("/invoices")}
              >
                View Invoices
              </Button>
            }
          />
        </div>

        {error && (
          <div
            className="no-print"
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

        {/* If Bill completed, show Thermal Slip and New Bill action */}
        {completedBill ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, margin: "20px 0" }}>
            <div className="no-print" style={{ display: "flex", gap: 12 }}>
              <Button
                variant="primary"
                size="md"
                icon="printer"
                onClick={handlePrintThermal}
              >
                Print 80mm Thermal Slip
              </Button>
              <Button
                variant="success"
                size="md"
                icon="plus"
                onClick={handleNewBill}
              >
                Next Walk-in Sale
              </Button>
            </div>

            {/* 80mm Thermal Slip Layout Container */}
            <div
              id="printable-thermal-slip"
              style={{
                width: 320,
                background: "#fff",
                border: "1px dashed #CBD5E1",
                padding: "24px 20px",
                fontFamily: "monospace",
                fontSize: 12,
                color: colors.textPrimary,
                boxShadow: shadows.md,
                borderRadius: radius.md,
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: "1px" }}>WB-STORE</div>
                <div style={{ fontSize: 10, color: colors.textSecondary }}>RETAIL GARMENTS COUNTER</div>
                <div style={{ fontSize: 10, color: colors.textSecondary }}>Jeypore Textile Market, Odisha</div>
                <div style={{ fontSize: 10, color: colors.textSecondary }}>Ph: +91 98765 43210</div>
                <div style={{ fontSize: 10, borderBottom: "1px dashed #000", paddingBottom: 6, marginTop: 4 }}>
                  GSTIN: 24AAACW1234F1Z8
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 6 }}>
                <span>Bill: <strong>{completedBill.billNo}</strong></span>
                <span>{completedBill.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div style={{ fontSize: 10, marginBottom: 8 }}>
                Date: {completedBill.date.toLocaleDateString("en-IN")}
              </div>
              <div style={{ fontSize: 10, marginBottom: 8 }}>
                Customer: <strong>{completedBill.customer}</strong>
              </div>

              <div style={{ borderTop: "1px dashed #000", borderBottom: "1px dashed #000", padding: "4px 0", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 11 }}>
                  <span style={{ width: "50%" }}>ITEM</span>
                  <span style={{ width: "15%", textAlign: "center" }}>QTY</span>
                  <span style={{ width: "35%", textAlign: "right" }}>AMT (₹)</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
                {completedBill.items.map((it, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ width: "50%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {it.itemName}
                    </span>
                    <span style={{ width: "15%", textAlign: "center" }}>{it.quantity}</span>
                    <span style={{ width: "35%", textAlign: "right" }}>
                      {(Number(it.quantity) * Number(it.rate)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px dashed #000", paddingTop: 6, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span>Subtotal:</span>
                  <span>₹{completedBill.subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span>GST (5%):</span>
                  <span>₹{completedBill.gstAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 900, marginTop: 4 }}>
                  <span>NET TOTAL:</span>
                  <span>₹{completedBill.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ borderTop: "1px dashed #000", paddingTop: 6, marginBottom: 12, fontSize: 11 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Paid ({completedBill.paymentMode}):</span>
                  <span>₹{completedBill.cashTendered.toFixed(2)}</span>
                </div>
                {completedBill.paymentMode === "CASH" && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Change Returned:</span>
                    <span>₹{completedBill.changeDue.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div style={{ textAlign: "center", borderTop: "1px dashed #000", paddingTop: 8, fontSize: 9, color: colors.textSecondary }}>
                <div>*** THANK YOU FOR SHOPPING ***</div>
                <div>No returns without this receipt</div>
              </div>
            </div>
          </div>
        ) : (
          /* Billing Workspace */
          <div className="no-print layout-split-responsive" style={{ gap: 20 }}>
            {/* Left Items Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Customer Selector Card */}
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>Customer Profile</h3>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: colors.textSecondary }}>Select walk-in customer or existing wholesale client</p>
                  </div>
                  <div style={{ display: "flex", background: colors.background, borderRadius: radius.md, padding: 3, border: `1px solid ${colors.border}` }}>
                    <button
                      type="button"
                      onClick={() => setCustomerType("WALK_IN")}
                      style={{
                        padding: "5px 12px",
                        fontSize: 12,
                        borderRadius: radius.sm,
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        background: customerType === "WALK_IN" ? colors.primary : "transparent",
                        color: customerType === "WALK_IN" ? "#fff" : colors.textSecondary,
                        transition: "all 0.15s ease",
                      }}
                    >
                      Walk-in / Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerType("REGISTERED")}
                      style={{
                        padding: "5px 12px",
                        fontSize: 12,
                        borderRadius: radius.sm,
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        background: customerType === "REGISTERED" ? colors.primary : "transparent",
                        color: customerType === "REGISTERED" ? "#fff" : colors.textSecondary,
                        transition: "all 0.15s ease",
                      }}
                    >
                      Wholesale Client
                    </button>
                  </div>
                </div>

                {customerType === "WALK_IN" ? (
                  <div className="form-grid-responsive" style={{ gap: 14 }}>
                    <Input
                      label="Customer / Buyer Name"
                      required
                      placeholder="e.g. Walk-in Customer or Ramesh Retail"
                      value={walkinName}
                      onChange={(e) => setWalkinName(e.target.value)}
                    />
                    <Input
                      label="Phone Number (Optional)"
                      placeholder="10-digit mobile number"
                      value={walkinPhone}
                      onChange={(e) => setWalkinPhone(e.target.value)}
                    />
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <Select
                      label="Select Registered Wholesale Client"
                      required
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      options={[
                        { label: "-- Choose a Wholesale Customer --", value: "" },
                        ...wholesaleCustomers.map((c) => ({
                          label: `${c.shopName} ${c.ownerName ? `(${c.ownerName})` : ""} • Ph: ${c.phone}${Number(c.currentDue || 0) > 0 ? ` (Due: ₹${Number(c.currentDue).toLocaleString("en-IN")})` : ""}`,
                          value: c.id,
                        })),
                      ]}
                    />

                    {selectedWholesaleCustomer && (
                      <div
                        style={{
                          padding: "10px 14px",
                          background: "#F8FAFC",
                          borderRadius: radius.md,
                          border: `1px solid ${colors.border}`,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 8,
                          fontSize: 12,
                        }}
                      >
                        <div>
                          <strong style={{ color: colors.textPrimary }}>{selectedWholesaleCustomer.shopName}</strong>
                          <span style={{ color: colors.textSecondary, marginLeft: 8 }}>
                            GSTIN: {selectedWholesaleCustomer.gstin || "Unregistered"} • Ph: {selectedWholesaleCustomer.phone}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: colors.textSecondary }}>Outstanding Due: </span>
                          <strong style={{ color: Number(selectedWholesaleCustomer.currentDue || 0) > 0 ? colors.danger : colors.success, fontVariantNumeric: "tabular-nums" }}>
                            ₹{Number(selectedWholesaleCustomer.currentDue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Items Table Card */}
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>Garments &amp; Items</h3>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: colors.textSecondary }}>Type to search catalogue or enter custom counter items</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>
                    {items.length} {items.length === 1 ? "Item" : "Items"}
                  </span>
                </div>

                <datalist id="retail-products">
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.sku ? `[${p.sku}] ` : ""}₹{p.defaultPrice}
                    </option>
                  ))}
                </datalist>

                <div className="table-responsive-container" style={{ border: `1px solid ${colors.border}`, borderRadius: radius.md }}>
                  <table style={{ width: "100%", minWidth: 460, borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: colors.background, borderBottom: `1px solid ${colors.border}`, textAlign: "left" }}>
                        <th style={{ padding: "9px 12px", width: "42%", color: colors.textSecondary, fontWeight: 600 }}>ITEM / GARMENT</th>
                        <th style={{ padding: "9px 12px", width: "16%", color: colors.textSecondary, fontWeight: 600 }}>SIZE</th>
                        <th style={{ padding: "9px 12px", width: "14%", textAlign: "right", color: colors.textSecondary, fontWeight: 600 }}>QTY</th>
                        <th style={{ padding: "9px 12px", width: "18%", textAlign: "right", color: colors.textSecondary, fontWeight: 600 }}>RATE (₹)</th>
                        <th style={{ padding: "9px 8px", width: "10%", textAlign: "center" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it, idx) => (
                        <tr key={idx} style={{ borderBottom: `1px solid ${colors.border}` }}>
                          <td style={{ padding: "8px 10px" }}>
                            <input
                              type="text"
                              list="retail-products"
                              placeholder="Select garment..."
                              value={it.itemName}
                              onChange={(e) => handleItemChange(idx, "itemName", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "6px 10px",
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.sm,
                                fontSize: 12,
                                boxSizing: "border-box",
                                outline: "none",
                              }}
                            />
                          </td>
                          <td style={{ padding: "8px 8px" }}>
                            <input
                              type="text"
                              placeholder="M, L, XL"
                              value={it.size}
                              onChange={(e) => handleItemChange(idx, "size", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "6px 8px",
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.sm,
                                fontSize: 12,
                                boxSizing: "border-box",
                                outline: "none",
                              }}
                            />
                          </td>
                          <td style={{ padding: "8px 8px" }}>
                            <input
                              type="number"
                              min="1"
                              value={it.quantity}
                              onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "6px 8px",
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.sm,
                                fontSize: 12,
                                textAlign: "right",
                                boxSizing: "border-box",
                                outline: "none",
                                fontVariantNumeric: "tabular-nums",
                              }}
                            />
                          </td>
                          <td style={{ padding: "8px 8px" }}>
                            <input
                              type="number"
                              min="0"
                              value={it.rate}
                              onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                              style={{
                                width: "100%",
                                padding: "6px 8px",
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.sm,
                                fontSize: 12,
                                textAlign: "right",
                                boxSizing: "border-box",
                                outline: "none",
                                fontWeight: 700,
                                fontVariantNumeric: "tabular-nums",
                              }}
                            />
                          </td>
                          <td style={{ padding: "8px 6px", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              disabled={items.length <= 1}
                              style={{
                                background: "none",
                                border: "none",
                                color: items.length <= 1 ? "#CBD5E1" : colors.danger,
                                cursor: items.length <= 1 ? "not-allowed" : "pointer",
                                padding: 4,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Icon name="x" size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: 14 }}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    icon="plus"
                    onClick={addItem}
                  >
                    Add Line Item
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Summary & Checkout Column */}
            <div>
              <Card>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 14 }}>
                  Payment &amp; Checkout
                </div>

                {/* Subtotal & Calculations */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    fontSize: 13,
                    borderBottom: `1px solid ${colors.border}`,
                    paddingBottom: 14,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: colors.textSecondary }}>Subtotal:</span>
                    <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                      ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: colors.textSecondary }}>GST Tax (5%):</span>
                    <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                      ₹{gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 18,
                      fontWeight: 800,
                      color: colors.primary,
                      borderTop: `1px dashed ${colors.border}`,
                      paddingTop: 8,
                    }}
                  >
                    <span>Net Total:</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>
                      ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Payment Mode Pills */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 8 }}>
                    PAYMENT METHOD
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setPaymentMode("CASH")}
                      style={{
                        padding: "8px 0",
                        borderRadius: radius.md,
                        border: `1px solid ${paymentMode === "CASH" ? colors.primary : colors.border}`,
                        background: paymentMode === "CASH" ? "#EEF2FF" : colors.surface,
                        color: paymentMode === "CASH" ? colors.primary : colors.textPrimary,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Icon name="credit-card" size={14} />
                      <span>Cash</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode("UPI")}
                      style={{
                        padding: "8px 0",
                        borderRadius: radius.md,
                        border: `1px solid ${paymentMode === "UPI" ? colors.primary : colors.border}`,
                        background: paymentMode === "UPI" ? "#EEF2FF" : colors.surface,
                        color: paymentMode === "UPI" ? colors.primary : colors.textPrimary,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Icon name="zap" size={14} />
                      <span>UPI / QR</span>
                    </button>
                  </div>
                </div>

                {/* Cash Tendered If Cash */}
                {paymentMode === "CASH" && (
                  <div style={{ marginBottom: 16 }}>
                    <Input
                      label="Cash Tendered (₹)"
                      type="number"
                      min="0"
                      placeholder="Amount given by customer"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                    />

                    {Number(cashTendered) > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: 8,
                          padding: "8px 10px",
                          borderRadius: radius.sm,
                          background: changeDue >= 0 ? "#F0FDF4" : "#FEE2E2",
                          border: `1px solid ${changeDue >= 0 ? "#BBF7D0" : "#FECDD3"}`,
                          fontSize: 12,
                          fontWeight: 700,
                          color: changeDue >= 0 ? colors.success : colors.danger,
                        }}
                      >
                        <span>Change to Return:</span>
                        <span style={{ fontVariantNumeric: "tabular-nums" }}>₹{changeDue.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  disabled={grandTotal <= 0}
                  onClick={handleCompleteSale}
                  style={{ width: "100%", marginTop: 6 }}
                >
                  {loading ? "Processing Sale..." : `Complete & Print (₹${grandTotal.toFixed(2)})`}
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* 80mm Print Stylesheet */}
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
          #printable-thermal-slip {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </MainLayout>
  );
}
