import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/layout/Layout";
import Landing from "@/pages/Landing";
import LoginPage from "@/pages/LoginPage";
import GroupDashboard from "@/pages/Dashboards";

import SettingsPage from "@/pages/SettingsPage";
import AdminToolsPage from "@/pages/AdminToolsPage";
import { useAuth } from "@/firebase/AuthContext";
import NotificationsPage from "./pages/NotificationsPage";
import Resume from "./pages/Resume";
import Bye from "./pages/Bye";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <Routes>
      {!user ? (
        // si NO hay usuario, solo puede ver AuthPage
        <>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
          <Route path="/bye" element={<Bye />} />
        </>
      ) : (
        // si hay usuario, accede al layout completo
        <Route element={<Layout />}>
          <Route
            path="/"
            element={<Navigate to={`/g/${user.slug}`} replace />}
          />
          <Route path="/g/:groupId" element={<GroupDashboard />} />
          <Route path="/resume" element={<Resume />} />
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
