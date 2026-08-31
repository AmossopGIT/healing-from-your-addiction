import { defineConfig } from "vitest/config";
import fs from "node:fs";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  plugins: [
    {
      name: "md-as-raw-string",
      load(id) {
        if (!id.endsWith(".md")) return null;
        const content = fs.readFileSync(id, "utf8");
        return `export default ${JSON.stringify(content)}`;
      },
    },
  ],
});
