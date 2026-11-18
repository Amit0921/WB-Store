import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { getPayments } from "../../api/paymentApi";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Icon from "../../components/ui/Icon";
import { colors, radius, shadows } from "../../utils/theme";

export default function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getPayments(page, 10, null);
      if (data && data.content) {
        setPayments(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        setPayments(data || []);
      }
    } catch (err) {
      console.error("Error loading payments:", err);
      setError("Failed to load payment receipts.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const totalCollectedOnPage = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const getPaymentModeBadge = (mode) => {
    switch (mode) {
      case "UPI":
        return <Badge variant="info">UPI</Badge>;
      case "CASH":
        return <Badge variant="success">CASH</Badge>;
      case "BANK_TRANSFER":
        return <Badge variant="primary">BANK TRF</Badge>;
      case "CHEQUE":
        return <Badge variant="warning">CHEQUE</Badge>;
      case "CARD":
        return <Badge variant="neutral">CARD</Badge>;
      default:
        return <Badge variant="neutral">{mode}</Badge>;
    }
  };

  const columns = [
    {
      header: "RECEIPT NO",
      render: (p) => (
        <Link
          to={`/payments/${p.id}`}
          style={{
            color: colors.primary,
            fontWeight: 700,
            fontFamily: "monospace",
            textDecoration: "none",
          }}
        >
          {p.receiptNo || `REC-${p.id}`}
        </Link>
      ),
    },
    {
      header: "DATE",
      render: (p) => (
        <span style={{ color: colors.textSecondary, fontSize: 12 }}>
          {p.paymentDate
            ? new Date(p.paymentDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      header: "CUSTOMER / SHOP",
      render: (p) => (
        <div>
          <div style={{ fontWeight: 600, color: colors.textPrimary }}>{p.customerName}</div>
          {p.customerPhone && <div style={{ fontSize: 11, color: colors.textSecondary }}>{p.customerPhone}</div>}
        </div>
      ),
    },
    {
      header: "SETTLED INVOICE",
      render: (p) =>
        p.invoiceNo ? (
          <span
            style={{
              background: colors.background,
              border: `1px solid ${colors.border}`,
              padding: "2px 8px",
              borderRadius: radius.sm,
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: 600,
              color: colors.textPrimary,
            }}
          >
            {p.invoiceNo}
          </span>
        ) : (
          <span style={{ color: colors.textSecondary, fontSize: 12, fontStyle: "italic" }}>
            FIFO Auto Settle
          </span>
        ),
    },
    {
      header: "MODE",
      align: "center",
      render: (p) => getPaymentModeBadge(p.paymentMode),
    },
    {
      header: "AMOUNT",
      align: "right",
      render: (p) => (
        <span
          style={{
            fontWeight: 800,
            color: colors.success,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          ₹{Number(p.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "ACTION",
      align: "right",
      render: (p) => (
        <Button
          variant="secondary"
          size="sm"
          icon="printer"
          onClick={() => navigate(`/payments/${p.id}`)}
        >
          Receipt
        </Button>
      ),
    },
  ];

  return (
    <MainLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
        <PageHeader
          title="Payment Vouchers & Receipts"
          subtitle="Track customer collections, ledger credits, and official payment vouchers"
          breadcrumbs={[{ label: "Finance" }, { label: "Payments" }]}
          actions={
            <Button
              variant="primary"
              size="sm"
              icon="plus"
              onClick={() => navigate("/payments/create")}
            >
              Record New Payment
            </Button>
          }
        />

        {/* Financial KPI Summary Strip */}
        <div className="grid-cols-2-responsive" style={{ marginBottom: 20 }}>
          <StatCard
            title="Total Collected (Page View)"
            value={`₹${totalCollectedOnPage.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            caption="Sum of vouchers displayed in active view"
            icon="credit-card"
          />
          <StatCard
            title="Total Vouchers Recorded"
            value={totalElements}
            caption="Lifetime verified customer collection receipts"
            icon="file-text"
          />
        </div>

        {error && (
          <div
            style={{
              background: "#FEE2E2",
              border: `1px solid #FECDD3`,
              color: colors.danger,
              borderRadius: radius.md,
              padding: "10px 14px",
              fontSize: 13,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Icon name="alert-triangle" size={16} />
            <span>{error}</span>
          </div>
        )}

        <DataTable
          columns={columns}
          data={payments}
          loading={loading}
          pagination={{
            page,
            totalPages,
            totalElements,
            onPageChange: (newPage) => setPage(newPage),
          }}
          emptyMessage="No payment vouchers recorded yet."
        />
      </div>
    </MainLayout>
  );
}
