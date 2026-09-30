import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Collection from "./pages/Collection";
import GiftPacks from "./pages/GiftPacks";
import CustomOrder from "./pages/CustomOrder";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ThankYou from "./pages/ThankYou";
import ProductDetail from "./pages/ProductDetail";
import AdminLogin from "./admin/AdminLogin";
import AdminLayout from "./admin/AdminLayout";
import AdminProducts from "./admin/AdminProducts";
import AdminOffers from "./admin/AdminOffers";
import AdminPromos from "./admin/AdminPromos";
import AdminOrders from "./admin/AdminOrders";
import AdminSettings from "./admin/AdminSettings";
import ProtectedRoute from "./admin/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/for-him" element={<Collection section="him" />} />
        <Route path="/for-her" element={<Collection section="her" />} />
        <Route path="/gift-packs" element={<GiftPacks />} />
        <Route path="/custom-order" element={<CustomOrder />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/thank-you/:token" element={<ThankYou />} />
      </Route>

      <Route path="/sialkot112200/login" element={<AdminLogin />} />
      <Route path="/sialkot112200" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="offers" element={<AdminOffers />} />
        <Route path="promos" element={<AdminPromos />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}