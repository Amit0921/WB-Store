import { useNavigate } from "react-router-dom";
import logo from "../assets/mybusiness_app_icon.png";

const BRAND = "#4c3cce";

export default function NavbarHome({
    buttonText,
    buttonPath,
}) {
    const navigate = useNavigate();

    return (
        <nav
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 80px",
                background: "#fff",
                boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
                height: "75px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                }}
            >
                <img
                    src={logo}
                    alt="myBusiness"
                    style={{
                        width: 76,
                        height: 76,
                    }}
                />

                <div>
                    <h2
                        style={{
                            margin: 0,
                            color: BRAND,
                            fontWeight: 750,
                            fontSize: "22px",
                            lineHeight: "24px",
                        }}
                    >
                        myBusiness
                    </h2>

                    <p
                        style={{
                            margin: 0,
                            fontSize: "12px",
                            color: "#64748b",
                            fontWeight: 500,
                        }}
                    >
                        Wholesale Billing & Management
                    </p>
                </div>
            </div>

            <button
                onClick={() => navigate(buttonPath)}
                style={{
                    background: BRAND,
                    color: "#fff",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "14px",
                    transition: "all 0.2s ease",
                    boxShadow: "0 8px 20px rgba(76,60,206,0.25)",
                }}
                onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                }}
            >
                {buttonText}
            </button>
        </nav>
    );
}