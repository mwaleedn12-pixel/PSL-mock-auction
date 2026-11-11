import type { Metadata } from "next";
import "./globals.css";
import { AuctionProvider } from "@/context/AuctionContext";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "PSL 12 Automated Mock Auction Management System",
  description: "Real-time virtual cricket auction platform for PSL 12 franchises with automated bidding, squad validation, document extraction, and analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#060a0c] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
        <AuctionProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
            <p className="font-semibold text-slate-400">PSL 12 Automated Mock Auction Management Platform</p>
            <p className="mt-1">
              Virtual Mock Auction System • Built for Real-Time Bidding, Multi-Franchise Squad Building & Analytics
            </p>
          </footer>
        </AuctionProvider>
      </body>
    </html>
  );
}

