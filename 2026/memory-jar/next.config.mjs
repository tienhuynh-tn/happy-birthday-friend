/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: "/happy-birthday-friend/memory-jar",
  assetPrefix: "/happy-birthday-friend/memory-jar/",
};

export default nextConfig;
