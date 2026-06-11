import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabled to prevent React Strict Mode's double-invoke from producing
  // AbortErrors that the catch block in apiFetch previously showed as
  // "Unable to reach the server". The AbortError guard in api.ts is the
  // code-level fix; this disables the dev-mode double-invoke that triggers it.
  // Set back to true before a production build.
  reactStrictMode: false,
};

export default nextConfig;
