const defer = require("config/defer").deferConfig;
module.exports = function(name, defaultValue, defaultFunction) {
  return defer(function() {
    return process.env[name] || defaultValue || (defaultFunction && defaultFunction()) || null;
  });
};
