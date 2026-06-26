/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The frontend calls the agent API directly (cross-origin; the backend enables
  // CORS for all origins). Set NEXT_PUBLIC_BACKEND_URL to the agent's base URL.
  // Direct fetch is used (not a Next rewrite) so SSE streaming isn't buffered.
};

export default nextConfig;
