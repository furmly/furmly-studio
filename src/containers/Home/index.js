import FurmlyControls from "furmly-controls";
import { withRouter } from "react-router-dom";
import { withClient } from "components/withClient";
import { withFrame } from "components/withFrame";
import { routerMiddleware } from "react-router-redux";
import Home from "./home";
import { history } from "../../util";


export default FurmlyControls.createPage(
  withRouter(withClient(withFrame(Home))), // Component to wrap
  null,
  { extraMiddlewares: [routerMiddleware(history)] } // extra middlewares to include
);
