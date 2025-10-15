import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/Header"; 
import Toast from "@/components/Toast"; // <-- Import Toast

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
// ...
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> 
      <body className={inter.className}>
        <AppProvider>
          <Header /> 
          <div className="min-h-[calc(100vh-4rem)]">
             {children}
          </div>
          <Toast /> {/* <-- Render Toast globally */}
        </AppProvider>
      </body>
    </html>
  );
}