import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/layout/Layout";
import Home from "@/pages/Home";
import GroupDashboard from "@/pages/Dashboards";
import AuthPage from "@/pages/AuthPage";
import SettingsPage from "@/pages/SettingsPage";
import { useAuth } from "@/firebase/AuthContext";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <Routes>
      {!user ? (
        // si NO hay usuario, solo puede ver AuthPage
        <>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/auth" />} />
        </>
      ) : (
        // si hay usuario, accede al layout completo
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/g/:groupId" element={<GroupDashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      )}
    </Routes>
  );
}

export default App;
