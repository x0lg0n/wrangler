import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        buffer: false,
      };
      config.resolve.alias = {
        ...config.resolve.alias,
        'isomorphic-ws': path.resolve(__dirname, 'lib/isomorphic-ws-shim.mjs'),
      };
    }
    config.experiments = {
      ...config.experiments,
      syncWebAssembly: true,
      asyncWebAssembly: true,
    };
    config.plugins = [
      ...(config.plugins || []),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ];
    return config;
  },
};

export default nextConfig;
