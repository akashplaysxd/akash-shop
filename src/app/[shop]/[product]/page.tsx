import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductPageClient from "./ProductPageClient";

export const dynamic = "force-dynamic";

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ shop: string; product: string }> 
}) {
  const { shop: shopSlug, product: productId } = await params;

  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      shop: true,
    },
  });

  if (!product || product.shop.slug !== shopSlug) {
    notFound();
  }

  // Serialize dates to strings
  const serializedProduct = {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    shop: {
      ...product.shop,
      createdAt: product.shop.createdAt.toISOString(),
      updatedAt: product.shop.updatedAt.toISOString(),
    },
  };

  return <ProductPageClient product={serializedProduct} />;
}
