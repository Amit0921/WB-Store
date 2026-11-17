import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import NavbarHome from "../components/NavbarHome";

const BRAND = "#4c3cce";
const BRAND_DARK = "#3d2fb8";
const BRAND_FOCUS = "rgba(76,60,206,0.12)";

const styles = {
  root: {
    minHeight: "calc(100vh - 75px)",
    background: "#f4f3ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "inherit",
  },
  card: {
    display: "flex",
    width: "100%",
    maxWidth: 820,
    minHeight: 480,
    borderRadius: 18,
    overflow: "hidden",
    boxShadow: "0 12px 48px rgba(76,60,206,0.14), 0 1px 4px rgba(0,0,0,0.07)",
  },
  left: {
    width: "42%",
    background: BRAND,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "32px 28px",
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
  },
  leftCircle1: {
    position: "absolute", width: 320, height: 320, borderRadius: "50%",
    background: "rgba(255,255,255,0.07)", top: -110, right: -110, pointerEvents: "none",
  },
  leftCircle2: {
    position: "absolute", width: 220, height: 220, borderRadius: "50%",
    background: "rgba(255,255,255,0.05)", bottom: -75, left: -75, pointerEvents: "none",
  },
  brandName: {
    fontSize: 22, fontWeight: 600, color: "#fff",
    letterSpacing: "-0.3px", position: "relative", zIndex: 1,
  },
  brandTag: {
    fontSize: 11, color: "rgba(255,255,255,0.5)",
    marginTop: 3, letterSpacing: "0.5px", position: "relative", zIndex: 1,
  },
  illustBlock: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "24px 0", position: "relative", zIndex: 1, textAlign: "center",
  },
  illustIconWrap: {                        // NEW: icon in a frosted tile
    fontSize: 54,
    lineHeight: 1,
    marginBottom: 18,
    background: "rgba(255,255,255,0.12)",
    width: 88, height: 88,
    borderRadius: 22,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  illustTitle: {
    fontSize: 17, fontWeight: 500, color: "#fff",
    lineHeight: 1.5, marginBottom: 20,
  },
  features: { display: "flex", flexDirection: "column", gap: 10, width: "100%" },
  featureItem: { display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "rgba(255,255,255,0.75)" },
  featureCheck: {                          // NEW: checkmark bubble instead of dot
    width: 18, height: 18, borderRadius: "50%",
    background: "rgba(255,255,255,0.18)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, fontSize: 10, color: "#fff",
  },
  leftFooter: { fontSize: 11, color: "rgba(255,255,255,0.3)", position: "relative", zIndex: 1 },

  right: {
    flex: 1,
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "40px 36px",    // was 28px — too tight
  },
  formTitle: { fontSize: 22, fontWeight: 600, color: "#0f172a", marginBottom: 5 },
  formSub: { fontSize: 13, color: "#64748b", marginBottom: 28 },  // was 20px gap
  fieldWrap: { marginBottom: 18 },
  label: {
    display: "block", fontSize: 11, color: "#64748b", fontWeight: 500,
    textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 7,
  },
  inputWrap: { position: "relative" },
  inputIcon: {
    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
    fontSize: 15, color: "#94a3b8", pointerEvents: "none",
  },
  input: {
    width: "100%", padding: "10px 12px 10px 38px",   // was 8px top/bottom — too small
    border: "1px solid #e2e8f0", borderRadius: 8,
    fontSize: 13, color: "#0f172a", background: "#fff",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s",
  },
  errBox: {
    background: "#fff2f2", border: "1px solid #fca5a5",
    borderRadius: 8, padding: "10px 12px",
    fontSize: 12, color: "#dc2626", marginBottom: 16,
    display: "flex", alignItems: "center", gap: 7,
  },
  submitBtn: {
    width: "100%", padding: 12, background: BRAND,
    border: "none", borderRadius: 9, color: "#fff",
    fontSize: 14, fontWeight: 600, cursor: "pointer",
    letterSpacing: "0.2px", marginTop: 4, transition: "background 0.15s",
  },
  divider: {
    fontSize: 11, color: "#94a3b8", margin: "20px 0",
    display: "flex", alignItems: "center", gap: 10,
  },
  dividerLine: { flex: 1, height: 1, background: "#e2e8f0" },
  footerNote: { fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 18, lineHeight: 1.8 },
};

const features = [
  "GST billing & invoicing",
  "Customer ledger & statements",
  "Payment tracking",
  "Inventory management",
];

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await login(form);
      const { accessToken, user } = res.data.data;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      // const { token, user } = res.data;
      // localStorage.setItem("token", token);
      // localStorage.setItem("user", JSON.stringify(user || {}));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  const focusInput = (e) => {
    e.target.style.borderColor = BRAND;
    e.target.style.boxShadow = `0 0 0 3px ${BRAND_FOCUS}`;
  };
  const blurInput = (e) => {
    e.target.style.borderColor = "#e2e8f0";
    e.target.style.boxShadow = "none";
  };

  return (
    <>
      <NavbarHome
        buttonText="Back to Home"
        buttonPath="/"
      />

      <div style={styles.root}>
        <div style={styles.card}>

          {/* Left panel */}
          <div style={styles.left}>
            <div style={styles.leftCircle1} />
            <div style={styles.leftCircle2} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={styles.brandName}>myBusiness</div>
              <div style={styles.brandTag}>Billing &amp; Management</div>
            </div>

            <div style={styles.illustBlock}>
              <div style={styles.illustIconWrap}>🧾</div>

              <div style={styles.illustTitle}>
                Manage your wholesale
                <br />
                business smarter
              </div>

              <div style={styles.features}>
                {features.map((f) => (
                  <div key={f} style={styles.featureItem}>
                    <div style={styles.featureCheck}>✓</div>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.leftFooter}>
              © 2026 myBusiness. All rights reserved.
            </div>
          </div>

          {/* Right panel */}
          <div style={styles.right}>
            <div style={styles.formTitle}>Welcome back</div>
            <div style={styles.formSub}>
              Sign in to continue to your dashboard
            </div>

            {error && (
              <div style={styles.errBox}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                {error}
              </div>
            )}

            {/* Username */}
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Username</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>👤</span>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={(e) => setField("username", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  style={styles.input}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldWrap}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>🔒</span>

                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  style={{ ...styles.input, paddingRight: 40 }}
                  autoComplete="current-password"
                />

                <button
                  onClick={() => setShowPass((s) => !s)}
                  tabIndex={-1}
                  aria-label={showPass ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: 11,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 15,
                    color: "#94a3b8",
                    padding: 2,
                    lineHeight: 1,
                  }}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) =>
                !loading && (e.target.style.background = BRAND_DARK)
              }
              onMouseLeave={(e) =>
                (e.target.style.background = BRAND)
              }
            >
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}