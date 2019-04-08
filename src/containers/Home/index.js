import React from "react";
import FurmlyControls from "furmly-controls";
import { Icon } from "furmly-base-web";
import { withRouter } from "react-router-dom";
import { withClient } from "components/withClient";
import { withFrame } from "components/withFrame";
import { routerMiddleware } from "react-router-redux";
import Home from "./home";
import { inputColor } from "../../theme";
import { history } from "../../util";
import Toast from "../../components/toast";

const showMessage = store => next => action => {
  if (action.type == "SHOW_MESSAGE") {
    Toast.show(
      <span>
        <Icon icon={"info-circle"} color={inputColor} />
        {action.message}
      </span>
    );
  }

  next(action);
};
export default FurmlyControls.createPage(
  withRouter(withClient(withFrame(Home))),
  null,
  { extraMiddlewares: [routerMiddleware(history), showMessage] }
);
