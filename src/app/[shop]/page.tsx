import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ShopPageClient from "./ShopPageClient";

export const dynamic = "force-dynamic";

export default async function ShopPage({ params }: { params: Promise<{ shop: string }> }) {
  const { shop: shopSlug } = await params;

  const shop = await db.shop.findUnique({
    where: { slug: shopSlug },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
      },
      user: { select: { id: true, email: true } },
    },
  });

  if (!shop) {
    notFound();
  }

  // Serialize dates to strings
  const serializedShop = {
    ...shop,
    createdAt: shop.createdAt.toISOString(),
    updatedAt: shop.updatedAt.toISOString(),
    products: shop.products.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
  };

  return <ShopPageClient shop={serializedShop} />;
}
