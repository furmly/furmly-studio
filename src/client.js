const HTTP_VERBS = {
  POST: "POST",
  DELETE: "DELETE",
  PUT: "PUT",
  GET: "GET"
};
const parseJson = data => data.json();
class Client {
  constructor() {
    this.baseUrl = `https://localhost:${process.env.FURMLY_STUDIO_PORT ||
      3330}`;
  }
  fetch(...args) {
    return fetch.apply(null, args).then(parseJson);
  }
  doLogin(credentials) {
    return fetch(`${this.baseUrl}/auth/login`, {
      headers: { "Content-Type": "application/json" },
      method: HTTP_VERBS.POST,
      body: JSON.stringify(credentials)
    }).then(parseJson);
  }
}

export default new Client();
