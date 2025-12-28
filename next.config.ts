import type { NextConfig } from 'next'
import path from 'path';
 
const nextConfig: NextConfig = {
  // your configuration here
  output: 'standalone',
  reactStrictMode: true,
  turbopack: {
    resolveAlias:{
      '@service/*': path.resolve(__dirname, 'app/services/*'), // maps @something to path/to/something
    },
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
  }
};

export default nextConfig;