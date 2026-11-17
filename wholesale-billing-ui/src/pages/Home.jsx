import { useNavigate } from "react-router-dom";
import NavbarHome from "../components/NavbarHome";

const BRAND = "#4c3cce";
const BRAND_DARK = "#3d2fb8";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f3ff",
        fontFamily: "inherit",
      }}
    >
      <NavbarHome
        buttonText="Login"
        buttonPath="/login"
      />

      {/* Hero Section */}
      <section
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "70px",
          gap: "60px",
        }}
      >
        <div style={{ flex: 1, padding: "20px" }}>
          {/* <div
            style={{
              display: "inline-block",
              background: "#eae7ff",
              color: BRAND,
              padding: "8px 16px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "20px",
            }}
          >
            🚀 GST Ready Billing Software
          </div> */}

          <h1
            style={{
              fontSize: "54px",
              lineHeight: "1.2",
              marginBottom: "20px",
              color: "#0f172a",
            }}
          >
            Simplify Your
            <br />
            Wholesale Business
          </h1>

          <p
            style={{
              fontSize: "18px",
              color: "#64748b",
              lineHeight: "1.8",
              maxWidth: "600px",
            }}
          >
            Manage customers, invoices, payments, inventory and GST
            billing from one powerful platform built specifically for
            wholesale businesses.
          </p>

          <div
            style={{
              display: "flex",
              gap: "15px",
              marginTop: "30px",
            }}
          >
            <button
              onClick={() => navigate("/login")}
              style={{
                background: BRAND,
                color: "#fff",
                border: "none",
                padding: "14px 28px",
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Get Started
            </button>

            <button
              style={{
                background: "#fff",
                border: "1px solid #ddd",
                padding: "14px 28px",
                borderRadius: 10,
                cursor: "pointer",
              }}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Right Illustration */}
        <div
          style={{
            flex: 1,
            background: BRAND,
            borderRadius: 24,
            padding: "30px",
            color: "#fff",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(76,60,206,0.25)",
          }}
        >
          <div style={{ fontSize: "90px" }}>🧾</div>

          <h2>Business Dashboard</h2>

          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              lineHeight: "1.8",
            }}
          >
            Track invoices, customers, payments and inventory
            with real-time insights.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
              marginTop: "30px",
            }}
          >
            <Stat title="Customers" value="500+" />
            <Stat title="Invoices" value="10K+" />
            <Stat title="Payments" value="₹50L+" />
            <Stat title="Growth" value="99%" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          padding: "80px",
          background: "#fff",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "50px",
            fontSize: "36px",
            color: "#0f172a",
          }}
        >
          Everything You Need
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: "25px",
          }}
        >
          <Feature icon="👥" title="Customer Management" />
          <Feature icon="🧾" title="Invoice Generation" />
          <Feature icon="💳" title="Payment Tracking" />
          <Feature icon="📦" title="Inventory Control" />
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: BRAND,
          color: "#fff",
          textAlign: "center",
          padding: "30px",
        }}
      >
        © 2026 myBusiness • Wholesale Billing & Management System
      </footer>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: "20px",
      }}
    >
      <h3 style={{ margin: 0 }}>{value}</h3>
      <small>{title}</small>
    </div>
  );
}

function Feature({ icon, title }) {
  return (
    <div
      style={{
        background: "#f8f7ff",
        padding: "30px",
        borderRadius: 16,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "42px" }}>{icon}</div>
      <h3>{title}</h3>
    </div>
  );
}