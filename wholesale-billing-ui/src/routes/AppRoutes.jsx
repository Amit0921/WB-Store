import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import CustomerList from "../pages/customers/CustomerList";
import CustomerCreate from "../pages/customers/CustomerCreate";
import CustomerEdit from "../pages/customers/CustomerEdit";
import CustomerSummary from "../pages/customers/CustomerSummary";
import CreateInvoice from "../pages/invoices/CreateInvoice";
import CreatePayment from "../pages/payments/CreatePayment";
import UserList from "../pages/users/UserList";
import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Customer Routes */}
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CustomerList />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/create"
          element={
            <ProtectedRoute>
              <CustomerCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:customerId/summary"
          element={
            <ProtectedRoute>
              <CustomerSummary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:customerId"
          element={
            <ProtectedRoute>
              <CustomerSummary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id/edit"
          element={
            <ProtectedRoute>
              <CustomerEdit />
            </ProtectedRoute>
          }
        />

        {/* Protected Invoicing Routes */}
        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <CreateInvoice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/create"
          element={
            <ProtectedRoute>
              <CreateInvoice />
            </ProtectedRoute>
          }
        />

        {/* Protected Payment Routes */}
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <CreatePayment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments/create"
          element={
            <ProtectedRoute>
              <CreatePayment />
            </ProtectedRoute>
          }
        />

        {/* Protected User Management */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UserList />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
