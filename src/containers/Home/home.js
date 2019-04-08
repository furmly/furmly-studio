import { ipcRenderer } from "electron";
import React from "react";
import qs from "query-string";
import { Icon } from "furmly-base-web";
import PropTypes from "prop-types";
import { Switch, Route } from "react-router-dom";
import SideMenu from "components/SideMenu";
import FurmlyControls from "furmly-controls";
import Toast from "../../components/toast";
import "./style.scss";
import { ipcSend } from "../../util";
import Dispatcher from "../../../app/dispatcher";
import ipcConstants from "../../../app/ipc-constants";
import Dashboard from "../Dashboard";

const Process = FurmlyControls.PROCESS;
class Home extends React.Component {
  async componentDidMount() {
    await this.props.frame.setTitleAndSideBarComponent("Home", props => (
      <SideMenu
        {...props}
        location={this.props.location}
        logout={this.logout}
        openMenu={this.props.openProcess}
      />
    ));
    this.dispatcher = new Dispatcher(
      ipcRenderer,
      [ipcConstants.STOP_PROXY],
      ipcSend
    );
  }
  componentWillUnmount() {
    this.dispatcher.destructor();
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextProps.location.pathname !== this.props.location.pathname ||
      this.props.location.search !== nextProps.location.search
    )
      return true;
    return false;
  }
  logout = async () => {
    await this.props.frame.clearSideBarComponent("Login");
    this.props.client.setCredentials(null);
    this.setState({ busy: true }, () =>
      this.dispatcher.send(
        ipcConstants.STOP_PROXY,
        {},
        async (sender, closed) => {
          setTimeout(() => {
            this.props.history.push("/");
            this.props.history.length = 0;
          }, 1000);
        }
      )
    );
  };
  completed = (nextProps, oldProps) => {
    let cancelled;
    const cancel = Toast.show(
      <div>
        <p
          className={"interactive"}
          onClick={() => {
            cancelled = true;
            cancel();
            this.props.openProcess({
              value: oldProps.id,
              type: "FURMLY",
              params: qs.stringify({
                ...oldProps.fetchParams,
                restart: new Date().getTime()
              })
            });
          }}
        >
          <b>Restart Process ?</b>
        </p>
      </div>,
      Toast.DURATION.SHORT,
      () => {
        if (!cancelled) {
          Toast.show(
            <React.Fragment>
              <span>
                <Icon icon={"home"} iconSize={18} color={"white"} />{" "}
                {"Taking you home ..."}
              </span>
            </React.Fragment>,
            2000,
            () => this.props.history.push("/home")
          );
        }
      }
    );
  };
  render() {
    let fetchParams = qs.parse(this.props.location.search),
      currentStep = (fetchParams && fetchParams.currentStep) || 0;
    return (
      <React.Fragment>
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
            <Route path={`${this.props.match.url}/`} component={Dashboard} />
          </Switch>
        </div>
        <div className="footer">
          <span className={"server"}>🌎&nbsp;{this.props.client.getServer()}</span>
        </div>
      </React.Fragment>
    );
  }
}

Home.propTypes = {
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  frame: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired,
  openProcess: PropTypes.func.isRequired
};
export default Home;
