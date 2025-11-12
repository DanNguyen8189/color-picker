// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import path from 'path';

// https://astro.build/config
export default defineConfig({
    integrations: [react()],
    vite: {
        // Pre-bundle problematic dependencies during dev so their CJS `require` calls are
        // transformed to ESM-compatible code. Also ensure they are bundled for SSR/build
        // so the final output doesn't leak `require` into browser ESM modules.
        optimizeDeps: {
            include: ['react-draggable'],
        },
        ssr: {
            noExternal: ['react-draggable']
        },
        resolve: {
            alias: {
                // use the browser-friendly build of react-draggable instead of the CJS entry
                'react-draggable': path.resolve('./node_modules/react-draggable/build/web/react-draggable.min.js')
            }
        }
    }
});