module.exports = {
  lintOnSave: false,
  productionSourceMap: false,
  devServer: {
    proxy: {
      '^/agent': {
        target: process.env.VUE_APP_AGENT_URL,
        changeOrigin: true,
        pathRewrite: {
          '^/agent': '/'
        }
      }
    }
  },
  css: {
    loaderOptions: {
      scss: {
        prependData: '@import "@/assets/scss/_vars.scss";'
      }
    }
  }
}
