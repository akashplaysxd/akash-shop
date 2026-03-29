import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ashop - Digital Product Marketplace",
  description: "Buy and sell digital products instantly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
