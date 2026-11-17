import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function MainLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f6fa" }}>
      <Sidebar />
      <div style={{ marginLeft: 210, width: "calc(100% - 210px)", display: "flex", flexDirection: "column" }}>
        <Topbar />
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}