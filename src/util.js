export const ipcSend = function(args) {
  this.source.send(args.type, args);
};
export const iconMap = {
  computer: "desktop",
  description: "file-alt",
  people: "users",
  web: "globe-africa",
  supervisor_account: "user-shield"
};
