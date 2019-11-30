module.exports = {
  title: 'びわの家ブログ',
  description: '',
  host: 'localhost',
  port: '8282',
  theme: 'simple',
  markdown: {
    extendMarkdown: md => {
      md.set({ breaks: true })
      md.set({ linkify: true })
    }
  },
  head: [
    ['script', { src: "https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js" }],
    ['link', { href: '/css/style.css', rel: 'stylesheet' }]
  ],
  themeConfig: {
    author: 'kazukisako', // will display on the page footer
    navbar: { // will display below the title
      // YOUR_SITE_NAME: '',
    }
  }
}
