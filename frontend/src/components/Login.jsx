import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Lock, Mail, AlertCircle, LogIn, Palette, Check } from "lucide-react";

const FEATURES = [
  "Print cash memos in one tap",
  "Live paint & hardware stock sync",
  "Track every shopkeeper's sales",
];

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", formData);

      const { token, name, role } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ name, role }));

      // Redirect based on user role
      if (role === "admin") {
        navigate("/sales-archive");
      } else {
        navigate("/create-receipt");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Server error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-slate-950 flex-col justify-between px-14 py-14">
        {/* Paint-mixing color blocks */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div className="pointer-events-none absolute -top-24 -left-16 w-80 h-80 rounded-full bg-amber-400/30 blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 -right-10 w-72 h-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-10 w-96 h-96 rounded-full bg-teal-400/25 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm mb-8">
            <Palette className="w-6 h-6 text-amber-300" />
          </div>
          <h1 className="font-display text-4xl font-extrabold text-white leading-[1.1] tracking-tight max-w-sm">
            Bismillah Paint & Hardware Store
          </h1>
          <p className="mt-4 text-slate-300 text-base max-w-xs leading-relaxed">
            Billing, stock and staff — sorted in seconds, right at the counter.
          </p>
        </div>

        <div className="relative space-y-3">
          {FEATURES.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-400/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-teal-300" strokeWidth={3} />
              </span>
              <span className="text-sm text-slate-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 relative flex items-center justify-center px-4 py-10 sm:p-8 bg-slate-950 lg:bg-slate-50 overflow-hidden">
        {/* Mobile-only decorative backdrop */}
        <div className="lg:hidden pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -left-10 w-56 h-56 rounded-full bg-amber-400/25 blur-3xl" />
          <div className="absolute top-1/4 -right-14 w-56 h-56 rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="absolute -bottom-20 left-6 w-64 h-64 rounded-full bg-teal-400/20 blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          {/* Mobile brand mark */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm mb-3">
              <Palette className="w-6 h-6 text-amber-300" />
            </div>
            <h1 className="font-display text-xl font-bold text-white">
              Bismillah Paint & Hardware Store
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
                Sign in
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Enter your credentials to access billing and stock.
              </p>
            </div>

            {error && (
              <div className="mb-5 bg-red-50 border-l-4 border-red-500 p-3 rounded-md flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="w-[18px] h-[18px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@shop.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-[18px] h-[18px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 shadow-sm shadow-blue-600/20"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> Sign In
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="lg:hidden text-center text-xs text-slate-400 mt-6">
            Paint & hardware billing, sorted in seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
