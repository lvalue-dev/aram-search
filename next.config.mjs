/** @type {import('next').NextConfig} */
const nextConfig = {
  // 홈 서버 / Docker 배포용 standalone 번들 (.next/standalone)
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ddragon.leagueoflegends.com' },
      { protocol: 'https', hostname: 'raw.communitydragon.org' },
    ],
  },
};

export default nextConfig;
