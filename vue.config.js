module.exports = {
  lintOnSave: false,
  productionSourceMap: false,
  css: {
    loaderOptions: {
      scss: {
        prependData: '@import "@/assets/scss/_vars.scss";'
      }
    }
  }
}
