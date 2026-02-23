// Build-time environment variable validation
const requiredEnvironmentVariables = [
  'SFDC_COMMERCE_WEBSTORE_SITE_URL',
  'SFDC_COMMERCE_API_VERSION',
  'SALESFORCE_CONSUMER_KEY',
  'SALESFORCE_CONSUMER_SECRET',
  'SFDC_SERVICE_USER_USERNAME',
  'SFDC_SERVICE_USER_PASSWORD',
  'SFDC_CLOUDCRAZE_STOREFRONT',
];
const missingEnvironmentVariables = requiredEnvironmentVariables.filter(envVar => !process.env[envVar]);

if (missingEnvironmentVariables.length) {
  throw new Error(
    `The following environment variables are missing. Your site will not work without them.\n\n${missingEnvironmentVariables.join('\n')}\n`
  );
}

if (
  process.env.SFDC_COMMERCE_WEBSTORE_SITE_URL?.includes('[') ||
  process.env.SFDC_COMMERCE_WEBSTORE_SITE_URL?.includes(']')
) {
  throw new Error(
    'Your `SFDC_COMMERCE_WEBSTORE_SITE_URL` environment variable includes brackets (ie. `[` and / or `]`). Your site will not work with them there. Please remove them.'
  );
}

export default {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'shopdev.alliapetcare.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.naturesvariety.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.advance-affinity.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  }
};