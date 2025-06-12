/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary's CDN hostname
        port: '', // Standard HTTPS port
        pathname: '/**', // Allow any path from this hostname, as Cloudinary URLs can vary
      },
      {
        // Parse the NEXT_PUBLIC_API_URL to get protocol, hostname, and port
        protocol: new URL(
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        ).protocol.replace(":", ""),
        // Explanation:
        // - `new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')`: Creates a URL object.
        //   The `|| 'http://localhost:8000'` acts as a fallback for when the variable might not be defined during initial Next.js config loading.
        // - `.protocol`: Returns "http:" or "https:".
        // - `.replace(':', '')`: Removes the colon to match `remotePatterns` expectation ("http" or "https").

        hostname: new URL(
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        ).hostname,
        // Explanation: Returns "localhost" or "ecommerce-backend.onrender.com".

        port: new URL(
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
        ).port,
        // Explanation: Returns "8000" for localhost:8000, or an empty string "" for standard ports (like 443 for HTTPS)

        pathname: "/media/products/images/**",
        // Explanation: This should be the path *relative to the root of Django domain*
        // where media files are served. It usually starts with `/media/`.
        // Ensure this matches Django's MEDIA_URL setting.
      },
      // Add other remotePatterns here if have more distinct image sources
    ],
  },
};

export default nextConfig;
