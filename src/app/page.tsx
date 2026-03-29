"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Store, Plus, Search, User, LogIn, LogOut,
  Package, DollarSign, TrendingUp, Bell, Settings, X, Upload,
  Eye, Download, Trash2, Edit, ExternalLink, Menu, Home, Users
} from "lucide-react";
import { toast, Toaster } from "sonner";

// Types
interface UserType {
  userId: string;
  email: string;
  role: string;
}

interface Shop {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  userId: string;
  createdAt: string;
  _count?: { products: number };
}

interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  thumbnailUrl?: string;
  fileUrl?: string;
  shopId: string;
  shop?: Shop;
  createdAt: string;
}

interface Order {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  product: Product;
}

interface Stats {
  users: number;
  shops: number;
  products: number;
  orders: number;
  revenue: number;
  unreadNotifications: number;
}

export default function AshopPage() {
  // Auth
  const [user, setUser] = useState<UserType | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  // View
  const [view, setView] = useState<"home" | "shops" | "products" | "orders" | "admin" | "myshop">("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [myShop, setMyShop] = useState<Shop | null>(null);
  const [myProducts, setMyProducts] = useState<Product[]>([]);

  // Modals
  const [showCreateShop, setShowCreateShop] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showProduct, setShowProduct] = useState<Product | null>(null);

  // Forms
  const [shopName, setShopName] = useState("");
  const [shopDesc, setShopDesc] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productFile, setProductFile] = useState("");
  const [productThumb, setProductThumb] = useState("");

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Define functions first
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        fetchMyShop(data.user.userId);
        fetchOrders();
        if (data.user.role === "admin") {
          fetchStats();
        }
      }
    } catch {
      // Not logged in
    }
  };

  const fetchShops = async () => {
    try {
      const res = await fetch("/api/shop");
      const data = await res.json();
      setShops(data);
    } catch {
      // Error
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch {
      // Error
    }
  };

  const fetchMyShop = async (userId: string) => {
    try {
      const res = await fetch(`/api/shop?userId=${userId}`);
      const data = await res.json();
      if (data.length > 0) {
        setMyShop(data[0]);
        fetchMyProducts(data[0].id);
      }
    } catch {
      // Error
    }
  };

  const fetchMyProducts = async (shopId: string) => {
    try {
      const res = await fetch(`/api/products?shopId=${shopId}`);
      const data = await res.json();
      setMyProducts(data);
    } catch {
      // Error
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch {
      // Error
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      setStats(data);
    } catch {
      // Error
    }
  };

  const handleAuth = async () => {
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

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
      checkAuth();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMyShop(null);
    setMyProducts([]);
    setOrders([]);
    setStats(null);
    toast.success("Logged out");
  };

  const createShop = async () => {
    if (!shopName.trim()) {
      toast.error("Shop name required");
      return;
    }

    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: shopName, description: shopDesc }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setMyShop(data);
      setShowCreateShop(false);
      setShopName("");
      setShopDesc("");
      toast.success("Shop created!");
      fetchShops();
    } catch {
      toast.error("Failed to create shop");
    }
  };

  const createProduct = async () => {
    if (!productTitle.trim() || !productPrice) {
      toast.error("Title and price required");
      return;
    }

    if (!myShop) {
      toast.error("Create a shop first");
      return;
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: myShop.id,
          title: productTitle,
          description: productDesc,
          price: productPrice,
          fileUrl: productFile,
          thumbnailUrl: productThumb,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      setShowCreateProduct(false);
      setProductTitle("");
      setProductDesc("");
      setProductPrice("");
      setProductFile("");
      setProductThumb("");
      toast.success("Product created!");
      fetchMyProducts(myShop.id);
      fetchProducts();
    } catch {
      toast.error("Failed to create product");
    }
  };

  const buyProduct = async (productId: string) => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      toast.success("Purchase successful! Check your orders.");
      fetchOrders();
      setShowProduct(null);
    } catch {
      toast.error("Failed to purchase");
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Product deleted");
        if (myShop) fetchMyProducts(myShop.id);
        fetchProducts();
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isPurchased = (productId: string) => {
    return orders.some((o) => o.product.id === productId);
  };

  // Run on mount
  useEffect(() => {
    void checkAuth();
    void fetchShops();
    void fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              Ashop
            </h1>
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
          <button onClick={() => { setView("shops"); setSidebarOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${view === "shops" ? "bg-green-500/20 text-green-400" : "hover:bg-[var(--background)]"}`}>
            <Store className="w-5 h-5" /> Shops
          </button>
          <button onClick={() => { setView("products"); setSidebarOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${view === "products" ? "bg-green-500/20 text-green-400" : "hover:bg-[var(--background)]"}`}>
            <Package className="w-5 h-5" /> Products
          </button>

          {user && (
            <>
              <div className="border-t border-[var(--border)] my-4" />
              <button onClick={() => { setView("myshop"); setSidebarOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${view === "myshop" ? "bg-green-500/20 text-green-400" : "hover:bg-[var(--background)]"}`}>
                <Store className="w-5 h-5" /> My Shop
              </button>
              <button onClick={() => { setView("orders"); setSidebarOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${view === "orders" ? "bg-green-500/20 text-green-400" : "hover:bg-[var(--background)]"}`}>
                <ShoppingCart className="w-5 h-5" /> My Orders ({orders.length})
              </button>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <div className="border-t border-[var(--border)] my-4" />
              <button onClick={() => { setView("admin"); setSidebarOpen(false); }} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${view === "admin" ? "bg-green-500/20 text-green-400" : "hover:bg-[var(--background)]"}`}>
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
                  Sell Digital Products
                </span>
              </h1>
              <p className="text-xl text-gray-400 mb-8">The simplest way to sell files, templates, and digital goods</p>
              {!user ? (
                <button onClick={() => setShowAuth(true)} className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold text-lg hover:opacity-90">
                  Get Started Free
                </button>
              ) : !myShop ? (
                <button onClick={() => setShowCreateShop(true)} className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold text-lg hover:opacity-90">
                  Create Your Shop
                </button>
              ) : (
                <button onClick={() => setView("myshop")} className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold text-lg hover:opacity-90">
                  Go to My Shop
                </button>
              )}
            </motion.div>

            <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.slice(0, 8).map((product, index) => (
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
                      <Package className="w-12 h-12 text-green-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{product.title}</h3>
                    <p className="text-sm text-gray-400 truncate">{product.shop?.name}</p>
                    <p className="text-lg font-bold text-green-400 mt-2">${product.price.toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Shops View */}
        {view === "shops" && (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">All Shops</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop, index) => (
                <motion.div
                  key={shop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 hover:border-green-500/50 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      {shop.logoUrl ? (
                        <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Store className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{shop.name}</h3>
                      <p className="text-sm text-gray-400">{shop._count?.products || 0} products</p>
                    </div>
                  </div>
                  {shop.description && <p className="text-sm text-gray-400">{shop.description}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Products View */}
        {view === "products" && (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">All Products</h2>
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
                      <Package className="w-12 h-12 text-green-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{product.title}</h3>
                    <p className="text-sm text-gray-400 truncate">{product.shop?.name}</p>
                    <p className="text-lg font-bold text-green-400 mt-2">${product.price.toFixed(2)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* My Shop View */}
        {view === "myshop" && user && (
          <div className="max-w-7xl mx-auto">
            {!myShop ? (
              <div className="text-center py-20">
                <Store className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-2xl font-bold mb-4">You don't have a shop yet</h2>
                <button onClick={() => setShowCreateShop(true)} className="px-6 py-3 rounded-xl bg-green-500 text-black font-semibold hover:bg-green-400">
                  Create Shop
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{myShop.name}</h2>
                    <p className="text-gray-400">{myShop.description || "No description"}</p>
                  </div>
                  <button onClick={() => setShowCreateProduct(true)} className="px-4 py-2 rounded-lg bg-green-500 text-black font-medium flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {myProducts.map((product) => (
                    <div key={product.id} className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                      <div className="aspect-video bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                        {product.thumbnailUrl ? (
                          <img src={product.thumbnailUrl} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-12 h-12 text-green-400" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold truncate">{product.title}</h3>
                        <p className="text-lg font-bold text-green-400 mt-2">${product.price.toFixed(2)}</p>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => deleteProduct(product.id)} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Orders View */}
        {view === "orders" && user && (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">My Orders</h2>
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Package className="w-10 h-10 text-green-400" />
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
                <Users className="w-8 h-8 text-green-400 mb-2" />
                <p className="text-2xl font-bold">{stats.users}</p>
                <p className="text-sm text-gray-400">Users</p>
              </div>
              <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
                <Store className="w-8 h-8 text-green-400 mb-2" />
                <p className="text-2xl font-bold">{stats.shops}</p>
                <p className="text-sm text-gray-400">Shops</p>
              </div>
              <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
                <Package className="w-8 h-8 text-green-400 mb-2" />
                <p className="text-2xl font-bold">{stats.products}</p>
                <p className="text-sm text-gray-400">Products</p>
              </div>
              <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
                <DollarSign className="w-8 h-8 text-green-400 mb-2" />
                <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>
                <p className="text-sm text-gray-400">Revenue</p>
              </div>
            </div>
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
                <button onClick={handleAuth} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-semibold">
                  {authMode === "login" ? "Login" : "Create Account"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Shop Modal */}
      <AnimatePresence>
        {showCreateShop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateShop(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Create Shop</h3>
              <input type="text" placeholder="Shop name" value={shopName} onChange={(e) => setShopName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none mb-4" />
              <textarea placeholder="Description (optional)" value={shopDesc} onChange={(e) => setShopDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none mb-4 h-24 resize-none" />
              <div className="flex gap-2">
                <button onClick={() => setShowCreateShop(false)} className="flex-1 py-3 rounded-xl border border-[var(--border)] hover:bg-[var(--background)]">Cancel</button>
                <button onClick={createShop} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-semibold">Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Product Modal */}
      <AnimatePresence>
        {showCreateProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateProduct(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Add Product</h3>
              <input type="text" placeholder="Title" value={productTitle} onChange={(e) => setProductTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none mb-4" />
              <textarea placeholder="Description (optional)" value={productDesc} onChange={(e) => setProductDesc(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none mb-4 h-24 resize-none" />
              <input type="number" step="0.01" placeholder="Price ($)" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none mb-4" />
              <input type="text" placeholder="Thumbnail URL (optional)" value={productThumb} onChange={(e) => setProductThumb(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none mb-4" />
              <input type="text" placeholder="File URL (optional)" value={productFile} onChange={(e) => setProductFile(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-green-500 focus:outline-none mb-4" />
              <div className="flex gap-2">
                <button onClick={() => setShowCreateProduct(false)} className="flex-1 py-3 rounded-xl border border-[var(--border)] hover:bg-[var(--background)]">Cancel</button>
                <button onClick={createProduct} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-semibold">Create</button>
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
                  <Package className="w-16 h-16 text-green-400" />
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{showProduct.title}</h3>
                <p className="text-gray-400 mb-4">{showProduct.description || "No description"}</p>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-2xl font-bold text-green-400">${showProduct.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">by {showProduct.shop?.name}</p>
                </div>
                {isPurchased(showProduct.id) ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <Download className="w-5 h-5" />
                    {showProduct.fileUrl ? (
                      <a href={showProduct.fileUrl} target="_blank" rel="noopener noreferrer" className="font-medium">Download</a>
                    ) : (
                      <span>Purchased - No file</span>
                    )}
                  </div>
                ) : (
                  <button onClick={() => buyProduct(showProduct.id)} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-semibold flex items-center justify-center gap-2">
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
