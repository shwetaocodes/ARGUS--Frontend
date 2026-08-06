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

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}