/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // cover_url is free-form user input, so there is no hostname allowlist to
    // write. Serving these unoptimized keeps arbitrary URLs out of Next's image
    // optimizer, which would otherwise fetch them server-side on request.
    unoptimized: true,
  },
}

export default nextConfig
