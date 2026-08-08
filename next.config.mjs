/** @type {import('next').NextConfig} */
const nextConfig = {
  // @xenova/transformers pulls in onnxruntime-node (native bindings) to run
  // the local embedding model — keep it external instead of bundling it.
  serverExternalPackages: ["@xenova/transformers", "onnxruntime-node"],
};

export default nextConfig;
