import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getCustomerById, updateCustomer } from "../../api/customerApi";

const labelStyle = { display: "block", fontSize: 12, color: "#64748b", marginBottom: 5, fontWeight: 500 };
const inputStyle = { width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", color: "#1e293b" };

const fields = [
  { label: "Shop Name *", key: "shopName" },
  { label: "Owner Name *", key: "ownerName" },
  { label: "Phone *", key: "phone" },
  { label: "GSTIN", key: "gstin" },
  { label: "Billing Address", key: "address", wide: true },
  { label: "Credit Limit (₹)", key: "creditLimit", type: "number" },
];

export default function CustomerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCustomerById(id)
      .then((r) => setForm(r.data || r))
      .catch((err) => setError("Failed to load customer details."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!form.shopName || !form.ownerName || !form.phone) {
      setError("Shop name, owner name, and phone are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateCustomer(id, form);
      navigate("/customers");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update customer.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ color: "#64748b", padding: 32 }}>Loading customer…</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 680, paddingBottom: 40 }}>
        <div style={{ marginBottom: 20 }}>
          <button onClick={() => navigate("/customers")} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13, padding: 0 }}>
            ← Back to customers
          </button>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 28 }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Edit Wholesale Customer</h2>

          {error && <div style={{ background: "#fdecea", color: "#c0392b", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>{error}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {fields.map((f) => (
              <div key={f.key} style={f.wide ? { gridColumn: "1 / -1" } : {}}>
                <label style={labelStyle}>{f.label}</label>
                <input
                  type={f.type || "text"}
                  value={form[f.key] != null ? form[f.key] : ""}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  style={inputStyle}
                />
              </div>
            ))}
            <div>
              <label style={labelStyle}>Status</label>
              <select value={form.status || "ACTIVE"} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
            <button onClick={() => navigate("/customers")} style={{ padding: "9px 20px", background: "none", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Cancel</button>
            <button onClick={handleSubmit} disabled={saving} style={{ padding: "9px 20px", background: "#4361ee", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}