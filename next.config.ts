import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignora erros do ESLint durante o build (compila mesmo com avisos/erros)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Define a raiz do Turbopack para evitar o aviso de lockfiles
  turbopack: {
    root: "./",
  },
};

export default nextConfig;
