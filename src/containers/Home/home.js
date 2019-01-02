import React from "react";
import qs from "query-string";
import PropTypes from "prop-types";
import { Switch, Route } from "react-router-dom";
import SideMenu from "components/SideMenu";
import FurmlyControls from "furmly-controls";

const Process = FurmlyControls.PROCESS;
class Home extends React.Component {
  async UNSAFE_componentWillMount() {
    await this.props.frame.setSubtitle("Home");
    await this.props.frame.setSideBarComponent(props => (
      <SideMenu {...props} openMenu={this.props.openProcess} />
    ));
  }
  render() {
    let fetchParams = qs.parse(location.search),
      currentStep = (fetchParams && fetchParams.currentStep) || 0;
    return (
      <div className="homePage">
        <Switch>
          <Route
            path={`${this.props.match.url}/dynamo/:processId`}
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
  match: PropTypes.object
};
export default Home;
