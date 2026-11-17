import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { createCustomer } from "../../api/customerApi";

export default function CustomerCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    gstin: "",
    creditLimit: "",
    status: "ACTIVE",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!form.shopName || !form.ownerName || !form.phone) {
      setError("Shop Name, Owner Name and Phone are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createCustomer({
        ...form,
        creditLimit: Number(form.creditLimit || 0),
      });

      navigate("/customers");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create customer"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div
        style={{
          padding: "24px",
          maxWidth: "900px",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "24px",
                color: "#0f172a",
              }}
            >
              Add Customer
            </h2>

            <p
              style={{
                margin: "4px 0 0",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Create a new customer account
            </p>
          </div>

          <button
            onClick={() => navigate("/customers")}
            style={secondaryBtn}
          >
            Back
          </button>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid #e2e8f0",
          }}
        >
          {error && (
            <div
              style={{
                marginBottom: "20px",
                background: "#fef2f2",
                color: "#dc2626",
                padding: "12px",
                borderRadius: "8px",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* Shop Name */}
            <div>
              <label style={labelStyle}>Shop Name *</label>
              <input
                name="shopName"
                value={form.shopName}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Panda Garments"
              />
            </div>

            {/* Owner Name */}
            <div>
              <label style={labelStyle}>Owner Name *</label>
              <input
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Panda"
              />
            </div>

            {/* Phone */}
            <div>
              <label style={labelStyle}>Phone *</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                style={inputStyle}
                placeholder="8144511513"
              />
            </div>

            {/* GSTIN */}
            <div>
              <label style={labelStyle}>GSTIN</label>
              <input
                name="gstin"
                value={form.gstin}
                onChange={handleChange}
                style={inputStyle}
                placeholder="GST12345"
              />
            </div>

            {/* Credit Limit */}
            <div>
              <label style={labelStyle}>Credit Limit</label>
              <input
                type="number"
                name="creditLimit"
                value={form.creditLimit}
                onChange={handleChange}
                style={inputStyle}
                placeholder="500000"
              />
            </div>

            {/* Status */}
            <div>
              <label style={labelStyle}>Status</label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div
            style={{
              marginTop: "30px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button
              onClick={() => navigate("/customers")}
              style={secondaryBtn}
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={primaryBtn}
            >
              {loading
                ? "Creating..."
                : "Create Customer"}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "13px",
  fontWeight: "600",
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const primaryBtn = {
  background: "#1e40af",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "10px 18px",
  cursor: "pointer",
  fontWeight: "600",
};

const secondaryBtn = {
  background: "#fff",
  color: "#334155",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  padding: "10px 18px",
  cursor: "pointer",
};