import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command }) => {
    if (command === 'serve') {
        return {
            plugins: [react()],
        };
    } else {
        return {
            plugins: [react({ jsxRuntime: 'classic' })],
            build: {
                lib: {
                    formats: ['iife'],
                    entry: path.resolve(__dirname, 'src/choiceguide-results.tsx'), // Correct path to your entry file
                    name: 'OpenstadHeadlessChoiceGuideResults',
                    fileName: 'choiceguide-results',
                },
                rollupOptions: {
                    external: ['react', 'react-dom'],
                    output: {
                        globals: {
                            'react': 'React',
                            'react-dom': 'ReactDOM'
                        }
                    }
                },
                outDir: 'dist', // Ensures output is in the dist directory
            },
        };
    }
});
