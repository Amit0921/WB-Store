import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getInvoices } from "../../api/invoiceApi";
import { THEME } from "../../utils/theme";
import Icon from "../../components/ui/Icon";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import DataTable from "../../components/ui/DataTable";
import PageHeader from "../../components/ui/PageHeader";

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const pStatus = statusFilter ? statusFilter : null;
      const data = await getInvoices(page, 10, null, pStatus, null);
      if (data && data.content) {
        setInvoices(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        setInvoices(data || []);
      }
    } catch (err) {
      console.error("Error loading invoices:", err);
      setError("Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const totalBilled = invoices.reduce((s, i) => s + Number(i.finalAmount || 0), 0);
  const totalCollected = invoices.reduce((s, i) => s + Number(i.paidAmount || 0), 0);
  const totalDue = invoices.reduce((s, i) => s + Number(i.dueAmount || 0), 0);

  const statusPills = [
    { label: "All Invoices", value: "" },
    { label: "Pending (Unpaid)", value: "UNPAID" },
    { label: "Partially Paid", value: "PARTIAL" },
    { label: "Fully Paid", value: "PAID" },
  ];

  const columns = [
    {
      header: "Invoice #",
      accessor: "invoiceNo",
      render: (row) => (
        <div>
          <Link
            to={`/invoices/${row.id}`}
            style={{
              fontFamily: "monospace",
              fontWeight: 700,
              color: THEME.colors.primary,
              textDecoration: "none",
              fontSize: "13px",
            }}
          >
            {row.invoiceNo}
          </Link>
          <div style={{ fontSize: "11px", color: THEME.colors.textMuted, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
            {row.invoiceDate ? new Date(row.invoiceDate).toLocaleDateString("en-IN") : "—"}
          </div>
        </div>
      ),
    },
    {
      header: "Customer / Shop",
      accessor: "customerName",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: THEME.colors.textPrimary, fontSize: "13px" }}>
            {row.customerName || `Customer #${row.customerId}`}
          </div>
          {row.customerPhone && (
            <div style={{ fontSize: "11px", color: THEME.colors.textMuted, marginTop: 2 }}>
              Ph: {row.customerPhone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Total Bill (₹)",
      accessor: "finalAmount",
      align: "right",
      render: (row) => (
        <span style={{ fontWeight: 700, color: THEME.colors.textPrimary, fontVariantNumeric: "tabular-nums" }}>
          ₹{Number(row.finalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Paid (₹)",
      accessor: "paidAmount",
      align: "right",
      render: (row) => (
        <span style={{ color: THEME.colors.success, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          ₹{Number(row.paidAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Balance Due",
      accessor: "dueAmount",
      align: "right",
      render: (row) => {
        const due = Number(row.dueAmount || 0);
        return (
          <span
            style={{
              fontWeight: 800,
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
      header: "Payment",
      accessor: "paymentStatus",
      align: "center",
      render: (row) => <Badge size="sm">{row.paymentStatus}</Badge>,
    },
    {
      header: "Status",
      accessor: "invoiceStatus",
      align: "center",
      render: (row) => (
        <Badge
          size="sm"
          variant={row.invoiceStatus === "CANCELLED" ? "danger" : "neutral"}
        >
          {row.invoiceStatus}
        </Badge>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (row) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => navigate(`/invoices/${row.id}`)}
          icon={<Icon name="eye" size={13} />}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title="Wholesale &amp; Retail Invoices"
        subtitle="Track GST tax bills, payment settlements, and outstanding customer balances"
        badge={<Badge variant="primary">{totalElements} Invoices</Badge>}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => navigate("/billing/retail")}
              icon={<Icon name="zap" size={15} color={THEME.colors.primary} />}
            >
              Retail Counter POS
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate("/invoices/new")}
              icon={<Icon name="plus" size={15} />}
            >
              New Wholesale Bill
            </Button>
          </>
        }
      />

      {error && (
        <div style={{ background: THEME.colors.dangerBg, color: THEME.colors.danger, borderRadius: 8, padding: "10px 14px", fontSize: "13px", marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Aggregate Financial Metrics Strip */}
      <div className="grid-cols-3-responsive" style={{ marginBottom: 20 }}>
        <div style={{ background: "#FFFFFF", borderRadius: THEME.radius.lg, border: `1px solid ${THEME.colors.border}`, padding: "16px 20px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: THEME.colors.textMuted, textTransform: "uppercase" }}>Current View Billed</div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: THEME.colors.textPrimary, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
            ₹{totalBilled.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: THEME.radius.lg, border: `1px solid ${THEME.colors.border}`, padding: "16px 20px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: THEME.colors.textMuted, textTransform: "uppercase" }}>Collections Settled</div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: THEME.colors.success, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
            ₹{totalCollected.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ background: "#FFFFFF", borderRadius: THEME.radius.lg, border: `1px solid ${THEME.colors.border}`, padding: "16px 20px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: THEME.colors.textMuted, textTransform: "uppercase" }}>Unsettled Receivables</div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: totalDue > 0 ? THEME.colors.danger : THEME.colors.success, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
            ₹{totalDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {statusPills.map((p) => {
          const active = statusFilter === p.value;
          return (
            <Button
              key={p.value}
              size="sm"
              variant={active ? "primary" : "secondary"}
              onClick={() => {
                setStatusFilter(p.value);
                setPage(0);
              }}
            >
              {p.label}
            </Button>
          );
        })}
      </div>

      {/* Modern Data Table */}
      <DataTable
        columns={columns}
        data={invoices}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={(p) => setPage(p)}
        emptyTitle="No invoices recorded"
        emptyDescription="Create your first wholesale bill or retail counter sale."
        emptyIcon="file-text"
        emptyAction={{
          label: "New Wholesale Bill",
          onClick: () => navigate("/invoices/new"),
        }}
      />
    </MainLayout>
  );
}
