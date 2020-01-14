let proxy = require('http-proxy-middleware');

module.exports = (app) => {
  const apiRoutes = ['api','stripe'];
  const apiPath = 'http://localhost:3001/';

  apiRoutes.map( function (apiRoute) {
    app.use(proxy('/' + apiRoute, { target: apiPath }));
  });
};