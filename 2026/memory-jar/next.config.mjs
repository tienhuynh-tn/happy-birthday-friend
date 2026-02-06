const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: isProd ? "/happy-birthday-friend/memory-jar" : "",
  assetPrefix: isProd ? "/happy-birthday-friend/memory-jar/" : "",
};

export default nextConfig;
