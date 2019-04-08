const defer = require("config/defer").deferConfig;
const converters = {
  bool: function(string) {
    return string == "true";
  }
};
const getConverter = function(converter) {
  if (typeof converter == "string") {
    if (!converters[converter])
      throw new Error("Unknown converter " + converter);
    return converters[converter];
  }
  if (typeof converter == "function") return converter;
  return null;
};
module.exports = function(name, defaultValue, converter) {
  return defer(function() {
    const _converter = getConverter(converter);
    const data = process.env.hasOwnProperty(name)
      ? process.env[name]
      : defaultValue;
    return _converter ? _converter(data) : data;
  });
};
