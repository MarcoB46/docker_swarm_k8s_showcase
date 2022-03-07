module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: {
    devServer: {
      headers: {'Access-Control-Allow-Origin': '*' , 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE', 'Access-Control-Allow-Credentials': true},
      proxy: {
        "/server/kill": {
          target: 'http://server:3000/kill',
          pathRewrite: {'^/server/kill' : ''},
          changeOrigin: true
        },
        "/server/ping": {
          target: 'http://server:3000/ping',
          pathRewrite: {'^/server/ping' : ''},
          changeOrigin: true
        },
    },
    }
  }
}
