import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Permitir require de módulos CommonJS en el servidor
      config.externals = config.externals || [];
      config.externals.push({
        'canvas': 'canvas',
      });
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
