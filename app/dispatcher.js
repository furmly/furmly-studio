const debug = require("debug")("dispatcher");
class Dispatcher {
  constructor(source, eventNames = ["message"], _send) {
    if (!source) throw new Error("Event source cannot be null");
    this.waitForEvent = this.waitForEvent.bind(this);
    this.waitHandles = {};
    this.source = source;
    this.customSend = _send;
    this._handlers = [];
    eventNames.forEach(name => {
      const handler = this.onEvent.bind(this, name);
      this.source.on(name, handler);
      this._handlers.push({ name, handler });
    });
  }

  destructor() {
    this._handlers.forEach(({ name, handler }) => {
      this.source.removeListener(name, handler);
    });
  }
  waitForEvent(name, fn, keep = false) {
    if (!this.waitHandles[name]) this.waitHandles[name] = [];
    this.waitHandles[name].push({ fn, keep });
  }
  onEvent(eventName, ...args) {
    const args0 = args[0];
    const type = args0.type || eventName;
    if (!args0) throw new Error("Message is missing dispatch information.");

    if (!this.waitHandles[type] || !this.waitHandles[type].length)
      throw new Error(
        `Missing wait handles for message ${eventName} ${JSON.stringify(
          args,
          null,
          " "
        )}`
      );

    debug(`wait handles:${JSON.stringify(this.waitHandles, null, " ")}`);
    const { fn, keep } = this.waitHandles[type].shift();

    args.push((message = {}) => this._send({ type, ...message }));
    debug(args);
    fn.apply(this, args);
    if (keep) this.waitHandles[type].unshift({ fn, keep });
  }
  _send(args) {
    if (this.customSend) return this.customSend(args);
    this.source.send(args);
  }
  send(type, message, waitHandle, keep = false) {
    
    if (waitHandle) {
      this.waitForEvent(type, waitHandle, keep);
    }

    this._send({ type, ...message });
  }
}
module.exports = Dispatcher;
