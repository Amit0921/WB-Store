import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const navigate = useNavigate();

  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div
      style={{
        height: 63,
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 30px",
        position: "sticky",
        top: 0
      }}
    >
      <input
        placeholder="Search..."
        style={{
          width: 300,
          padding: 10,
          borderRadius: 10,
          border: "1px solid #ddd"
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20
        }}
      >
        <span style={{ fontSize: 22 }}>
          🔔
        </span>

        {/* <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "#4c3cce",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600
          }}
        >
          {user?.username?.charAt(0)?.toUpperCase() ||
            "A"}
        </div> */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "#4c3cce",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600
            }}
          >
            {user?.username?.charAt(0)?.toUpperCase()}
          </div>

          <div>
            <div
              style={{
                fontWeight: 600,
                color: "#111827",
                fontSize: 14
              }}
            >
              {user?.fullName}
            </div>

            {/* <div
              style={{
                fontSize: 12,
                color: "#6b7280"
              }}
            >
              @{user?.username}
            </div> */}
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            border: "none",
            background: "#ef4444",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}