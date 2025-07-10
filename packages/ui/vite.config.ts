import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import {prefix} from '../lib/prefix'

// https://vitejs.dev/config/
export default defineConfig(() => {
    return {
      plugins: [react()],
      css: prefix()
    };
});
