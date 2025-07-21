import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/layout/Layout";
import Landing from "@/pages/Landing";
import LoginPage from "@/pages/LoginPage";
import GroupDashboard from "@/pages/Dashboards";
import SettingsPage from "@/pages/SettingsPage";
import AdminToolsPage from "@/pages/AdminToolsPage";
import NotificationsPage from "./pages/NotificationsPage";
import Resume from "./pages/Resume";
import Bye from "./pages/Bye";

import { useAuth } from "@/firebase/AuthContext";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex vh-100 flex-column justify-content-center align-items-center">
        <img src="/icon-192_v2.png" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        {!user ? (
          <>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/bye" element={<Bye />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <Route element={<Layout />}>
            <Route
              index
              element={<Navigate to={`/g/${user.slug}`} replace />}
            />
            <Route path="/g/:groupId" element={<GroupDashboard />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/admintools" element={<AdminToolsPage />} />
            <Route
              path="*"
              element={
                user?.slug ? (
                  <Navigate to={`/g/${user.slug}`} replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Route>
        )}
      </Routes>
    </>
  );
}

export default App;
