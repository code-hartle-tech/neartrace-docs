import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'NearTrace',
  description: 'Professional BLE & Wi-Fi scanner for Android. See every radio around you.',
  lang: 'en-US',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#0d0d0d' }],
    ['meta', { property: 'og:image', content: 'https://docs.neartrace.app/og.png' }],
  ],

  themeConfig: {
    logo: { src: '/logo.svg', alt: 'NearTrace' },
    siteTitle: 'NearTrace',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Features', link: '/features/scanner' },
      { text: 'FAQ', link: '/faq' },
      { text: 'Privacy', link: '/privacy' },
      { text: 'neartrace.app', link: 'https://neartrace.app' },
    ],

    sidebar: [
      {
        text: '🚀 Getting Started',
        items: [
          { text: 'What is NearTrace?', link: '/guide/getting-started' },
          { text: 'Install & Permissions', link: '/guide/install' },
          { text: 'Your First Scan', link: '/guide/first-scan' },
          { text: 'Enrollment CLI', link: '/guide/enrollment' },
        ],
      },
      {
        text: '📡 Features',
        items: [
          { text: 'BLE & Wi-Fi Scanner', link: '/features/scanner' },
          { text: 'Proximity Tracker', link: '/features/tracker' },
          { text: 'AR Locate & Sonar', link: '/features/ar-locate' },
          { text: 'Ghost Mode', link: '/features/ghost-mode' },
          { text: 'Red Button', link: '/features/red-button' },
          { text: 'Themes', link: '/features/themes' },
          { text: 'Export & Integrations', link: '/features/export' },
        ],
      },
      {
        text: '🦇 Nosferato',
        collapsed: true,
        items: [
          { text: 'What is Nosferato?',  link: '/nosferato/' },
          { text: 'Release channels',    link: '/nosferato/channels' },
          { text: 'Build & flash the SD', link: '/nosferato/build' },
          { text: 'First boot',           link: '/nosferato/first-boot' },
          { text: 'Reach the rig',        link: '/nosferato/reach' },
          { text: 'The tool stack',       link: '/nosferato/tools' },
          { text: 'Pair with NearTrace',  link: '/nosferato/pair' },
        ],
      },
      {
        text: '📖 Reference',
        items: [
          { text: 'FAQ', link: '/faq' },
          { text: 'Privacy Policy', link: '/privacy' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/code-hartle-tech' },
    ],

    footer: {
      message: 'Built by <a href="https://hartle.tech">HARTLE.TECH</a>',
      copyright: '© 2026 HARTLE.TECH',
    },

    search: { provider: 'local' },

    editLink: {
      pattern: 'https://github.com/code-hartle-tech/neartrace-docs/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },

  appearance: 'dark',

  cleanUrls: true,
})
