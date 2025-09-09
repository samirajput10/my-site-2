
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        port: '',
        pathname: '/**',
      },
    ],
  },
   webpack: (config, { isServer }) => {
    // Suppress warnings for 'net', 'fs', and 'tls' modules by providing fallbacks.
    // These are often used by server-side libraries (like some DB drivers or analytics tools)
    // that aren't necessary on the client.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // This is to suppress the 'Critical dependency: the request of a dependency is an expression' warning
    // often caused by 'opentelemetry' or other dynamic requires.
    config.module.exprContextCritical = false;

    return config;
  },
};

export default nextConfig;

    