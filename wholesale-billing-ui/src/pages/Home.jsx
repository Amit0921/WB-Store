import { useNavigate } from "react-router-dom";
import NavbarHome from "../components/NavbarHome";
import { THEME } from "../utils/theme";
import Icon from "../components/ui/Icon";
import Button from "../components/ui/Button";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "file-text",
      title: "GST Tax Invoicing",
      description: "Generate compliant wholesale tax bills with HSN/SAC codes, CGST/SGST breakdowns, and printable A4 layouts.",
    },
    {
      icon: "zap",
      title: "Retail Counter POS",
      description: "High-speed point of sale for instant walk-in shoppers with 80mm thermal receipt printing and cash change calculators.",
    },
    {
      icon: "users",
      title: "Customer Credit & Ledger",
      description: "Track wholesale dues, credit limits, payment receipts, and automated FIFO invoice settlements with WhatsApp sharing.",
    },
    {
      icon: "bar-chart",
      title: "Audits & Financial Reports",
      description: "Real-time receivables aging brackets (0-30, 31-60, 60+ days), daily sales audits, and monthly business summaries.",
    },
    {
      icon: "package",
      title: "Garments Inventory Catalogue",
      description: "Manage product SKUs, size variations, categories, wholesale pricing, and live inventory search autocomplete.",
    },
    {
      icon: "shield-check",
      title: "Role-Based Access Control",
      description: "Fine-grained permissions for Store Owner (Admin), Store Manager, and Counter Cashiers with strict security.",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", color: THEME.colors.textPrimary }}>
      <NavbarHome buttonText="Sign In to Portal" buttonPath="/login" />

      {/* Hero Section */}
      <section
        style={{
          padding: "70px 40px 60px",
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: 60,
          alignItems: "center",
        }}
        className="home-hero-grid"
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 14px",
              borderRadius: "999px",
              background: THEME.colors.primaryLight,
              color: THEME.colors.primary,
              fontSize: "12px",
              fontWeight: 700,
              marginBottom: 20,
              border: `1px solid rgba(76, 60, 206, 0.2)`,
            }}
          >
            <Icon name="store" size={14} color={THEME.colors.primary} />
            Commerce Operating System for Garments
          </div>

          <h1
            style={{
              fontSize: "44px",
              fontWeight: 800,
              lineHeight: 1.15,
              color: THEME.colors.textPrimary,
              letterSpacing: "-0.03em",
              marginBottom: 18,
            }}
          >
            Simplify your wholesale &amp; retail garment business
          </h1>

          <p
            style={{
              fontSize: "16px",
              lineHeight: 1.6,
              color: THEME.colors.textSecondary,
              maxWidth: 520,
              marginBottom: 28,
            }}
          >
            Unified billing, inventory, customer ledger, and collection management platform designed specifically for textile markets and garment distributors.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36 }}>
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              iconRight={<Icon name="arrow-right" size={16} />}
            >
              Sign In to Store
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/login")}
              icon={<Icon name="zap" size={16} color={THEME.colors.primary} />}
            >
              Launch Retail Counter POS
            </Button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              paddingTop: 24,
              borderTop: `1px solid ${THEME.colors.borderSubtle}`,
            }}
          >
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: THEME.colors.textPrimary, fontVariantNumeric: "tabular-nums" }}>
                100%
              </div>
              <div style={{ fontSize: "12px", color: THEME.colors.textSecondary }}>GST Compliant</div>
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: THEME.colors.textPrimary, fontVariantNumeric: "tabular-nums" }}>
                &lt; 5 sec
              </div>
              <div style={{ fontSize: "12px", color: THEME.colors.textSecondary }}>Thermal Bill Generation</div>
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: THEME.colors.textPrimary, fontVariantNumeric: "tabular-nums" }}>
                Double-Entry
              </div>
              <div style={{ fontSize: "12px", color: THEME.colors.textSecondary }}>Customer Ledger Audit</div>
            </div>
          </div>
        </div>

        {/* Hero Interactive Preview Card */}
        <div
          style={{
            background: THEME.colors.surface,
            borderRadius: THEME.radius.xl,
            border: `1px solid ${THEME.colors.border}`,
            boxShadow: "0 24px 48px -12px rgba(16, 24, 40, 0.12)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Card Top Pill */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${THEME.colors.borderSubtle}`, paddingBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: THEME.colors.success }} />
              <span style={{ fontSize: "13px", fontWeight: 700, color: THEME.colors.textPrimary }}>Surat Garment Terminal #1</span>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: THEME.colors.primary, background: THEME.colors.primaryLight, padding: "3px 8px", borderRadius: 6 }}>
              LIVE COUNTER
            </span>
          </div>

          {/* Quick Metrics Banner */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "#F8FAFC", borderRadius: THEME.radius.md, padding: 14, border: `1px solid ${THEME.colors.borderSubtle}` }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: THEME.colors.textSecondary, textTransform: "uppercase" }}>Today&apos;s Turnout</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: THEME.colors.primary, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>₹48,250.00</div>
              <div style={{ fontSize: "11px", color: THEME.colors.success, marginTop: 2, fontWeight: 600 }}>↑ 18 Invoices Issued</div>
            </div>
            <div style={{ background: "#F8FAFC", borderRadius: THEME.radius.md, padding: 14, border: `1px solid ${THEME.colors.borderSubtle}` }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: THEME.colors.textSecondary, textTransform: "uppercase" }}>Collections Logged</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: THEME.colors.success, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>₹32,100.00</div>
              <div style={{ fontSize: "11px", color: THEME.colors.textSecondary, marginTop: 2 }}>UPI &amp; Cash Settle</div>
            </div>
          </div>

          {/* Sample Ledger Row */}
          <div style={{ background: "#FAFAFD", borderRadius: THEME.radius.md, padding: 12, border: `1px solid ${THEME.colors.borderSubtle}`, fontSize: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontWeight: 700, color: THEME.colors.textPrimary }}>Arihant Garments (Surat)</span>
              <span style={{ fontWeight: 700, color: THEME.colors.danger }}>Due: ₹1,149.00</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: THEME.colors.textMuted, fontSize: "11px" }}>
              <span>Bill #INV-2026-000009</span>
              <span style={{ color: THEME.colors.success, fontWeight: 600 }}>● Active Credit 0-30d</span>
            </div>
          </div>

          <Button
            onClick={() => navigate("/login")}
            style={{ width: "100%" }}
            iconRight={<Icon name="arrow-right" size={15} />}
          >
            Enter Store Workspace
          </Button>
        </div>
      </section>

      {/* Enterprise Capabilities Grid */}
      <section style={{ background: "#F7F8FC", padding: "80px 40px", borderTop: `1px solid ${THEME.colors.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: THEME.colors.textPrimary, letterSpacing: "-0.02em" }}>
              Engineered for Modern Garment Commerce
            </h2>
            <p style={{ fontSize: "15px", color: THEME.colors.textSecondary, marginTop: 8 }}>
              Built to replace fragile paper registers and spreadsheets with audit-grade ERP precision.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            {features.map((f, idx) => (
              <div
                key={idx}
                style={{
                  background: "#FFFFFF",
                  borderRadius: THEME.radius.lg,
                  border: `1px solid ${THEME.colors.border}`,
                  padding: 24,
                  boxShadow: THEME.shadows.card,
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: THEME.radius.md,
                    background: THEME.colors.primaryLight,
                    color: THEME.colors.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Icon name={f.icon} size={20} color={THEME.colors.primary} />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: THEME.colors.textPrimary, margin: "0 0 8px" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "13px", color: THEME.colors.textSecondary, lineHeight: 1.6, margin: 0 }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "#FFFFFF",
          borderTop: `1px solid ${THEME.colors.border}`,
          padding: "30px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 1200,
          margin: "0 auto",
          fontSize: "13px",
          color: THEME.colors.textSecondary,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="store" size={16} color={THEME.colors.primary} />
          <strong>WB-Store</strong> — Wholesale &amp; Retail Garments ERP
        </div>
        <div>© 2026 myBusiness Inc. All rights reserved. Surat Textile Market, Gujarat.</div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .home-hero-grid {
            grid-template-columns: 1fr !important;
            padding: 40px 20px !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </div>
  );
}
