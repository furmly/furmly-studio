const HTTP_VERBS = {
  POST: "POST",
  DELETE: "DELETE",
  PUT: "PUT",
  GET: "GET"
};
const SESSION_EXPIRED = "SESSION_EXPIRED";
const CREDENTIALS_CHANGED = "CREDENTIALS_CHANGED";
const refTokenExpression = /refresh_token/i;
const parseJson = async function(request, response) {
  if (response.status !== 200) {
    if (response.status == 401 && !refTokenExpression.test(request.url)) {
      try {
        const result = await this.getRefreshToken();
        this.fireEvent(CREDENTIALS_CHANGED, result);
        this.setCredentials(result);
        return _fetch.call(this, request.url, ...request.args); // call token url
      } catch (e) {
        this.fireEvent(SESSION_EXPIRED);
      }
    }
    if (response.status == 401) {
      this.fireEvent(SESSION_EXPIRED);
    }
    return response
      .json()
      .then(x => {
        throw new Error(x.message);
      })
      .catch(e => {
        throw new Error(response.statusText);
      });
  }
  return response.json();
};
const secure = function(obj = {}) {
  if (!this.credentials) throw new Error("No Credentials to send");
  obj.headers = {
    ...obj.headers,
    Authorization: `Bearer ${this.credentials.access_token}`
  };
  return obj;
};
const _fetch = function(url, ...args) {
  args.unshift(`${this.baseUrl}${url}`);
  return fetch.apply(null, args).then(parseJson.bind(this, { url, args }));
};
class Client {
  constructor(baseUrl, credentials) {
    if (!baseUrl) throw new Error("Base URL cannot be null");
    this.baseUrl = baseUrl;
    this.credentials = credentials;
    this.$events = {};
  }
  SESSION_EXPIRED = SESSION_EXPIRED;
  addEventListener(eventName, handler) {
    if (!this.$events[eventName]) {
      this.$events[eventName] = [];
    }
    this.$events[eventName].push(handler);
    const index = this.$events[eventName].length;
    return () => this.$events[eventName].splice(index, 1);
  }
  removeListener(eventName, handler) {
    if (this.$events[eventName]) {
      this.$events[eventName].splice(
        this.$events[eventName].indexOf(handler),
        1
      );
    }
  }
  fireEvent(eventName, args) {
    if (this.$events[eventName]) {
      this.$events[eventName].forEach(x => {
        try {
          x(args);
        } catch (e) {
          console.log("an error occurred while calling event handler");
        }
      });
    }
  }
  doLogin(credentials) {
    return _fetch.call(this, "/auth/login", {
      headers: { "Content-Type": "application/json" },
      method: HTTP_VERBS.POST,
      body: JSON.stringify(credentials)
    });
  }
  getRefreshToken() {
    return _fetch.call(this, "/auth/refresh_token", {
      headers: {
        "Content-Type": "application/json",
        refresh_token: this.credentials.refresh_token
      },
      method: HTTP_VERBS.POST
    });
  }
  getMenu(name) {
    return _fetch.call(
      this,
      `/api/admin/acl?category=${name || "MAINMENU"}`,
      secure.call(this)
    );
  }
  getDashboardStats() {
    return _fetch.call(
      this,
      "/api/processors/run/DASHBOARD_STATS",
      secure.call(this)
    );
  }
  setCredentials(credentials) {
    this.credentials = credentials;
  }
  getUsername() {
    return this.credentials && this.credentials.username;
  }
  getServer() {
    return this.credentials && this.credentials.uri;
  }
}

export default Client;
