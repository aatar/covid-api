const config = require('eslint-config-wolox-node');
config.rules["linebreak-style"] = ["error", (process.platform === "win32"? "windows" : "unix")];

module.exports = config;
