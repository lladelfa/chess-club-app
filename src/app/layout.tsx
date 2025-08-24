import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chess Club",
  description: "Sharpen your mind, one move at a time.",
  icons: {
    icon: "/favicon.ico",
  },
};

import { MainNav } from "@/components/main-nav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        <div className="flex flex-col min-h-screen">
          <MainNav />
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-gray-900 text-white py-6 px-6 text-center">
            <p>&copy; 2025 Chess Club. All rights reserved.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
