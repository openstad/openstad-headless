import { defineConfig } from 'vite';
import {viteSetup} from '../../scripts/vite-setup.js'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {

  return viteSetup(command, 'simple-voting', 'OpenstadHeadlessSimpleVoting')

});