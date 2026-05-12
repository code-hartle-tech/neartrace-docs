import DefaultTheme from 'vitepress/theme'
import './style.css'
import './nosferato.css'
import type { Theme } from 'vitepress'

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ router }) {
    // Add 'is-nosferato' body class on /nosferato/* pages so the
    // saga gets the NOS-FERA-RATO motif (blood + neon + racing)
    // while the rest of NearTrace docs stay neutral.
    if (typeof window !== 'undefined' && router) {
      const apply = (path: string) => {
        document.body.classList.toggle(
          'is-nosferato',
          path.startsWith('/nosferato'),
        )
      }
      // Initial load
      apply(router.route?.path || window.location.pathname)
      // Route changes
      router.onAfterRouteChanged = (to) => apply(to)
    }
  },
}

export default theme
