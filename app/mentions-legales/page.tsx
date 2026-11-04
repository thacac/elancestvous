import { BrushUnderline } from "@/components/charte";
import GabaritPage from "@/components/GabaritPage";
import { OG_BANNER_IMAGES } from "@/lib/openGraph";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site Élan C'est Vous : éditeur, hébergeur, propriété intellectuelle et protection des données personnelles.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: false, follow: true },
  openGraph: {
    url: "https://elancestvous.fr/mentions-legales",
    images: OG_BANNER_IMAGES,
  },
};

export default function MentionsLegales() {
  return (
    <GabaritPage
      as="section"
      id="mentions-legales"
      className="mb-20"
      filAriane={[{ label: "Mentions légales" }]}
    >
      <div className="container">
        <h1>
          Mentions{" "}
          <BrushUnderline className="text-accent">
            <strong>Légales</strong>
          </BrushUnderline>
        </h1>
        <p className="mt-5 text-primary/80">
          Conformément à la législation française, retrouvez ici toutes les
          informations légales du site.
        </p>
      </div>

      <div className="container pt-18">
        <div className="prose prose-lg text-stone-600 mb-8 space-y-4">
          <h2>Éditeur du site</h2>
          <p>
            <strong>Raison sociale :</strong> Elancestvous
            <br />
            <strong>Forme juridique :</strong> MICRO ENTREPRISE
            <br />
            <strong>Téléphone :</strong> 06.95.99.19.22
            <br />
            <strong>Email :</strong> contact@elancestvous.fr
            <br />
            <strong>SIREN :</strong> 923 013 619 00021
            <br />
            <strong>Directeur de la publication :</strong> Coralie Mathorel
          </p>

          <h2>Hébergement</h2>
          <p>
            <strong>Hébergeur :</strong> HOSTINGER operations, UAB
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble du contenu du site (textes, images, graphismes, logo,
            icônes, etc.) est la propriété exclusive de la société Elancestvous,
            sauf mention contraire. Toute reproduction, représentation,
            modification, publication, adaptation de tout ou partie des éléments
            du site, quel que soit le moyen ou le procédé utilisé, est interdite,
            sauf autorisation écrite préalable.
          </p>

          <h2 id="protection-des-donnees-personnelles">
            Protection des données personnelles
          </h2>
          <p>
            Conformément à la loi « Informatique et Libertés » et au RGPD, vous
            disposez d&apos;un droit d&apos;accès, de rectification et de suppression des
            données vous concernant. Pour exercer ce droit, contactez-nous à
            l&apos;adresse suivante : contact@elancestvous.fr.
          </p>

          <h2>Cookies</h2>
          <p>
            Le site peut être amené à utiliser des cookies pour améliorer
            l&apos;expérience utilisateur et réaliser des statistiques de visites.
            Vous pouvez configurer votre navigateur pour refuser les cookies.
          </p>

          <h2>Responsabilité</h2>
          <p>
            La société Elancestvous s&apos;efforce de fournir des informations aussi
            précises que possible. Toutefois, elle ne pourra être tenue
            responsable des omissions, des inexactitudes et des carences dans la
            mise à jour, qu&apos;elles soient de son fait ou du fait des tiers
            partenaires.
          </p>

          <h2>Liens externes</h2>
          <p>
            Le site peut contenir des liens vers d&apos;autres sites. La société
            Elancestvous n&apos;exerce aucun contrôle sur ces sites et ne saurait
            être responsable de leur contenu.
          </p>

          <h2>Droit applicable</h2>
          <p>
            Le présent site est soumis au droit français. En cas de litige, les
            tribunaux français seront seuls compétents.
          </p>
        </div>
      </div>
    </GabaritPage>
  );
}
