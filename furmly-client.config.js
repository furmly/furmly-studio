const prefs = require("./src/preferences").default;
const qs = require("querystring");
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
  },
  notifyStepAdvance: function(dispatch, state, params) {
    let hash_query = location.hash.split("?");
    var query = qs.parse(hash_query[1] || "");
    query.currentStep = params.params.currentStep;
    window.location.hash = hash_query + "?" + qs.stringify(query);
  },
  preRefreshToken: function(action, state) {
    return (action.body = JSON.stringify({
      refresh_token: state.login.refresh_token
    }));
  }
};
