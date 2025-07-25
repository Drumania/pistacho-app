import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const Layout = lazy(() => import("@/layout/Layout"));
const Landing = lazy(() => import("@/pages/Landing"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const GroupDashboard = lazy(() => import("@/pages/Dashboards"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const AdminToolsPage = lazy(() => import("@/pages/AdminToolsPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const Resume = lazy(() => import("@/pages/Resume"));
const Bye = lazy(() => import("@/pages/Bye"));

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
    <Suspense fallback={<div className="text-center mt-5">Loading...</div>}>
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
    </Suspense>
  );
}

export default App;
