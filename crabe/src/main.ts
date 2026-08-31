// register vue composition api globally
import { ViteSSG } from 'vite-ssg/single-page'
import App from './App.vue'

// your custom styles here
import './styles/vars.scss'
import './styles/index.scss'

import 'uno.css'

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(App)
