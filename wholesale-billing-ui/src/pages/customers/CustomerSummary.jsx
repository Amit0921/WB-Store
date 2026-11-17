import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getCustomerSummary, getCustomerStatement } from "../../api/customerApi";

function Info({ label, value }) {
  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>{value || "—"}</span>
    </div>
  );
}

function Stat({ label, value, color = "#1e40af" }) {
  return (
    <div style={{ background: "#f8fafc", borderRadius: 10, padding: "16px 20px", border: "1px solid #e2e8f0" }}>
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, marginTop: 6 }}>{value ?? "—"}</div>
    </div>
  );
}

export default function CustomerSummary() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [statement, setStatement] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("summary");

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
        <div style={{ color: "#64748b", padding: 32 }}>Loading customer profile...</div>
      </MainLayout>
    );
  }

  if (!summary) {
    return (
      <MainLayout>
        <div style={{ padding: 32, color: "#c0392b" }}>Customer not found.</div>
      </MainLayout>
    );
  }

  const shopName = summary.shopName || "Customer Details";
  const ownerName = summary.ownerName || "";
  const phone = summary.phone || "—";
  const gstin = summary.gstin || "—";
  const address = summary.address || "—";
  const status = summary.status || "ACTIVE";
  const creditLimit = summary.creditLimit ? `₹${Number(summary.creditLimit).toLocaleString("en-IN")}` : "No Limit";
  const currentDue = summary.currentDue != null ? Number(summary.currentDue) : 0;
  const totalInvoiced = summary.totalInvoiceAmount != null ? Number(summary.totalInvoiceAmount) : 0;
  const totalPaid = summary.totalPaidAmount != null ? Number(summary.totalPaidAmount) : 0;

  return (
    <MainLayout>
      <div style={{ maxWidth: 900, paddingBottom: 40 }}>
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => navigate("/customers")} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13, padding: 0 }}>
            ← Back to Customers
          </button>
        </div>

        {/* Customer Header Card */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", marginBottom: 20, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>{shopName}</h2>
                <span style={{
                  padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                  background: status === "ACTIVE" ? "#dcfce7" : "#f1f5f9",
                  color: status === "ACTIVE" ? "#166534" : "#64748b",
                }}>{status}</span>
              </div>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
                {ownerName && `${ownerName} • `}Phone: {phone}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => navigate(`/customers/${customerId}/edit`)} style={btnStyle}>Edit</button>
              <button onClick={() => navigate(`/payments`)} style={{ ...btnStyle, background: "#10b981", color: "#fff", borderColor: "#10b981" }}>Record Payment</button>
              <button onClick={() => navigate(`/invoices`)} style={{ ...btnStyle, background: "#4361ee", color: "#fff", borderColor: "#4361ee" }}>New Invoice</button>
            </div>
          </div>
        </div>

        {/* Financial Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
          <Stat label="Total Invoiced" value={`₹${totalInvoiced.toLocaleString("en-IN")}`} color="#1e40af" />
          <Stat label="Total Paid" value={`₹${totalPaid.toLocaleString("en-IN")}`} color="#059669" />
          <Stat label="Current Outstanding Due" value={`₹${currentDue.toLocaleString("en-IN")}`} color={currentDue > 0 ? "#dc2626" : "#059669"} />
        </div>

        {/* Tabs: Details vs Ledger Statement */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0" }}>
            {["summary", "statement"].map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "12px 20px", background: "none", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: tab === t ? 600 : 400,
                color: tab === t ? "#4361ee" : "#64748b",
                borderBottom: tab === t ? "2px solid #4361ee" : "2px solid transparent",
              }}>{t === "summary" ? "Account Details" : "Ledger Statement"}</button>
            ))}
          </div>

          <div style={{ padding: 20 }}>
            {tab === "summary" && (
              <>
                <Info label="Shop Name" value={shopName} />
                <Info label="Owner Name" value={ownerName} />
                <Info label="Phone Number" value={phone} />
                <Info label="GSTIN" value={gstin} />
                <Info label="Billing Address" value={address} />
                <Info label="Credit Limit" value={creditLimit} />
                <Info label="Total Invoices Count" value={summary.totalInvoices || "0"} />
              </>
            )}

            {tab === "statement" && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Date", "Type", "Ref #", "Debit (Due +)", "Credit (Paid -)", "Running Due"].map((h) => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0", fontSize: 11 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {statement.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No ledger transactions recorded yet.</td></tr>
                  ) : statement.map((s, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px 12px" }}>{s.transactionDate ? new Date(s.transactionDate).toLocaleDateString("en-IN") : "—"}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{
                          padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                          background: s.transactionType === "INVOICE" ? "#eff6ff" : "#f0fdf4",
                          color: s.transactionType === "INVOICE" ? "#2563eb" : "#16a34a",
                        }}>
                          {s.transactionType}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", color: "#4361ee", fontWeight: 500 }}>{s.referenceNo || "—"}</td>
                      <td style={{ padding: "10px 12px", color: s.debit ? "#dc2626" : "#64748b", fontWeight: s.debit ? 600 : 400 }}>
                        {s.debit ? `₹${Number(s.debit).toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td style={{ padding: "10px 12px", color: s.credit ? "#16a34a" : "#64748b", fontWeight: s.credit ? 600 : 400 }}>
                        {s.credit ? `₹${Number(s.credit).toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td style={{ padding: "10px 12px", fontWeight: 700, color: s.runningBalance > 0 ? "#b45309" : "#059669" }}>
                        ₹{Number(s.runningBalance || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

const btnStyle = { padding: "8px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 };