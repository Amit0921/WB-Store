import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { createProduct, getProductById, updateProduct } from "../../api/productApi";
import { THEME } from "../../utils/theme";
import Icon from "../../components/ui/Icon";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";

export default function ProductCreate() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "Shirts",
    brand: "",
    unit: "PIECE",
    hsnCode: "",
    defaultPrice: "",
    gstRate: "5",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          setFetching(true);
          const res = await getProductById(id);
          const p = res.data?.data;
          if (p) {
            setForm({
              name: p.name || "",
              sku: p.sku || "",
              category: p.category || "Shirts",
              brand: p.brand || "",
              unit: p.unit || "PIECE",
              hsnCode: p.hsnCode || "",
              defaultPrice: p.defaultPrice ? String(p.defaultPrice) : "",
              gstRate: p.gstRate ? String(p.gstRate) : "5",
            });
          }
        } catch {
          setError("Failed to load product details.");
        } finally {
          setFetching(false);
        }
      })();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Product Name is required.");
      return;
    }
    if (!form.defaultPrice || isNaN(form.defaultPrice) || Number(form.defaultPrice) < 0) {
      setError("Please provide a valid default price.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || null,
        category: form.category || null,
        brand: form.brand.trim() || null,
        unit: form.unit || "PIECE",
        hsnCode: form.hsnCode.trim() || null,
        defaultPrice: Number(form.defaultPrice),
        gstRate: Number(form.gstRate || 5),
      };

      if (isEdit) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} garment.`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <MainLayout maxWidth={860}>
        <div style={{ padding: 48, textAlign: "center", color: THEME.colors.textMuted }}>
          Loading garment details...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout maxWidth={860}>
      <PageHeader
        title={isEdit ? `Edit ${form.name || "Product"}` : "Add New Garment Item"}
        subtitle="Configure item SKU, wholesale pricing, HSN codes, and GST rates"
        breadcrumbs={[
          { label: "Directory", path: "/products" },
          { label: "Products", path: "/products" },
          { label: isEdit ? "Edit Garment" : "New Item" },
        ]}
        actions={
          <Button variant="secondary" onClick={() => navigate("/products")}>
            Back to Products
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
              label="Garment Name"
              name="name"
              placeholder="e.g. Pure Cotton Printed Kurti"
              required
              value={form.name}
              onChange={handleChange}
              icon={<Icon name="package" size={15} />}
            />

            <Input
              label="SKU Code"
              name="sku"
              placeholder="e.g. KRT-CTN-01"
              value={form.sku}
              onChange={handleChange}
              icon={<Icon name="tag" size={15} />}
              helperText="Unique stock-keeping unit"
            />

            <Select
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="Sarees">Sarees</option>
              <option value="Kurtis">Kurtis</option>
              <option value="Lehengas">Lehengas</option>
              <option value="Suits">Suits</option>
              <option value="Shirts">Shirts</option>
              <option value="Dupatta">Dupatta</option>
              <option value="Fabrics">Fabrics</option>
              <option value="Kids Wear">Kids Wear</option>
            </Select>

            <Input
              label="Brand / Label"
              name="brand"
              placeholder="e.g. Standard, Raymond, Self"
              value={form.brand}
              onChange={handleChange}
            />

            <Input
              label="Base Wholesale Price (₹)"
              type="number"
              name="defaultPrice"
              placeholder="e.g. 650.00"
              required
              value={form.defaultPrice}
              onChange={handleChange}
              icon={<Icon name="inr" size={15} />}
            />

            <Select
              label="GST Tax Slab"
              name="gstRate"
              value={form.gstRate}
              onChange={handleChange}
            >
              <option value="0">0% (Nil / Exempted)</option>
              <option value="5">5% (Garments &lt; ₹1,000 / Standard)</option>
              <option value="12">12% (Garments &gt; ₹1,000)</option>
              <option value="18">18% (Special / Synthetic)</option>
            </Select>

            <Input
              label="HSN Code"
              name="hsnCode"
              placeholder="e.g. 6204, 5208"
              value={form.hsnCode}
              onChange={handleChange}
            />

            <Select
              label="Default Billing Unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
            >
              <option value="PIECE">PIECE (Pcs)</option>
              <option value="METER">METER (Mtrs)</option>
              <option value="SET">SET (Sets)</option>
              <option value="BOX">BOX (Boxes)</option>
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
            <Button variant="secondary" onClick={() => navigate("/products")}>
              Discard
            </Button>
            <Button type="submit" loading={loading} icon={<Icon name="check" size={15} />}>
              {isEdit ? "Update Garment Item" : "Save & Add to Catalogue"}
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
