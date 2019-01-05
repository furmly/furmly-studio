import FurmlyControls from "furmly-controls";
import { withRouter } from "react-router-dom";
import { createHashHistory } from "history";
import { withClient } from "components/withClient";
import { withFrame } from "components/withFrame";
import { routerMiddleware } from "react-router-redux";
import Home from "./home";

export default FurmlyControls.createPage(
  withRouter(withClient(withFrame(Home))),
  [routerMiddleware(createHashHistory())]
);
