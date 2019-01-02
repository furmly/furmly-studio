import FurmlyControls from "furmly-controls";
import { withRouter } from "react-router-dom";
import { withClient } from "components/withClient";
import { withFrame } from "components/withFrame";
import Home from "./home";

export default FurmlyControls.createPage(
  withRouter(withClient(withFrame(Home)))
);
