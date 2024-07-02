import { defineConfig } from 'vite';
import {viteSetup} from '../configs/vite-setup'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {

  return viteSetup({command: command, entryName: 'form', name: 'OpenstadHeadlessForm'})

});