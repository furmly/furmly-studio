import React from "react";
import { createHashHistory } from "history";
export const ipcSend = function(args) {
  this.source.send(args.type, args);
};
// export const iconMap = {
//   computer: "desktop",
//   description: "file-alt",
//   people: "users",
//   web: "globe-africa",
//   supervisor_account: "user-shield"
// };

export const createProvider = function(Provider, WrappedComponent) {
  const Component = props => (
    <Provider>
      <WrappedComponent {...props} />
    </Provider>
  );
  return Component;
};

export const history = createHashHistory();
