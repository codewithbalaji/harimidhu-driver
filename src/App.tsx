import { BrowserRouter, Routes, Route } from "react-router-dom";
import Map from "./pages/Map";
import Orders from "./pages/Orders";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Orders />} />
      <Route path="/map" element={<Map />} />

      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
