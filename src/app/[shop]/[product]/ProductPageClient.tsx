"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, ShoppingCart, Share2, Copy, ArrowLeft, Download, Lock, LogIn } from "lucide-react";
import { toast, Toaster } from "sonner";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  thumbnailUrl: string | null;
  fileUrl: string | null;
  shopId: string;
  shop: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
  };
}

interface User {
  userId: string;
  email: string;
  role: string;
}

export default function ProductPageClient({ product }: { product: Product }) {
  const [user, setUser] = useState<User | null>(null);
  const [purchased, setPurchased] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        checkPurchase(data.user.userId);
      }
    } catch {
      // Not logged in
    }
  };

  const checkPurchase = async (userId: string) => {
    try {
      const res = await fetch("/api/orders");
      const orders = await res.json();
      const hasPurchased = orders.some((o: { product: { id: string } }) => o.product.id === product.id);
      setPurchased(hasPurchased);
    } catch {
      // Error
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setUser(data.user);
      setShowAuth(false);
      setEmail("");
      setPassword("");
      toast.success(authMode === "login" ? "Welcome back!" : "Account created!");
      checkPurchase(data.user.userId);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const buyProduct = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setPurchased(true);
      toast.success("Purchase successful!");
    } catch {
      toast.error("Failed to purchase");
    } finally {
      setLoading(false);
    }
  };

  const shareProduct = () => {
    const url = `${window.location.origin}/${product.shop.slug}/${product.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Product link copied!");
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Toaster position="bottom-right" />

      {/* Header */}
      <header className="bg-[var(--card)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href={`/${product.shop.slug}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to {product.shop.name}
          </Link>
        </div>
      </header>

      {/* Product Details */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-square bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center border border-[var(--border)]"
          >
            {product.thumbnailUrl ? (
              <img src={product.thumbnailUrl} alt={product.title} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <Package className="w-24 h-24 text-green-400" />
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                {product.shop.logoUrl ? (
                  <img src={product.shop.logoUrl} alt={product.shop.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-white font-bold text-sm">{product.shop.name[0]}</span>
                )}
              </div>
              <span className="text-gray-400">{product.shop.name}</span>
            </div>

            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
            
            <p className="text-gray-400 mb-6 flex-1">
              {product.description || "No description available for this product."}
            </p>

            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 mb-6">
              <p className="text-4xl font-bold text-green-400 mb-4">${product.price.toFixed(2)}</p>
              
              {purchased ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-400">
                    <Lock className="w-5 h-5" />
                    <span>You own this product</span>
                  </div>
                  {product.fileUrl && (
                    <a
                      href={product.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl bg-green-500 text-black font-semibold flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" /> Download
                    </a>
                  )}
                </div>
              ) : (
                <button
                  onClick={buyProduct}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {loading ? "Processing..." : "Buy Now"}
                </button>
              )}
            </div>

            <button
              onClick={shareProduct}
              className="w-full py-3 rounded-xl border border-[var(--border)] font-semibold flex items-center justify-center gap-2 hover:bg-[var(--card)]"
            >
              <Share2 className="w-4 h-4" /> Share Product
            </button>
          </motion.div>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuth && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAuth(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">
              {authMode === "login" ? "Login to Purchase" : "Create Account"}
            </h3>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-2 rounded-lg ${authMode === "login" ? "bg-green-500/20 text-green-400" : "hover:bg-[var(--background)]"}`}
              >
                Login
              </button>
              <button
                onClick={() => setAuthMode("register")}
                className={`flex-1 py-2 rounded-lg ${authMode === "register" ? "bg-green-500/20 text-green-400" : "hover:bg-[var(--background)]"}`}
              >
                Register
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none"
              />
              <button
                onClick={handleAuth}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-semibold disabled:opacity-50"
              >
                {loading ? "Please wait..." : authMode === "login" ? "Login" : "Create Account"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
