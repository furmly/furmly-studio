const prefs = require("./src/preferences").default;
const { CREDENTIALS } = require("./src/constants");
module.exports = {
  waitingProcessors: [],
  baseUrl: `https://localhost:${process.env.FURMLY_STUDIO_PORT}`,
  preDispatch: function(action) {
    if (!action.headers) action.headers = {};
    action.headers.Authorization = `Bearer ${
      prefs.getObj(CREDENTIALS).access_token
    }`;

    return action;
  }
};
