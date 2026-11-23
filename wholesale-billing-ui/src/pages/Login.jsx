import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import NavbarHome from "../components/NavbarHome";
import { THEME } from "../utils/theme";
import Icon from "../components/ui/Icon";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.username || !form.password) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await login(form);
      const { accessToken, refreshToken, user } = res.data.data;
      localStorage.setItem("token", accessToken);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (u, p) => {
    setForm({ username: u, password: p });
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F8FC", display: "flex", flexDirection: "column" }}>
      <NavbarHome buttonText="Back to Home" buttonPath="/" />

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            maxWidth: 880,
            minHeight: 520,
            borderRadius: THEME.radius.xl,
            overflow: "hidden",
            boxShadow: "0 20px 48px -12px rgba(16, 24, 40, 0.12), 0 0 0 1px #E8EAF2",
            background: "#FFFFFF",
          }}
          className="login-card-container"
        >
          {/* Left Brand Panel */}
          <div
            style={{
              width: "44%",
              background: `linear-gradient(145deg, ${THEME.colors.primary} 0%, #3629A6 100%)`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "36px 32px",
              position: "relative",
              overflow: "hidden",
              color: "#FFFFFF",
            }}
            className="login-left-panel"
          >
            {/* Ambient Background Circles */}
            <div
              style={{
                position: "absolute",
                width: 320,
                height: 320,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                top: -80,
                right: -80,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.04)",
                bottom: -50,
                left: -50,
                pointerEvents: "none",
              }}
            />

            {/* Top Logo */}
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: THEME.radius.md,
                    background: "rgba(255,255,255,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Icon name="store" size={18} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.02em" }}>WB-Store</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Garments Commerce ERP</div>
                </div>
              </div>
            </div>

            {/* Middle Feature Highlights */}
            <div style={{ position: "relative", zIndex: 1, margin: "30px 0" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, lineHeight: 1.35, marginBottom: 20 }}>
                High-speed billing &amp; ledger control for modern merchants
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "GST tax invoices with instant printing",
                  "80mm Retail Counter POS billing",
                  "Double-entry wholesale customer ledger",
                  "Granular role-based staff access",
                ].map((feat, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "13px" }}>
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon name="check" size={12} color="#FFFFFF" />
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.9)" }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ position: "relative", zIndex: 1, fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
              © 2026 myBusiness Inc. Jeypore Textile Market.
            </div>
          </div>

          {/* Right Form Panel */}
          <div
            style={{
              flex: 1,
              padding: "44px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: "#FFFFFF",
            }}
          >
            <div style={{ marginBottom: 26 }}>
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: THEME.colors.textPrimary, letterSpacing: "-0.02em", margin: 0 }}>
                Welcome back
              </h1>
              <p style={{ fontSize: "13px", color: THEME.colors.textSecondary, margin: "5px 0 0" }}>
                Sign in with your staff or administrator credentials
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: THEME.colors.dangerBg,
                  border: `1px solid ${THEME.colors.dangerBorder}`,
                  color: THEME.colors.danger,
                  borderRadius: THEME.radius.md,
                  padding: "10px 14px",
                  fontSize: "12px",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 18,
                }}
              >
                <Icon name="alert-circle" size={16} color={THEME.colors.danger} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Input
                label="Username"
                placeholder="e.g. admin or staff_test"
                required
                value={form.username}
                onChange={(e) => setField("username", e.target.value)}
                icon={<Icon name="user" size={16} />}
                autoComplete="username"
              />

              <Input
                label="Password"
                type={showPass ? "text" : "password"}
                placeholder="Enter account password"
                required
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                icon={<Icon name="key" size={16} />}
                autoComplete="current-password"
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", alignItems: "center" }}
                    aria-label="Toggle password visibility"
                  >
                    <Icon name={showPass ? "eye-off" : "eye"} size={16} color={THEME.colors.textMuted} />
                  </button>
                }
              />

              <Button
                type="submit"
                size="lg"
                loading={loading}
                style={{ width: "100%", marginTop: 6 }}
                iconRight={<Icon name="arrow-right" size={15} />}
              >
                Sign In to Terminal
              </Button>
            </form>

            {/* Quick Demo Credentials Bar */}
            <div
              style={{
                marginTop: 28,
                paddingTop: 18,
                borderTop: `1px solid ${THEME.colors.borderSubtle}`,
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 700, color: THEME.colors.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                Quick Fill Test Account:
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => quickFill("amit", "Admin@123")}
                  style={{
                    background: THEME.colors.primaryLight,
                    border: `1px solid rgba(76, 60, 206, 0.2)`,
                    color: THEME.colors.primary,
                    borderRadius: THEME.radius.sm,
                    padding: "4px 8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Admin (Owner)
                </button>
                <button
                  type="button"
                  onClick={() => quickFill("aditya", "Manager@123")}
                  style={{
                    background: "#F0F9FF",
                    border: "1px solid #BAE6FD",
                    color: "#0369A1",
                    borderRadius: THEME.radius.sm,
                    padding: "4px 8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Manager
                </button>
                <button
                  type="button"
                  onClick={() => quickFill("ravi", "Staff@123")}
                  style={{
                    background: "#F1F5F9",
                    border: "1px solid #CBD5E1",
                    color: "#475569",
                    borderRadius: THEME.radius.sm,
                    padding: "4px 8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Billing Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-card-container {
            flex-direction: column !important;
            max-width: 480px !important;
          }
          .login-left-panel {
            width: 100% !important;
            padding: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
