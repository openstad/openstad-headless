import { defineConfig } from 'vite';
import {viteSetup} from '../lib/vite-setup.js'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return viteSetup(command, 'likes', 'OpenstadHeadlessLikes')
});