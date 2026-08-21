import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import EntityList from "./pages/EntityList";
import EntityProfile from "./pages/EntityProfile";
import MapView from "./pages/MapView";
import Sitreps from "./pages/Sitreps";
import Incidents from "./pages/Incidents";
import Detections from "./pages/Detections";
import ReviewQueue from "./pages/ReviewQueue";
import AuditLog from "./pages/AuditLog";
import HistoricalImport from "./pages/HistoricalImport";

function Shell({ children }) {
  return (
    <div className="ld-shell">
      <Sidebar />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/dashboard" element={<ProtectedRoute><Shell><Dashboard /></Shell></ProtectedRoute>} />
          <Route path="/entities" element={<ProtectedRoute><Shell><EntityList /></Shell></ProtectedRoute>} />
          <Route path="/entities/:id" element={<ProtectedRoute><Shell><EntityProfile /></Shell></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
          <Route path="/sitreps" element={<ProtectedRoute><Shell><Sitreps /></Shell></ProtectedRoute>} />
          <Route path="/incidents" element={<ProtectedRoute><Shell><Incidents /></Shell></ProtectedRoute>} />
          <Route path="/detections" element={<ProtectedRoute><Shell><Detections /></Shell></ProtectedRoute>} />
          <Route path="/historical-import" element={<ProtectedRoute><Shell><HistoricalImport /></Shell></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/review" element={<ProtectedRoute><Shell><ReviewQueue /></Shell></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute><Shell><AuditLog /></Shell></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}