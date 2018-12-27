export const ipcSend = function(args) {
  this.source.send(args.type, args);
};
