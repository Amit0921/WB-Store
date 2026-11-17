import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getAllUsers, updateUserStatus } from "../../api/userApi";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to load users list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateUserStatus(user.id, newStatus);
      loadUsers();
    } catch (err) {
      alert("Failed to update user status.");
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 1000, paddingBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>User Management</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Manage staff accounts and permissions</p>
          </div>
        </div>

        {error && (
          <div style={{ background: "#fdecea", color: "#c0392b", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "#64748b" }}>Loading users...</div>
          ) : users.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>No users found.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 11 }}>NAME / USERNAME</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 11 }}>ROLE</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", color: "#64748b", fontWeight: 600, fontSize: 11 }}>STATUS</th>
                  <th style={{ padding: "12px 16px", textAlign: "right", color: "#64748b", fontWeight: 600, fontSize: 11 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>{u.fullName || u.username}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>@{u.username} • {u.email || "No email"}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                        background: u.role === "ADMIN" ? "#ede9fe" : "#e0f2fe",
                        color: u.role === "ADMIN" ? "#4c3cce" : "#0284c7"
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700,
                        background: u.status === "ACTIVE" ? "#dcfce7" : "#fee2e2",
                        color: u.status === "ACTIVE" ? "#166534" : "#991b1b"
                      }}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        style={{
                          padding: "6px 12px", background: "#f8fafc", border: "1px solid #e2e8f0",
                          borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 500, color: "#475569"
                        }}
                      >
                        {u.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
