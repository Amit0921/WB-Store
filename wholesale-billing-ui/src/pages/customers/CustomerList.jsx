import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import {
  getAllCustomers,
  updateCustomerStatus,
} from "../../api/customerApi";
import { STATUS_COLORS } from "../../utils/constants";

export default function CustomerList() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const customersData = await getAllCustomers();

      console.log("Customers:", customersData);

      setCustomers(customersData);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const toggleStatus = async (e, customer) => {
    e.stopPropagation();

    try {
      const nextStatus =
        customer.status === "ACTIVE"
          ? "INACTIVE"
          : "ACTIVE";

      await updateCustomerStatus(
        customer.id,
        nextStatus
      );

      loadCustomers();
    } catch (error) {
      console.error(error);
      alert("Failed to update customer status");
    }
  };

  const columns = [
    {
      key: "shopName",
      label: "Shop Name",
    },
    {
      key: "ownerName",
      label: "Owner Name",
    },
    {
      key: "phone",
      label: "Phone",
    },
    {
      key: "gstin",
      label: "GSTIN",
    },
    {
      key: "currentDue",
      label: "Current Due",
      render: (value) => `₹${Number(value || 0).toLocaleString()}`,
    },
    {
      key: "creditLimit",
      label: "Credit Limit",
      render: (value) => `₹${Number(value || 0).toLocaleString()}`,
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "12px",
            background: value === "ACTIVE" ? "#dcfce7" : "#fee2e2",
            color: value === "ACTIVE" ? "#166534" : "#991b1b",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          {value}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px 24px", background: "#f5f6fa", minHeight: "100%" }}>
      {/* Page Header */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2
            style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1e1b4b" }}>
            Customers
          </h2>

          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>
            {totalCustomers} customers found
          </p>
        </div>

        <button
          onClick={() =>
            navigate(
              "/customers/create"
            )
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 18px",
            background: "#4c3cce",
            color: "rgb(255, 255, 255)",
            borderWidth: "medium",
            borderStyle: "none",
            borderColor: "currentcolor",
            borderImage: "initial",
            borderRadius: "9px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          + Add Customer
        </button>
      </div>

      {/* Table Card */}

      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          padding: "20px",
          boxShadow:
            "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        <DataTable
          columns={columns}
          data={customers}
          loading={loading}
          onRowClick={(row) =>
            navigate(
              `/customers/${row.id}/summary`
            )
          }
        />
      </div>
    </div >
  );
}

const btnStyle = {
  border: "none",
  background: "#eef2ff",
  color: "#4c3cce",
  padding: "6px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
};