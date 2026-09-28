import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import api from "../api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("il_token", data.token);
      nav("/sialkot112200/products");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-[360px] bg-white border border-line rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Lock size={18} className="text-gold-dark" />
          <h2 className="font-serif text-2xl font-medium m-0">Admin Login</h2>
        </div>
        {error && <div className="bg-red-50 text-red-700 text-sm rounded p-2.5 mb-4">{error}</div>}
        <label className="block mb-3.5">
          <span className="block text-[10px] tracking-[.18em] uppercase font-semibold text-muted mb-1.5">Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-line rounded p-2.5 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" />
        </label>
        <label className="block mb-5">
          <span className="block text-[10px] tracking-[.18em] uppercase font-semibold text-muted mb-1.5">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-line rounded p-2.5 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold" />
        </label>
        <button className="w-full bg-brown text-[#f3ebe0] py-3 text-sm font-semibold rounded hover:bg-ink transition-colors">Login</button>
      </form>
    </div>
  );
}