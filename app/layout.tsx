import JsonLd from "@/components/JsonLd";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import BackToTop from "@/components/ui/back-to-top";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.elancestvous.fr"),
  title: "ÉlanC’estVous | Coaching & Formation",
  description: "Coaching professionnel, formation et accompagnement au changement.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-theme="elancestvous">
      <body className={inter.className + " bg-white text-brand-dark"}>
        <JsonLd />
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
        <BackToTop />
        <Toaster />
      </body>
    </html>
  );
}
