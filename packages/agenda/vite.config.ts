import { defineConfig } from 'vite';
import {viteSetup} from '@openstad-headless/lib/vite-setup'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return viteSetup(command, 'agenda', 'OpenstadHeadlessAgenda')
});