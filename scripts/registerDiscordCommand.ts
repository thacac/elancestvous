/**
 * Outil manuel, à exécuter une seule fois (ou à chaque changement de la
 * définition des commandes) — enregistre les commandes slash /blog-sujet et
 * /blog-file auprès de l'API Discord (PUT /applications/{id}/commands).
 * Volontairement hors du runtime de l'app (services/blog/) : l'enregistrement
 * d'une commande n'a rien à faire dans le process qui tourne en continu sur
 * le VPS, cf. issue #67.
 *
 * Usage : yarn blog:register-discord-command
 * Requiert DISCORD_APPLICATION_ID et DISCORD_BOT_TOKEN dans l'environnement.
 *
 * Ce PUT remplace l'intégralité des commandes globales de l'application par
 * le tableau fourni — les deux doivent donc toujours être enregistrées
 * ensemble ici (Approuver/Retoucher/Ignorer sont des boutons de message, pas
 * des commandes, non concernés).
 */
async function main() {
  const applicationId = process.env.DISCORD_APPLICATION_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!applicationId) {
    throw new Error("Variable d'environnement manquante : DISCORD_APPLICATION_ID");
  }
  if (!botToken) {
    throw new Error("Variable d'environnement manquante : DISCORD_BOT_TOKEN");
  }

  const commands = [
    {
      name: "blog-sujet",
      description: "Proposer un sujet pour le prochain article du blog",
      type: 1,
    },
    {
      name: "blog-file",
      description: "Lister la file d'attente du blog, ou en supprimer une entrée",
      type: 1,
      options: [
        {
          name: "supprimer",
          description: "Id de l'entrée à supprimer (laisser vide pour lister la file)",
          type: 3, // STRING
          required: false,
        },
      ],
    },
  ];

  const response = await fetch(
    `https://discord.com/api/v10/applications/${applicationId}/commands`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Discord a refusé l'enregistrement (${response.status}) : ${await response.text()}`
    );
  }

  console.log("Commandes /blog-sujet et /blog-file enregistrées.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
