import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { createCustomer } from "../../api/customerApi";
import { THEME } from "../../utils/theme";
import Icon from "../../components/ui/Icon";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";

export default function CustomerCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    alternatePhone: "",
    gstin: "",
    address: "",
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.shopName.trim() || !form.ownerName.trim() || !form.phone.trim()) {
      setError("Shop Name, Owner Name and Primary Phone are required.");
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
      setError(err.response?.data?.message || "Failed to create customer account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout maxWidth={860}>
      <PageHeader
        title="Create Customer Profile"
        subtitle="Register a new wholesale buyer with credit limits and GST credentials"
        breadcrumbs={[
          { label: "Directory", path: "/customers" },
          { label: "Customers", path: "/customers" },
          { label: "New Profile" },
        ]}
        actions={
          <Button variant="secondary" onClick={() => navigate("/customers")}>
            Cancel
          </Button>
        }
      />

      <Card>
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

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 16,
            }}
            className="form-two-col"
          >
            <Input
              label="Shop / Business Name"
              name="shopName"
              placeholder="e.g. Arihant Textiles"
              required
              value={form.shopName}
              onChange={handleChange}
              icon={<Icon name="store" size={15} />}
            />

            <Input
              label="Owner / Contact Person"
              name="ownerName"
              placeholder="e.g. Rajesh Kumar"
              required
              value={form.ownerName}
              onChange={handleChange}
              icon={<Icon name="user" size={15} />}
            />

            <Input
              label="Primary Mobile Phone"
              name="phone"
              placeholder="e.g. 9820011223"
              required
              value={form.phone}
              onChange={handleChange}
              icon={<Icon name="phone" size={15} />}
            />

            <Input
              label="Alternate Phone"
              name="alternatePhone"
              placeholder="e.g. 0261-245678"
              value={form.alternatePhone}
              onChange={handleChange}
              icon={<Icon name="phone" size={15} />}
            />

            <Input
              label="GSTIN Identification"
              name="gstin"
              placeholder="e.g. 24AAACW1234F1Z8"
              value={form.gstin}
              onChange={handleChange}
            />

            <Input
              label="Credit Limit (₹)"
              type="number"
              name="creditLimit"
              placeholder="e.g. 100000"
              value={form.creditLimit}
              onChange={handleChange}
              icon={<Icon name="inr" size={15} />}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <Input
              label="Billing Address"
              name="address"
              placeholder="e.g. Shop #42, Jeypore Textile Market, Ring Road, Jeypore"
              value={form.address}
              onChange={handleChange}
              icon={<Icon name="map-pin" size={15} />}
            />
          </div>

          <div style={{ width: "50%", marginBottom: 24 }} className="form-full-width">
            <Select
              label="Account Status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">ACTIVE (Can purchase on credit)</option>
              <option value="INACTIVE">INACTIVE (Temporarily suspended)</option>
            </Select>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              paddingTop: 16,
              borderTop: `1px solid ${THEME.colors.borderSubtle}`,
            }}
          >
            <Button variant="secondary" onClick={() => navigate("/customers")}>
              Discard
            </Button>
            <Button type="submit" loading={loading} icon={<Icon name="check" size={15} />}>
              Save &amp; Create Profile
            </Button>
          </div>
        </form>
      </Card>

      <style>{`
        @media (max-width: 640px) {
          .form-two-col {
            grid-template-columns: 1fr !important;
          }
          .form-full-width {
            width: 100% !important;
          }
        }
      `}</style>
    </MainLayout>
  );
}
