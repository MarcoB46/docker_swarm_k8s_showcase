module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: {
    devServer: {
      headers: {'Access-Control-Allow-Origin': '*' , 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE', 'Access-Control-Allow-Credentials': true}
    }
  }
}
