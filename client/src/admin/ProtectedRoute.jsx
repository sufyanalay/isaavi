import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("il_token");
  return token ? children : <Navigate to="/sialkot112200/login" replace />;
}