import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getCustomerById, updateCustomer } from "../../api/customerApi";
import { THEME } from "../../utils/theme";
import Icon from "../../components/ui/Icon";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";

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
      .catch((err) => {
        console.error("Error loading customer:", err);
        setError("Failed to load customer profile details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.shopName || !form.ownerName || !form.phone) {
      setError("Shop name, owner name, and primary phone are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateCustomer(id, {
        shopName: form.shopName,
        ownerName: form.ownerName,
        phone: form.phone,
        alternatePhone: form.alternatePhone || null,
        gstin: form.gstin || null,
        address: form.address || null,
        creditLimit: Number(form.creditLimit || 0),
      });
      navigate("/customers");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update customer profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout maxWidth={860}>
        <div style={{ padding: 48, textAlign: "center", color: THEME.colors.textMuted }}>
          Loading customer account...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout maxWidth={860}>
      <PageHeader
        title={`Edit ${form.shopName || "Customer"}`}
        subtitle="Update client contact information, tax identification, and credit line"
        breadcrumbs={[
          { label: "Directory", path: "/customers" },
          { label: "Customers", path: "/customers" },
          { label: form.shopName || "Edit" },
        ]}
        actions={
          <Button variant="secondary" onClick={() => navigate("/customers")}>
            Back to Directory
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
              required
              value={form.shopName}
              onChange={handleChange}
              icon={<Icon name="store" size={15} />}
            />

            <Input
              label="Owner / Contact Person"
              name="ownerName"
              required
              value={form.ownerName}
              onChange={handleChange}
              icon={<Icon name="user" size={15} />}
            />

            <Input
              label="Primary Phone"
              name="phone"
              required
              value={form.phone}
              onChange={handleChange}
              icon={<Icon name="phone" size={15} />}
            />

            <Input
              label="Alternate Phone"
              name="alternatePhone"
              value={form.alternatePhone}
              onChange={handleChange}
              icon={<Icon name="phone" size={15} />}
            />

            <Input
              label="GSTIN Identification"
              name="gstin"
              value={form.gstin}
              onChange={handleChange}
            />

            <Input
              label="Credit Limit (₹)"
              type="number"
              name="creditLimit"
              value={form.creditLimit}
              onChange={handleChange}
              icon={<Icon name="inr" size={15} />}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <Input
              label="Billing Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              icon={<Icon name="map-pin" size={15} />}
            />
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
              Discard Changes
            </Button>
            <Button type="submit" loading={saving} icon={<Icon name="check" size={15} />}>
              Save Updates
            </Button>
          </div>
        </form>
      </Card>

      <style>{`
        @media (max-width: 640px) {
          .form-two-col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </MainLayout>
  );
}
