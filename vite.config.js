import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

const __dirname = import.meta.dirname;

/**
 * htmlPartials — custom Vite plugin.
 *
 * Replaces <!--#include file="path/to/partial.html"--> directives
 * with the file contents before Vite processes the HTML.
 * Also injects per-page data (active nav link, lang, alternate URL)
 * via <!--#page data-key="value"--> front-matter comments.
 *
 * This removes the need for an external templating dependency.
 */
function htmlPartials() {
  return {
    name: 'html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const base = resolve(__dirname, 'src');

        // 1. Parse page metadata from <!--#page key="value" --> comments
        const meta = {};
        html = html.replace(/<!--#page\s+(.*?)-->/gs, (_, attrs) => {
          const matches = [...attrs.matchAll(/(\w+)="([^"]*)"/g)];
          matches.forEach(([, k, v]) => { meta[k] = v; });
          return '';
        });

        // 2. Resolve <!--#include file="..." --> to file contents
        html = html.replace(/<!--#include\s+file="([^"]+)"\s*-->/g, (match, filePath) => {
          const abs = resolve(base, filePath);
          if (!existsSync(abs)) {
            console.warn(`[html-partials] Missing partial: ${abs}`);
            return `<!-- MISSING: ${filePath} -->`;
          }
          let partial = readFileSync(abs, 'utf8');

          // Inject page-specific values into partials
          // Active nav: inject class="active" only on <a> tags inside <nav>,
          // matching the exact filename. The wordmark also uses href="index.html"
          // so we scope the replacement to only links inside .mainnav.
          if (meta.page) {
            const escaped = meta.page.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Replace inside the nav block only: find nav, inject, put nav back
            partial = partial.replace(
              /(<nav class="mainnav"[^>]*>)([\s\S]*?)(<\/nav>)/,
              (_, open, navBody, close) => {
                const updated = navBody.replace(
                  new RegExp(`(href="${escaped}")`),
                  '$1 class="active"'
                );
                return open + updated + close;
              }
            );
          }
          // Language alternate link
          if (meta.lang)   partial = partial.replace(/\[\[lang\]\]/g,   meta.lang);
          if (meta.altUrl) partial = partial.replace(/\[\[altUrl\]\]/g, meta.altUrl);
          if (meta.altLang) partial = partial.replace(/\[\[altLang\]\]/g, meta.altLang);
          if (meta.ticker) partial = partial.replace(/\[\[ticker\]\]/g, meta.ticker);

          return partial;
        });

        return html;
      }
    }
  };
}

// Enumerate all HTML entry points in src/
// Vite MPA: each HTML file is its own entry
const pages = [
  'index', 'portfolio', 'sobre-mi', 'servicios', 'contacto', 'notas',
  'taller-volver-a-mirar', 'muestra',
  'index-en', 'portfolio-en', 'sobre-mi-en', 'servicios-en',
  'contacto-en', 'notas-en', 'taller-volver-a-mirar-en',
];

const input = Object.fromEntries(
  pages.map(p => [p, resolve(__dirname, `src/${p}.html`)])
);

export default defineConfig({
  root: 'src',
  base: '/',
  publicDir: resolve(__dirname, 'src/public'),

  plugins: [
    htmlPartials(),
  ],

  css: {
    devSourcemap: true,
  },

  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true },
    },
    rollupOptions: {
      input,
      output: {
        // Deterministic asset names — avoids cache-busting churn on unchanged files
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      },
    },
    // Separate CSS per page is not needed — one shared bundle is fine
    // since all pages share the same CSS
    cssCodeSplit: false,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@css': resolve(__dirname, 'src/css'),
      '@js': resolve(__dirname, 'src/js'),
      '@components': resolve(__dirname, 'src/components'),
    },
  },

  server: {
    port: 5173,
    open: true,
  },
});
