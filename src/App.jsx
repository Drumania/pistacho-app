import { Routes, Route } from "react-router-dom";
import Layout from "@/layout/Layout";
import Home from "@/pages/Home";
import GroupDashboard from "@/pages/Dashboards";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/g/:groupId" element={<GroupDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
