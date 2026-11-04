import path from 'path';

import type { NextConfig } from 'next'
 
const nextConfig: NextConfig = {
  // your configuration here
  output: 'standalone',
  reactStrictMode: true,
  turbopack: {
    resolveAlias:{
      '@service/*': path.resolve(__dirname, 'app/services/*'), // maps @something to path/to/something
    },
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  },
  async redirects() {
    return [
      {
        source: '/particuliers/coaching-individuel',
        destination: '/coaching/particuliers',
        permanent: true,
      },
      {
        source: '/professionnels-etablissements-de-soins/coaching',
        destination: '/coaching/etablissements',
        permanent: true,
      },
      {
        source: '/professionnels-etablissements-de-soins/formations-rps-qvct',
        destination: '/formations/prevention-rps-qvct-etablissements-sante',
        permanent: true,
      },
      {
        source: '/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles',
        destination: '/gapp-analyse-pratiques-professionnelles',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;