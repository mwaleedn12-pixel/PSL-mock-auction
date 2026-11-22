import type { Metadata } from "next";
import "./globals.css";
import { AuctionProvider } from "@/context/AuctionContext";
import { AuctionLayoutShell } from "@/components/AuctionLayoutShell";

export const metadata: Metadata = {
  title: "HBL PSL 12 Live Mock Auction Room",
  description: "Official real-time virtual player auction room for HBL PSL 12 franchises with live bidding, authentic T20 stats, squad composition and interactive trade desk.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuctionProvider>
          <AuctionLayoutShell>{children}</AuctionLayoutShell>
        </AuctionProvider>
      </body>
    </html>
  );
}
