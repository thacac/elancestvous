import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import BackToTop from "@/components/ui/back-to-top";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ÉlanC’estVous | Coaching & Formation",
  description:
    "Coaching professionnel, formation et accompagnement au changement.",
  metadataBase: new URL("https://elancestvous.fr"),
};

export const viewport: Viewport = {
  themeColor: "#29b5ad",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-theme="elancestvous">
      <body className={inter.className + " bg-white text-brand-dark"}>
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
        <BackToTop />
        <Toaster />
      </body>
    </html>
  );
}
