const HTTP_VERBS = {
  POST: "POST",
  DELETE: "DELETE",
  PUT: "PUT",
  GET: "GET"
};
const parseJson = function(response) {
  if (response.status !== 200) {
    return response.json().then(x => {
      throw new Error(x.message);
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
  return fetch.apply(null, args).then(parseJson.bind(this));
};
class Client {
  constructor(baseUrl, credentials) {
    if (!baseUrl) throw new Error("Base URL cannot be null");
    this.baseUrl = baseUrl;
    this.credentials = credentials;
  }

  doLogin(credentials) {
    return _fetch.call(this, "/auth/login", {
      headers: { "Content-Type": "application/json" },
      method: HTTP_VERBS.POST,
      body: JSON.stringify(credentials)
    });
  }
  getMenu(name) {
    return _fetch.call(
      this,
      `/api/admin/acl?category=${name || "MAINMENU"}`,
      secure.call(this)
    );
  }
  setCredentials(credentials) {
    this.credentials = credentials;
  }
}

export default Client;
