const Hapi = require('@hapi/hapi');
const StaticFilePlugin = require('@hapi/inert');
const Routes = require('./routes');
https = require('https')
require('dotenv').config();
setInterval(function() {
    https.get(`${process.env.URLAWAKE}`)
}, 300000); // every 5 minutes (300000)
//Prevent sleeping
async function startApp() {

  try {
      const server = Hapi.server({
          port: process.env.PORT || 8080,
          host: process.env.HOST || 'localhost',
          compression: false,
          // routes: { files: { relativeTo: Path.join(__dirname, 'public') } }
      });
      await server.register(StaticFilePlugin);
      await server.register(Routes);

      // Engine.start();
      await server.start();
      console.log(`Server running at: ${server.info.uri}`);
  }
  catch (err) {
      console.log(`Server errored with: ${err}`);
      console.error(err.stack);
      process.exit(1);
  }
}
startApp();