import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "elancestvous.fr",
        short_name: "elancestvous",
        description: "Formation et coaching professionnel spécialisé pour les soignant, rps, gestion du stress et des émotions, Élan c'est vous !",
        start_url: "/",
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                "src": "/android-chrome-192x192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "/android-chrome-512x512.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ],
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone"
    }

}