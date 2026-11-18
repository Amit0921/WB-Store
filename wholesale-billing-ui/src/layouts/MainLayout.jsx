import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function MainLayout({ children, maxWidth = 1240 }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F7F8FC", color: "#171923" }}>
      {/* Sidebar with Mobile Drawer */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div
        className="main-content-wrapper"
        style={{
          marginLeft: 240,
          width: "calc(100% - 240px)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 0.25s ease, width 0.25s ease",
        }}
      >
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main
          style={{
            flex: 1,
            padding: "24px",
            maxWidth,
            width: "100%",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
          className="main-content-body"
        >
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .main-content-wrapper {
            margin-left: 0 !important;
            width: 100% !important;
          }
          .main-content-body {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
