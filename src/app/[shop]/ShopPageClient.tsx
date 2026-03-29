"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Store, Package, ShoppingCart, Share2, Copy, ArrowLeft } from "lucide-react";
import { toast, Toaster } from "sonner";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  thumbnailUrl: string | null;
  fileUrl: string | null;
  createdAt: string;
}

interface Shop {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  products: Product[];
}

export default function ShopPageClient({ shop }: { shop: Shop }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const shareShop = () => {
    const url = `${window.location.origin}/${shop.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Shop link copied!");
  };

  const shareProduct = (product: Product) => {
    const url = `${window.location.origin}/${shop.slug}/${product.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Product link copied!");
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Toaster position="bottom-right" />

      {/* Header */}
      <header className="bg-[var(--card)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                {shop.logoUrl ? (
                  <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <Store className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{shop.name}</h1>
                <p className="text-gray-400">{shop.products.length} products</p>
              </div>
            </div>
            <button onClick={shareShop} className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 flex items-center gap-2 hover:bg-green-500/30">
              <Share2 className="w-4 h-4" /> Share Shop
            </button>
          </div>
          
          {shop.description && (
            <p className="text-gray-400 mt-4">{shop.description}</p>
          )}
        </div>
      </header>

      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-6">Products</h2>
        
        {shop.products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400">No products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shop.products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden cursor-pointer hover:border-green-500/50 transition-colors"
              >
                <div 
                  className="aspect-video bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center"
                  onClick={() => setSelectedProduct(product)}
                >
                  {product.thumbnailUrl ? (
                    <img src={product.thumbnailUrl} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-12 h-12 text-green-400" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{product.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-lg font-bold text-green-400">${product.price.toFixed(2)}</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); shareProduct(product); }}
                      className="p-2 rounded-lg hover:bg-[var(--background)]"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-[var(--card)] rounded-2xl border border-[var(--border)] w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              {selectedProduct.thumbnailUrl ? (
                <img src={selectedProduct.thumbnailUrl} alt={selectedProduct.title} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-16 h-16 text-green-400" />
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{selectedProduct.title}</h3>
              <p className="text-gray-400 mb-4">{selectedProduct.description || "No description"}</p>
              <p className="text-2xl font-bold text-green-400 mb-4">${selectedProduct.price.toFixed(2)}</p>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => shareProduct(selectedProduct)}
                  className="flex-1 py-3 rounded-xl border border-[var(--border)] font-semibold flex items-center justify-center gap-2 hover:bg-[var(--background)]"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <Link 
                  href={`/${shop.slug}/${selectedProduct.id}`}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-black font-semibold flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" /> Buy Now
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
