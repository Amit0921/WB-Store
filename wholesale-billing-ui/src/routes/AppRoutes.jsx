import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import CustomerList from "../pages/customers/CustomerList";
import CustomerCreate from "../pages/customers/CustomerCreate";
import CustomerEdit from "../pages/customers/CustomerEdit";
import CustomerSummary from "../pages/customers/CustomerSummary";
import CustomerStatement from "../pages/customers/CustomerStatement";
import ProductList from "../pages/products/ProductList";
import ProductCreate from "../pages/products/ProductCreate";
import InvoiceList from "../pages/invoices/InvoiceList";
import CreateInvoice from "../pages/invoices/CreateInvoice";
import InvoiceDetail from "../pages/invoices/InvoiceDetail";
import RetailBilling from "../pages/billing/RetailBilling";
import PaymentList from "../pages/payments/PaymentList";
import CreatePayment from "../pages/payments/CreatePayment";
import PaymentReceipt from "../pages/payments/PaymentReceipt";
import OutstandingDues from "../pages/reports/OutstandingDues";
import SalesReport from "../pages/reports/SalesReport";
import UserList from "../pages/users/UserList";
import ProtectedRoute from "../components/ProtectedRoute";

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
              <CustomerList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/create"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
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
          path="/customers/:customerId/statement"
          element={
            <ProtectedRoute>
              <CustomerStatement />
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
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <CustomerEdit />
            </ProtectedRoute>
          }
        />

        {/* Protected Product Catalogue Routes */}
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/new"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <ProductCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <ProductCreate />
            </ProtectedRoute>
          }
        />

        {/* Protected Invoicing Routes */}
        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <InvoiceList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/new"
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
        <Route
          path="/invoices/:id"
          element={
            <ProtectedRoute>
              <InvoiceDetail />
            </ProtectedRoute>
          }
        />

        {/* Retail Counter POS Billing */}
        <Route
          path="/billing/retail"
          element={
            <ProtectedRoute>
              <RetailBilling />
            </ProtectedRoute>
          }
        />

        {/* Protected Payment Routes */}
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <PaymentList />
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
        <Route
          path="/payments/:id"
          element={
            <ProtectedRoute>
              <PaymentReceipt />
            </ProtectedRoute>
          }
        />

        {/* Protected Reports & Analytics */}
        <Route
          path="/reports/dues"
          element={
            <ProtectedRoute>
              <OutstandingDues />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/sales"
          element={
            <ProtectedRoute>
              <SalesReport />
            </ProtectedRoute>
          }
        />

        {/* Protected User Management */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
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
