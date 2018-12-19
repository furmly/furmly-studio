
const HTTP_VERBS = {
  POST: "POST",
  DELETE: "DELETE",
  PUT: "PUT",
  GET: "GET"
};
const parseJson = data => data.json();
class Client {
  constructor() {
    this.baseUrl = `http://localhost:${process.env.FURMLY_STUDIO_PORT || 3330}`;
  }
  fetch(...args) {
    return fetch.apply(this, args).then(parseJson);
  }
  doLogin(credentials) {
    return this.fetch(`${this.baseUrl}/login`, {
      method: HTTP_VERBS.POST,
      body: JSON.stringify(credentials)
    });
  }
}

export default new Client();
