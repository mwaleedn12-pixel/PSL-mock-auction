import type { Metadata } from "next";
import "./globals.css";
import { AuctionProvider } from "@/context/AuctionContext";
import { Navbar } from "@/components/Navbar";

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
    <html lang="en" className="light">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
        <AuctionProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 shadow-inner">
            <p className="font-bold text-slate-700">HBL PSL 12 Live Mock Auction Arena</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live Real-Time Multi-Device Virtual Player Auction &amp; Franchise Squad Management
            </p>
          </footer>
        </AuctionProvider>
      </body>
    </html>
  );
}
