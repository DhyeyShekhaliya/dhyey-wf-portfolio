/** @type {import('next').NextConfig} */
const nextConfig = {
  // The 3D scene and audio set themselves up once; StrictMode's double-mount in dev would build them twice.
  reactStrictMode: false,
};

export default nextConfig;
