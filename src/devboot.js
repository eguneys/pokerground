require('./index.css');
require('./theme.css');
const main = require('./main');

const server = require('./server/main');

module.exports = main.app;
module.exports.Server = server.Server;
