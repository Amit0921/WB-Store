import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getProducts, searchProducts, updateProductStatus } from "../../api/productApi";
import { THEME } from "../../utils/theme";
import Icon from "../../components/ui/Icon";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import DataTable from "../../components/ui/DataTable";
import PageHeader from "../../components/ui/PageHeader";

const categories = ["All", "Sarees", "Kurtis", "Lehengas", "Suits", "Shirts", "Dupatta", "Fabrics"];

export default function ProductList() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const rawRoles = Array.isArray(currentUser?.roles)
    ? currentUser.roles
    : currentUser?.roles
    ? Array.from(currentUser.roles)
    : [];
  const currentRoles = rawRoles.map((r) => (typeof r === "string" ? r.replace(/^ROLE_/, "") : r));
  const canManageProducts = currentRoles.includes("ADMIN") || currentRoles.includes("MANAGER");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      let res;
      if (searchQuery.trim()) {
        res = await searchProducts(searchQuery.trim(), page, 10);
      } else {
        res = await getProducts(page, 10, categoryFilter || null);
      }
      const pageData = res.data?.data;
      if (pageData && pageData.content) {
        setProducts(pageData.content);
        setTotalPages(pageData.totalPages);
        setTotalElements(pageData.totalElements);
      } else {
        setProducts(pageData || []);
      }
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load products list.");
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter, searchQuery]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleToggleStatus = async (product) => {
    const nextStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateProductStatus(product.id, nextStatus);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update product status.");
    }
  };

  const columns = [
    {
      header: "Product / Garment",
      accessor: "name",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: THEME.colors.textPrimary, fontSize: "13px" }}>
            {row.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "11px", color: THEME.colors.textMuted, marginTop: 2 }}>
            <span style={{ fontFamily: "monospace", color: THEME.colors.primary, fontWeight: 600 }}>
              [{row.sku || "NO-SKU"}]
            </span>
            {row.brand && <span>• Brand: {row.brand}</span>}
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: "category",
      render: (row) => (
        <Badge variant="neutral" size="sm">
          {row.category || "General"}
        </Badge>
      ),
    },
    {
      header: "Base Price",
      accessor: "defaultPrice",
      align: "right",
      render: (row) => (
        <span style={{ fontWeight: 700, color: THEME.colors.textPrimary, fontVariantNumeric: "tabular-nums" }}>
          ₹{Number(row.defaultPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "GST Rate",
      accessor: "gstRate",
      align: "center",
      render: (row) => (
        <span style={{ fontSize: "12px", color: THEME.colors.textSecondary, fontWeight: 600 }}>
          {row.gstRate || 5}%
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      align: "center",
      render: (row) => <Badge size="sm">{row.status}</Badge>,
    },
    {
      header: "Actions",
      align: "right",
      render: (row) => (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
          {canManageProducts ? (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate(`/products/${row.id}/edit`)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant={row.status === "ACTIVE" ? "danger" : "secondary"}
                onClick={() => handleToggleStatus(row)}
              >
                {row.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </Button>
            </>
          ) : (
            <Badge size="sm" variant="neutral">
              View Only
            </Badge>
          )}
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Product Inventory Catalogue"
        subtitle="Manage garments catalogue, wholesale unit prices, and GST rates"
        badge={<Badge variant="primary">{totalElements} Garments</Badge>}
        actions={
          canManageProducts && (
            <Button
              variant="primary"
              onClick={() => navigate("/products/new")}
              icon={<Icon name="plus" size={15} />}
            >
              Add New Product
            </Button>
          )
        }
      />

      {error && (
        <div style={{ background: THEME.colors.dangerBg, color: THEME.colors.danger, borderRadius: 8, padding: "10px 14px", fontSize: "13px", marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div className="filter-search-container">
          <Input
            placeholder="Search by garment name, SKU, or brand..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            icon={<Icon name="search" size={15} />}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {categories.map((cat) => {
            const active = (cat === "All" && !categoryFilter) || categoryFilter === cat;
            return (
              <Button
                key={cat}
                size="sm"
                variant={active ? "primary" : "secondary"}
                onClick={() => {
                  setCategoryFilter(cat === "All" ? "" : cat);
                  setPage(0);
                }}
              >
                {cat}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={(p) => setPage(p)}
        emptyTitle="No garments in catalogue"
        emptyDescription={
          searchQuery
            ? `No garments found matching "${searchQuery}".`
            : "Add your first garment to make it available for wholesale & retail billing."
        }
        emptyIcon="package"
        emptyAction={
          canManageProducts
            ? {
                label: "Add New Product",
                onClick: () => navigate("/products/new"),
              }
            : null
        }
      />
    </MainLayout>
  );
}
