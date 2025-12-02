/** @type {import('next').NextConfig} */
const nextConfig = {
  // your configuration here
  output: 'standalone',
  reactStrictMode: true,
  // webpack: (config, { isServer }) => {
  //       if (!isServer) {
  //           config.resolve = {
  //               ...config.resolve,
  //               fallback: {
  //                   fs: false,
  //               },
  //           };
  //       }
  //       return config;
  //   },

};

export default nextConfig;