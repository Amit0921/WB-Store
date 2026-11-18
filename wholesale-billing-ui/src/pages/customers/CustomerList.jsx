import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getAllCustomers, updateCustomerStatus } from "../../api/customerApi";
import { THEME } from "../../utils/theme";
import Icon from "../../components/ui/Icon";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import DataTable from "../../components/ui/DataTable";
import PageHeader from "../../components/ui/PageHeader";

export default function CustomerList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const rawRoles = Array.isArray(currentUser?.roles)
    ? currentUser.roles
    : currentUser?.roles
    ? Array.from(currentUser.roles)
    : [];
  const currentRoles = rawRoles.map((r) => (typeof r === "string" ? r.replace(/^ROLE_/, "") : r));
  const canManageCustomers = currentRoles.includes("ADMIN") || currentRoles.includes("MANAGER");

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomers();
      setCustomers(data || []);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleToggleStatus = async (customer) => {
    try {
      const nextStatus = customer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await updateCustomerStatus(customer.id, nextStatus);
      loadCustomers();
    } catch (error) {
      console.error(error);
      alert("Failed to update customer status");
    }
  };

  const isWholesaleAccount = (c) => {
    if (!c) return false;
    const name = (c.shopName || "").toLowerCase();
    const owner = (c.ownerName || "").toLowerCase();
    const addr = (c.address || "").toLowerCase();
    if (name.includes("walk-in") || name.includes("walkin") || name.includes("counter cash")) return false;
    if (addr.includes("retail counter sale") || addr.includes("counter sale")) return false;
    if (name.endsWith(" retail") || owner.endsWith(" retail")) return false;
    return true;
  };

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        c.shopName?.toLowerCase().includes(q) ||
        c.ownerName?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.gstin?.toLowerCase().includes(q);

      let matchesFilter = true;
      if (statusFilter === "WHOLESALE") {
        matchesFilter = isWholesaleAccount(c) && c.status === "ACTIVE";
      } else if (statusFilter === "RETAIL") {
        matchesFilter = !isWholesaleAccount(c) && c.status === "ACTIVE";
      } else if (statusFilter === "ACTIVE") {
        matchesFilter = c.status === "ACTIVE";
      } else if (statusFilter === "INACTIVE") {
        matchesFilter = c.status === "INACTIVE";
      }

      return matchesQuery && matchesFilter;
    });
  }, [customers, searchQuery, statusFilter]);

  const columns = [
    {
      header: "Shop / Business",
      accessor: "shopName",
      render: (row) => {
        const isWholesale = isWholesaleAccount(row);
        return (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => navigate(`/customers/${row.id}/summary`)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: THEME.colors.primary,
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {row.shopName}
              </button>
              <Badge size="sm" variant={isWholesale ? "info" : "neutral"}>
                {isWholesale ? "Wholesale" : "Retail Counter"}
              </Badge>
            </div>
            <div style={{ fontSize: "11px", color: THEME.colors.textMuted, marginTop: 2 }}>
              Owner: {row.ownerName || "—"}
            </div>
          </div>
        );
      },
    },
    {
      header: "Contact Phone",
      accessor: "phone",
      render: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: THEME.colors.textPrimary }}>
          <Icon name="phone" size={13} color={THEME.colors.textMuted} />
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{row.phone || "—"}</span>
        </div>
      ),
    },
    {
      header: "GSTIN",
      accessor: "gstin",
      render: (row) => (
        <span style={{ fontFamily: "monospace", fontSize: "12px", color: THEME.colors.textSecondary }}>
          {row.gstin || "Unregistered"}
        </span>
      ),
    },
    {
      header: "Outstanding Due",
      accessor: "currentDue",
      align: "right",
      render: (row) => {
        const due = Number(row.currentDue || 0);
        return (
          <span
            style={{
              fontWeight: 700,
              color: due > 0 ? THEME.colors.danger : THEME.colors.success,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            ₹{due.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      header: "Credit Limit",
      accessor: "creditLimit",
      align: "right",
      render: (row) => (
        <span style={{ color: THEME.colors.textSecondary, fontVariantNumeric: "tabular-nums" }}>
          ₹{Number(row.creditLimit || 0).toLocaleString("en-IN")}
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
      width: 260,
      render: (row) => (
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/customers/${row.id}/summary`)}
            title="View customer ledger statement"
            icon={<Icon name="book-open" size={13} />}
          >
            Ledger
          </Button>

          {canManageCustomers && (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate(`/customers/${row.id}/edit`)}
                title="Edit customer details"
                icon={<Icon name="edit" size={13} />}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant={row.status === "ACTIVE" ? "danger" : "secondary"}
                onClick={() => handleToggleStatus(row)}
                title={row.status === "ACTIVE" ? "Deactivate customer" : "Activate customer"}
                icon={<Icon name="power" size={13} />}
              >
                {row.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Customer Directory"
        subtitle="Manage wholesale buyers, store credit limits, and ledger balances"
        badge={<Badge variant="primary">{customers.length} Accounts</Badge>}
        actions={
          canManageCustomers && (
            <Button
              variant="primary"
              onClick={() => navigate("/customers/create")}
              icon={<Icon name="plus" size={15} />}
            >
              Add New Customer
            </Button>
          )
        }
      />

      {/* Filter and Search Bar */}
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
            placeholder="Search by shop name, owner, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Icon name="search" size={15} />}
          />
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "ALL", label: "All Accounts" },
            { id: "WHOLESALE", label: "Wholesale Dealers" },
            { id: "RETAIL", label: "Retail Walk-in" },
            { id: "INACTIVE", label: "Inactive" },
          ].map((st) => (
            <Button
              key={st.id}
              size="sm"
              variant={statusFilter === st.id ? "primary" : "secondary"}
              onClick={() => setStatusFilter(st.id)}
            >
              {st.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Modern Data Table */}
      <DataTable
        columns={columns}
        data={filteredCustomers}
        loading={loading}
        emptyTitle="No matching customers"
        emptyDescription={
          searchQuery
            ? `No customer accounts matching "${searchQuery}".`
            : "Get started by adding your first wholesale client account."
        }
        emptyIcon="users"
        emptyAction={
          canManageCustomers
            ? {
                label: "Add New Customer",
                onClick: () => navigate("/customers/create"),
              }
            : null
        }
      />
    </MainLayout>
  );
}
