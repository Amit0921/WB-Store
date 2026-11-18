import { useEffect, useState, useCallback } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getAllUsers, createUser, updateUser, updateUserStatus, changeUserPassword } from "../../api/userApi";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import Icon from "../../components/ui/Icon";
import { colors, radius, shadows } from "../../utils/theme";

export default function UserList() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const rawRoles = Array.isArray(currentUser?.roles)
    ? currentUser.roles
    : currentUser?.roles
    ? Array.from(currentUser.roles)
    : [];
  const currentRoles = rawRoles.map((r) => (typeof r === "string" ? r.replace(/^ROLE_/, "") : r));
  const isAdmin = currentRoles.includes("ADMIN");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Forms
  const [createForm, setCreateForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "BILLING_STAFF",
  });

  const [editForm, setEditForm] = useState({
    id: null,
    fullName: "",
    email: "",
    phone: "",
    role: "BILLING_STAFF",
  });

  const [passwordForm, setPasswordForm] = useState({
    id: null,
    username: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to load users list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleStatus = async (user) => {
    const nextActive = !user.active;
    try {
      await updateUserStatus(user.id, nextActive);
      setSuccess(`User status updated to ${nextActive ? "ACTIVE" : "INACTIVE"}`);
      loadUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user status.");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.fullName || !createForm.username || !createForm.phone || !createForm.password) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      setActionLoading(true);
      setError("");
      await createUser(createForm);
      setSuccess("New staff account created successfully!");
      setShowCreateModal(false);
      setCreateForm({ fullName: "", username: "", email: "", phone: "", password: "", role: "BILLING_STAFF" });
      loadUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user account.");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (user) => {
    const primaryRole = user.roles && user.roles.size ? Array.from(user.roles)[0] : (Array.isArray(user.roles) ? user.roles[0] : "BILLING_STAFF");
    setEditForm({
      id: user.id,
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      role: primaryRole || "BILLING_STAFF",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError("");
      await updateUser(editForm.id, {
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.role,
      });
      setSuccess("User account updated successfully!");
      setShowEditModal(false);
      loadUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user.");
    } finally {
      setActionLoading(false);
    }
  };

  const openPasswordModal = (user) => {
    setPasswordForm({
      id: user.id,
      username: user.username,
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setActionLoading(true);
      setError("");
      await changeUserPassword(passwordForm.id, { newPassword: passwordForm.newPassword });
      setSuccess(`Password for @${passwordForm.username} changed successfully!`);
      setShowPasswordModal(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: "STAFF MEMBER",
      render: (u) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#EEF2FF",
              color: colors.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {(u.fullName || u.username || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: colors.textPrimary }}>{u.fullName || u.username}</div>
            <div style={{ fontSize: 11, color: colors.textSecondary, fontFamily: "monospace" }}>@{u.username}</div>
          </div>
        </div>
      ),
    },
    {
      header: "CONTACT",
      render: (u) => (
        <div>
          <div style={{ color: colors.textPrimary, fontWeight: 500 }}>{u.phone || "—"}</div>
          {u.email && <div style={{ fontSize: 11, color: colors.textSecondary }}>{u.email}</div>}
        </div>
      ),
    },
    {
      header: "ROLE",
      render: (u) => {
        const rolesArray = Array.from(u.roles || []);
        const roleStr = rolesArray.length > 0 ? rolesArray[0] : "BILLING_STAFF";
        return <Badge variant={roleStr}>{roleStr}</Badge>;
      },
    },
    {
      header: "STATUS",
      align: "center",
      render: (u) => (
        <Badge variant={u.active ? "success" : "danger"}>
          {u.active ? "ACTIVE" : "INACTIVE"}
        </Badge>
      ),
    },
    {
      header: "ACTIONS",
      align: "right",
      render: (u) => (
        <div style={{ display: "inline-flex", gap: 6 }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openEditModal(u)}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openPasswordModal(u)}
          >
            Password
          </Button>
          <Button
            variant={u.active ? "danger" : "success"}
            size="sm"
            onClick={() => handleToggleStatus(u)}
          >
            {u.active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
        <PageHeader
          title="Staff & User Management"
          subtitle="Manage wholesale store operators, branch managers, role permissions, and access credentials"
          breadcrumbs={[{ label: "Administration" }, { label: "Users" }]}
          actions={
            isAdmin && (
              <Button
                variant="primary"
                size="sm"
                icon="plus"
                onClick={() => setShowCreateModal(true)}
              >
                Create New User
              </Button>
            )
          }
        />

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

        {success && (
          <div
            style={{
              background: "#ECFDF5",
              border: `1px solid #BBF7D0`,
              color: colors.success,
              borderRadius: radius.md,
              padding: "10px 14px",
              fontSize: 13,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Icon name="check" size={16} />
            <span>{success}</span>
          </div>
        )}

        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyMessage="No staff accounts found."
        />

        {/* CREATE USER MODAL */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Add New Staff Member"
          footer={
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={actionLoading}
                onClick={handleCreateSubmit}
              >
                Create Staff Account
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input
              label="Full Name"
              required
              placeholder="e.g. Rahul Sharma"
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
            />
            <div className="form-grid-responsive" style={{ gap: 12 }}>
              <Input
                label="Username"
                required
                placeholder="e.g. rahul_counter"
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
              />
              <Input
                label="Phone Number"
                required
                placeholder="10-digit mobile"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              />
            </div>
            <Input
              label="Email Address (Optional)"
              type="email"
              placeholder="name@wbstore.com"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            />
            <Input
              label="Account Password"
              type="password"
              required
              placeholder="Min 6 characters"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            />
            <Select
              label="Role Assignment"
              required
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              options={[
                { label: "BILLING_STAFF (Counter POS Invoicing & Cash Collections)", value: "BILLING_STAFF" },
                { label: "MANAGER (Customer & Product Catalog Management + Financial Reports)", value: "MANAGER" },
                { label: "ADMIN / OWNER (Full Store Authority & User Control)", value: "ADMIN" },
              ]}
            />
          </form>
        </Modal>

        {/* EDIT USER MODAL */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Staff Member"
          footer={
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={actionLoading}
                onClick={handleEditSubmit}
              >
                Save Changes
              </Button>
            </div>
          }
        >
          <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input
              label="Full Name"
              value={editForm.fullName}
              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
            />
            <Input
              label="Phone Number"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
            <Select
              label="Assigned Role"
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              options={[
                { label: "BILLING_STAFF", value: "BILLING_STAFF" },
                { label: "MANAGER", value: "MANAGER" },
                { label: "ADMIN", value: "ADMIN" },
              ]}
            />
          </form>
        </Modal>

        {/* CHANGE PASSWORD MODAL */}
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title={`Change Password — @${passwordForm.username}`}
          footer={
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={actionLoading}
                onClick={handlePasswordSubmit}
              >
                Update Password
              </Button>
            </div>
          }
        >
          <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input
              label="New Password"
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              placeholder="Re-enter new password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
          </form>
        </Modal>
      </div>
    </MainLayout>
  );
}
