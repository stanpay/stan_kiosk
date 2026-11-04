import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import CenterPage from "./pages/CenterPage";
import StoresPage from "./pages/StoresPage";
import FacilitiesPage from "./pages/FacilitiesPage";
import TourismPage from "./pages/TourismPage";
import TransportPage from "./pages/TransportPage";
import FaqPage from "./pages/FaqPage";
import MapPage from "./pages/MapPage";
import { LanguageProvider } from "./contexts/LanguageContext";

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<CenterPage />} />
            <Route path="stores" element={<StoresPage />} />
            <Route path="facilities" element={<FacilitiesPage />} />
            <Route path="tourism" element={<TourismPage />} />
            <Route path="transport" element={<TransportPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
