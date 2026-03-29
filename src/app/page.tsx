"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Code, Plus, Search, User, LogIn, LogOut,
  Package, DollarSign, Briefcase, Settings, X, Download,
  Trash2, Menu, Home, FileCode, Users, Mail, Clock
} from "lucide-react";
import { toast, Toaster } from "sonner";

// Types
interface UserType {
  userId: string;
  email: string;
  role: string;
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  thumbnailUrl: string | null;
  fileUrl: string | null;
  featured: boolean;
  createdAt: string;
}

interface Order {
  id: string;
  amount: number;
  status: string;
  email: string;
  createdAt: string;
  product: Product;
}

interface HireRequest {
  id: string;
  name: string;
  email: string;
  projectName: string;
  description: string;
  budget: number;
  timeline: string | null;
  status: string;
  createdAt: string;
}

interface Stats {
  products: number;
  orders: number;
  hireRequests: number;
  revenue: number;
  pendingHireRequests: HireRequest[];
  recentOrders: Order[];
}

export default function AshopPage() {
  // Auth
  const [user, setUser] = useState<UserType | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  // View
  const [view, setView] = useState<"home" | "products" | "hire" | "orders" | "admin">("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  // Modals
  const [showProduct, setShowProduct] = useState<Product | null>(null);
  const [showHire, setShowHire] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Forms
  const [productTitle, setProductTitle] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("source-code");
  const [productFile, setProductFile] = useState("");
  const [productThumb, setProductThumb] = useState("");
  const [productFeatured, setProductFeatured] = useState(false);

  // Hire form
  const [hireName, setHireName] = useState("");
  const [hireEmail, setHireEmail] = useState("");
  const [hireProject, setHireProject] = useState("");
  const [hireDesc, setHireDesc] = useState("");
  const [hireBudget, setHireBudget] = useState("");
  const [hireTimeline, setHireTimeline] = useState("");

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void checkAuth();
    void fetchProducts();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        if (data.user.role === "admin") {
          void fetchStats();
        }
        void fetchOrders();
      }
    } catch {
      // Not logged in
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      if (data && !data.error) {
        setStats({
          products: data.products || 0,
          orders: data.orders || 0,
          hireRequests: data.hireRequests || 0,
          revenue: data.revenue || 0,
          pendingHireRequests: Array.isArray(data.pendingHireRequests) ? data.pendingHireRequests : [],
          recentOrders: Array.isArray(data.recentOrders) ? data.recentOrders : [],
        });
      }
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
      void checkAuth();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setStats(null);
    setOrders([]);
    toast.success("Logged out");
  };

  const createProduct = async () => {
    if (!productTitle.trim() || !productPrice) {
      toast.error("Title and price required");
      return;
    }

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: productTitle,
          description: productDesc,
          price: productPrice,
          category: productCategory,
          fileUrl: productFile,
          thumbnailUrl: productThumb,
          featured: productFeatured,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setShowAddProduct(false);
      setProductTitle("");
      setProductDesc("");
      setProductPrice("");
      setProductFile("");
      setProductThumb("");
      setProductFeatured(false);
      toast.success("Product created!");
      void fetchProducts();
    } catch {
      toast.error("Failed to create product");
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Product deleted");
        void fetchProducts();
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const buyProduct = async (product: Product) => {
    const buyerEmail = prompt("Enter your email for delivery:");
    if (!buyerEmail) return;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, email: buyerEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success("Purchase successful! Check your email for download link.");
      setShowProduct(null);
      void fetchOrders();
    } catch {
      toast.error("Failed to purchase");
    }
  };

  const submitHireRequest = async () => {
    if (!hireName || !hireEmail || !hireProject || !hireDesc || !hireBudget) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/hire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: hireName,
          email: hireEmail,
          projectName: hireProject,
          description: hireDesc,
          budget: hireBudget,
          timeline: hireTimeline,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success("Request submitted! I'll get back to you soon.");
      setShowHire(false);
      setHireName("");
      setHireEmail("");
      setHireProject("");
      setHireDesc("");
      setHireBudget("");
      setHireTimeline("");
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const updateHireStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/hire", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        toast.success(`Request ${status}`);
        void fetchStats();
      }
    } catch {
      toast.error("Failed to update");
    }
  };

  const filteredProducts = Array.isArray(products) ? products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const isPurchased = (productId: string) => {
    return Array.isArray(orders) && orders.some((o) => o.product?.id === productId);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Toaster position="bottom-right" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[var(--card)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              AkashShop
            </h1>
            <span className="hidden sm:inline text-sm text-gray-400">Source Code & Hire Me</span>
          </div>

          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-400 hidden sm:block">{user.email}</span>
                {user.role === "admin" && (
                  <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">Admin</span>
                )}
                <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-[var(--background)]">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)} className="px-4 py-2 rounded-lg bg-green-500 text-black font-medium hover:bg-green-400">
                <LogIn className="w-4 h-4 inline mr-2" />Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-[var(--card)] border-r border-[var(--border)] z-30 transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <nav className="p-4 space-y-2">
          <button onClick={() => { setView("home"); setSidebarOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${view === "home" ? "bg-green-500/20 text-green-400" : "hover:bg-[var(--background)]"}`}>
            <Home className="w-5 h-5" /> Home
          </button>
          <button onClick={() => { setView("products"); setSidebarOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${view === "products" ? "bg-green-500/20 text-green-400" : "hover:bg-[var(--background)]"}`}>
            <Package className="w-5 h-5" /> Products ({products.length})
          </button>
          <button onClick={() => { setShowHire(true); setSidebarOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 hover:bg-[var(--background)] text-green-400">
            <Briefcase className="w-5 h-5" /> Hire Me
          </button>

          {user && (
            <button onClick={() => { setView("orders"); setSidebarOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${view === "orders" ? "bg-green-500/20 text-green-400" : "hover:bg-[var(--background)]"}`}>
              <ShoppingCart className="w-5 h-5" /> My Orders ({orders.length})
            </button>
          )}

          {user?.role === "admin" && (
            <>
              <div className="border-t border-[var(--border)] my-4" />
              <button onClick={() => { setView("admin"); setSidebarOpen(false); void fetchStats(); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${view === "admin" ? "bg-green-500/20 text-green-400" : "hover:bg-[var(--background)]"}`}>
                <Settings className="w-5 h-5" /> Admin Panel
              </button>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 p-6">
        {/* Home View */}
        {view === "home" && (
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
              <h1 className="text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Premium Source Code
                </span>
              </h1>
              <p className="text-xl text-gray-400 mb-4">Buy production-ready code or hire me for your project</p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => setView("products")} className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold hover:opacity-90">
                  Browse Code
                </button>
                <button onClick={() => setShowHire(true)} className="px-6 py-3 rounded-xl border border-green-500 text-green-400 font-bold hover:bg-green-500/10">
                  Hire Me
                </button>
              </div>
            </motion.div>

            <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.filter(p => p.featured).slice(0, 4).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setShowProduct(product)}
                  className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden cursor-pointer hover:border-green-500/50 transition-colors"
                >
                  <div className="aspect-video bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    {product.thumbnailUrl ? (
                      <img src={product.thumbnailUrl} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <FileCode className="w-12 h-12 text-green-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">{product.category}</span>
                    <h3 className="font-semibold truncate mt-2">{product.title}</h3>
                    <p className="text-lg font-bold text-green-400 mt-2">${product.price.toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Products View */}
        {view === "products" && (
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">All Products</h2>
              {user?.role === "admin" && (
                <button onClick={() => setShowAddProduct(true)} className="px-4 py-2 rounded-lg bg-green-500 text-black font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setShowProduct(product)}
                  className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden cursor-pointer hover:border-green-500/50 transition-colors"
                >
                  <div className="aspect-video bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    {product.thumbnailUrl ? (
                      <img src={product.thumbnailUrl} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <FileCode className="w-12 h-12 text-green-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">{product.category}</span>
                    <h3 className="font-semibold truncate mt-2">{product.title}</h3>
                    <p className="text-lg font-bold text-green-400 mt-2">${product.price.toFixed(2)}</p>
                    {user?.role === "admin" && (
                      <button onClick={(e) => { e.stopPropagation(); deleteProduct(product.id); }} className="mt-2 p-2 rounded bg-red-500/20 text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Orders View */}
        {view === "orders" && user && (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">My Purchases</h2>
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">No purchases yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileCode className="w-10 h-10 text-green-400" />
                      <div>
                        <h3 className="font-semibold">{order.product.title}</h3>
                        <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">${order.amount.toFixed(2)}</p>
                      {order.product.fileUrl && (
                        <a href={order.product.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-green-400 flex items-center gap-1">
                          <Download className="w-4 h-4" /> Download
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admin View */}
        {view === "admin" && user?.role === "admin" && stats && (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
                <Package className="w-8 h-8 text-green-400 mb-2" />
                <p className="text-2xl font-bold">{stats.products}</p>
                <p className="text-sm text-gray-400">Products</p>
              </div>
              <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
                <ShoppingCart className="w-8 h-8 text-green-400 mb-2" />
                <p className="text-2xl font-bold">{stats.orders}</p>
                <p className="text-sm text-gray-400">Orders</p>
              </div>
              <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
                <DollarSign className="w-8 h-8 text-green-400 mb-2" />
                <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>
                <p className="text-sm text-gray-400">Revenue</p>
              </div>
              <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
                <Briefcase className="w-8 h-8 text-yellow-400 mb-2" />
                <p className="text-2xl font-bold">{stats.hireRequests}</p>
                <p className="text-sm text-gray-400">Pending Hires</p>
              </div>
            </div>

            {/* Hire Requests */}
            {stats.pendingHireRequests.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Pending Hire Requests</h3>
                <div className="space-y-4">
                  {stats.pendingHireRequests.map((req) => (
                    <div key={req.id} className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{req.projectName}</h4>
                          <p className="text-sm text-gray-400">From: {req.name} ({req.email})</p>
                          <p className="text-sm text-gray-400">Budget: ${req.budget}</p>
                          {req.timeline && <p className="text-sm text-gray-400">Timeline: {req.timeline}</p>}
                          <p className="text-sm mt-2">{req.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => updateHireStatus(req.id, "accepted")} className="px-3 py-1 rounded bg-green-500/20 text-green-400 text-sm">Accept</button>
                          <button onClick={() => updateHireStatus(req.id, "rejected")} className="px-3 py-1 rounded bg-red-500/20 text-red-400 text-sm">Reject</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Orders */}
            {stats.recentOrders.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
                <div className="space-y-2">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-3 flex items-center justify-between">
                      <div>
                        <span className="font-medium">{order.product.title}</span>
                        <span className="text-sm text-gray-400 ml-2">({order.email})</span>
                      </div>
                      <span className="text-green-400 font-bold">${order.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAuth(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 w-full max-w-sm mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">{authMode === "login" ? "Login" : "Register"}</h3>
                <button onClick={() => setShowAuth(false)} className="p-1 rounded hover:bg-[var(--background)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                <button onClick={() => setAuthMode("login")} className={`flex-1 py-2 rounded-lg ${authMode === "login" ? "bg-green-500/20 text-green-400" : "hover:bg-[var(--background)]"}`}>Login</button>
                <button onClick={() => setAuthMode("register")} className={`flex-1 py-2 rounded-lg ${authMode === "register" ? "bg-green-500/20 text-green-400" : "hover:bg-[var(--background)]"}`}>Register</button>
              </div>

              <div className="space-y-4">
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none" />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none" />
                <button onClick={handleAuth} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-semibold">
                  {loading ? "Please wait..." : authMode === "login" ? "Login" : "Create Account"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hire Me Modal */}
      <AnimatePresence>
        {showHire && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowHire(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Hire Me</h3>
                <button onClick={() => setShowHire(false)} className="p-1 rounded hover:bg-[var(--background)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-400 mb-4">Looking for a developer? Tell me about your project and I&apos;ll get back to you!</p>

              <div className="space-y-4">
                <input type="text" placeholder="Your Name *" value={hireName} onChange={(e) => setHireName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none" />
                <input type="email" placeholder="Your Email *" value={hireEmail} onChange={(e) => setHireEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none" />
                <input type="text" placeholder="Project Name *" value={hireProject} onChange={(e) => setHireProject(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none" />
                <textarea placeholder="Project Description *" value={hireDesc} onChange={(e) => setHireDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none h-24 resize-none" />
                <input type="number" placeholder="Budget ($) *" value={hireBudget} onChange={(e) => setHireBudget(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none" />
                <input type="text" placeholder="Timeline (e.g., 2 weeks)" value={hireTimeline} onChange={(e) => setHireTimeline(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none" />
                <button onClick={submitHireRequest} disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-semibold">
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddProduct(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Add Product</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Title *" value={productTitle} onChange={(e) => setProductTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none" />
                <textarea placeholder="Description" value={productDesc} onChange={(e) => setProductDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none h-24 resize-none" />
                <input type="number" step="0.01" placeholder="Price ($) *" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none" />
                <select value={productCategory} onChange={(e) => setProductCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none">
                  <option value="source-code">Source Code</option>
                  <option value="template">Template</option>
                  <option value="other">Other</option>
                </select>
                <input type="text" placeholder="Thumbnail URL" value={productThumb} onChange={(e) => setProductThumb(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none" />
                <input type="text" placeholder="File URL (download link)" value={productFile} onChange={(e) => setProductFile(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none" />
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={productFeatured} onChange={(e) => setProductFeatured(e.target.checked)} className="rounded" />
                  <span className="text-sm">Featured product</span>
                </label>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddProduct(false)} className="flex-1 py-3 rounded-xl border border-[var(--border)] hover:bg-[var(--background)]">Cancel</button>
                  <button onClick={createProduct} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-semibold">Create</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {showProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowProduct(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] w-full max-w-lg mx-4 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                {showProduct.thumbnailUrl ? (
                  <img src={showProduct.thumbnailUrl} alt={showProduct.title} className="w-full h-full object-cover" />
                ) : (
                  <FileCode className="w-16 h-16 text-green-400" />
                )}
              </div>
              <div className="p-6">
                <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">{showProduct.category}</span>
                <h3 className="text-xl font-bold mt-2 mb-2">{showProduct.title}</h3>
                <p className="text-gray-400 mb-4">{showProduct.description || "No description"}</p>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-2xl font-bold text-green-400">${showProduct.price.toFixed(2)}</p>
                </div>
                {isPurchased(showProduct.id) ? (
                  <div className="space-y-2">
                    <p className="text-green-400 text-center">You already own this product</p>
                    {showProduct.fileUrl && (
                      <a href={showProduct.fileUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 rounded-xl bg-green-500 text-black font-semibold flex items-center justify-center gap-2">
                        <Download className="w-5 h-5" /> Download
                      </a>
                    )}
                  </div>
                ) : (
                  <button onClick={() => buyProduct(showProduct)} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-semibold flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" /> Buy Now
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
