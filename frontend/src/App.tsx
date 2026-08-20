import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import VendorPage from "./pages/VendorPage";
import ReportPage from "./pages/ReportPage";
import AdminPage from "./pages/AdminPage";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">
          <span className="logo-mark">TT</span>
          <span>
            <span className="logo-trust">Trust</span>
            <span className="logo-trail">Trail</span>
          </span>
        </NavLink>
        <div className="navbar-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            id="nav-dashboard"
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/explore"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            id="nav-explore"
          >
            Explore
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) => `nav-link admin-link ${isActive ? "active" : ""}`}
            id="nav-admin"
          >
            Admin
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <span>TrustTrail</span> · AI-Powered Tourism Scam Risk &amp; Safety Platform ·
      Smart India Hackathon 2026 Prototype
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/explore"     element={<Explore />} />
            <Route path="/vendor/:id"  element={<VendorPage />} />
            <Route path="/report/:vendorId" element={<ReportPage />} />
            <Route path="/admin"       element={<AdminPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
