import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import crypto from "crypto";

const nonce = crypto.randomBytes(16).toString("base64")

export default defineConfig({
  plugins: [
    react(),
    {
      name: "vite-plugin-csp",
      transformIndexHtml(html) {
        ; // Generate a secure nonce

        // Inject nonce into all script tags and meta tag
        return html
          .replace('<meta name="csp-nonce" content="">', `<meta name="csp-nonce" content="${nonce}">`)
          .replace(/<script /g, `<script nonce="${nonce}" `);
      }
    }
  ],
  server: {
    headers: {
      "Content-Security-Policy": [
        `default-src 'self' ws://localhost:5173 https://cjrtnc.leaningtech.com/3.1/;`,
        `script-src 'self' 'nonce-${nonce}' 'wasm-unsafe-eval' 'unsafe-eval' https://cjrtnc.leaningtech.com/3.1/ blob:;`, // ✅ Allows eval() for cj3.js
        `script-src-elem 'self' 'nonce-${nonce}' https://cjrtnc.leaningtech.com/3.1/;`, // ✅ Ensures `main.tsx` and other scripts work
        `style-src 'self' 'wasm-unsafe-eval' 'unsafe-eval' 'unsafe-inline' https://cjrtnc.leaningtech.com/3.1/;`,
        `worker-src 'self' blob: https://cjrtnc.leaningtech.com;`,
        `connect-src 'self' ws://localhost:5173 blob: https://cjrtnc.leaningtech.com https://cjrtnc.leaningtech.com/3.1/8/lib/ext/;`,
        `frame-src 'self' https://cjrtnc.leaningtech.com/3.1/c.html; sandbox allow-scripts allow-same-origin;`,
        `object-src 'none';`
      ].join(" ")
    }
  }
});
