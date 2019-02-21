import React from "react";
import FurmlyControls from "furmly-controls";
import { createToast } from "furmly-base-web";
import { withRouter } from "react-router-dom";
import { withClient } from "components/withClient";
import { withFrame } from "components/withFrame";
import { routerMiddleware } from "react-router-redux";
import Home from "./home";
import theme from "../../theme";
import { history } from "../../util";

let Toast;
setTimeout(
  () => (Toast = createToast({ theme, rootTargetId: "furmly-toast" })),
  0
);
const showMessage = store => next => action => {
  if (action.type == "SHOW_MESSAGE") Toast.show(<h3>{action.message}</h3>);
  next(action);
};
export default FurmlyControls.createPage(
  withRouter(withClient(withFrame(Home))),
  null,
  [routerMiddleware(history), showMessage]
);
