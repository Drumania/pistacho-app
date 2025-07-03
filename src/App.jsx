import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/layout/Layout";
import GroupDashboard from "@/pages/Dashboards";
import LoginPage from "@/pages/LoginPage";
import SettingsPage from "@/pages/SettingsPage";
import AdminToolsPage from "@/pages/AdminToolsPage";
import { useAuth } from "@/firebase/AuthContext";
import NotificationsPage from "./pages/NotificationsPage";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <Routes>
      {!user ? (
        // si NO hay usuario, solo puede ver AuthPage
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        // si hay usuario, accede al layout completo
        <Route element={<Layout />}>
          <Route
            path="/"
            element={<Navigate to={`/g/${user.slug}`} replace />}
          />
          <Route path="/g/:groupId" element={<GroupDashboard />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admintools" element={<AdminToolsPage />} />
          <Route
            path="*"
            element={<Navigate to={`/g/${user.slug}`} replace />}
          />
        </Route>
      )}
    </Routes>
  );
}

export default App;
