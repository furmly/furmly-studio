import React from "react";
import qs from "query-string";
import PropTypes from "prop-types";
import { Switch, Route } from "react-router-dom";
import SideMenu from "components/SideMenu";
import FurmlyControls from "furmly-controls";
import Toast from "../../components/toast";
import "./style.scss";

const Process = FurmlyControls.PROCESS;
class Home extends React.Component {
  async UNSAFE_componentWillMount() {
    await this.props.frame.setTitleAndSideBarComponent("Home", props => (
      <SideMenu {...props} openMenu={this.props.openProcess} />
    ));
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextProps.location.pathname !== this.props.location.pathname ||
      this.props.location.search !== nextProps.location.search
    )
      return true;
    return false;
  }
  completed = () => {
    Toast.show(
      <div>
        <p>
          <b>Restart Process ?</b>
        </p>
      </div>,
      Toast.DURATION.SHORT,
      () => {
        Toast.show("Heading home...");
      }
    );
  };
  render() {
    let fetchParams = qs.parse(this.props.location.search),
      currentStep = (fetchParams && fetchParams.currentStep) || 0;
    return (
      <div className="homePage">
        <Switch>
          <Route
            path={`${this.props.match.url}/furmly/:processId`}
            component={({ match }) => (
              <Process
                id={match.params.processId}
                currentStep={currentStep}
                fetchParams={fetchParams}
                processCompleted={this.completed}
              />
            )}
          />
          <Route path={""} component={() => <div className={"loader"} />} />
        </Switch>
      </div>
    );
  }
}

Home.propTypes = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  frame: PropTypes.object.isRequired,
  openProcess: PropTypes.func.isRequired
};
export default Home;
