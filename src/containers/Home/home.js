import React from "react";
import qs from "query-string";
import PropTypes from "prop-types";
import { Switch, Route } from "react-router-dom";
import SideMenu from "components/SideMenu";
import FurmlyControls from "furmly-controls";
import "./style.scss";

const Process = FurmlyControls.PROCESS;
class Home extends React.Component {
  async UNSAFE_componentWillMount() {
    await this.props.frame.setSubtitle("Home");
    await this.props.frame.setSideBarComponent(props => (
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
  render() {
    let fetchParams = qs.parse(location.search),
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
              />
            )}
          />
          <Route path={""} component={() => <div>Loading...</div>} />
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
