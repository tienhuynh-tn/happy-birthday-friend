/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },

  // GitHub Pages repo + subfolder publish
  basePath: "/happy-birthday-friend/memory-jar",
  assetPrefix: "/happy-birthday-friend/memory-jar/",
};

export default nextConfig;
