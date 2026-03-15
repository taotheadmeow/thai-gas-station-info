import tailwindPlugin from "bun-plugin-tailwind";

const result = await Bun.build({
  entrypoints: ["./src/index.html"],
  outdir: "./dist",
  minify: true,
  sourcemap: "external",
  plugins: [tailwindPlugin]
});

if (!result.success) {
  console.error("Build failed");
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log("Build complete");