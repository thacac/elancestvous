import { Kalam, Nunito, Nunito_Sans } from "next/font/google";

// Polices de la charte inspirée des slides de formation, auto-hébergées par
// next/font (aucune requête vers Google au chargement, pas de décalage de
// mise en page) et branchées sur les tokens --font-* de app/globals.css.

// Titres : arrondie et chaleureuse, comme les bandeaux des slides.
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-nunito",
});

// Texte courant : même famille, lisible en paragraphes longs (blog).
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito-sans",
});

// Annotations manuscrites (sous-titres de bandeau, petites notes) : décorative,
// donc pas préchargée pour ne pas retarder le rendu du contenu.
const kalam = Kalam({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
  variable: "--font-kalam",
});

export const fontVariables = [nunito.variable, nunitoSans.variable, kalam.variable].join(" ");
