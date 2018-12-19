import Store from "electron-store";

class Preferences {
  constructor() {
    this.store = new Store();
  }
  get(...keys) {
    let result = keys.map(x => this.store.get(x));
    if (keys.length > 1) {
      return result;
    }
    return result[0];
  }
  getObj(...keys) {
    let v = this.get.apply(this, keys);
    if (v && Array.prototype.isPrototypeOf(v)) {
      v = v.map(x => JSON.parse(x));
    } else {
      v = v && JSON.parse(v);
    }
    return v;
  }
  set(key, value) {
    this.store.set(
      key,
      typeof value == "object" ? JSON.stringify(value) : value
    );
    return this;
  }
}
export default Preferences;
