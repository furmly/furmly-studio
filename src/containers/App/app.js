import React from "react";
import { remote } from "electron";
import PropTypes from "prop-types";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import {
  injectFontsAndCSSBase,
  ThemeProvider,
  IconButton
} from "furmly-base-web";
import Login from "../Login";
import Home from "../Home";
import "./style.scss";
import { FrameContext } from "components/withFrame";

injectFontsAndCSSBase();
const defaultTheme = {
  labelBackgroundColor: "rgb(28, 27, 47)",
  inputBackgroundColor: "rgba(171, 171, 171, 0.3)",
  formComponentBackgroundColor: "transparent",
  labelColor: "rgb(148, 146, 206)",
  inputColor: "white",
  accentColor: "orange",
  factor: 1.2,
  modalBackgroundColor: "rgb(40, 39, 64)",
  dropDownMenuColor: "#44436d",
  errorColor: "#ab0101",
  errorForeground: "white",
  dividerColor: "rgb(28, 27, 47)"
};

class App extends React.PureComponent {
  state = {
    max: false
  };
  toggleSideMenu = () => {
    this.setState({
      sideVisible: this.state.sideVisible ? "" : "show"
    });
  };
  minimize = () => {
    remote.getCurrentWindow().minimize();
  };
  maximize = () => {
    remote.getCurrentWindow().maximize();
    this.setState({ max: true });
  };
  close = () => {
    remote.getCurrentWindow().close();
  };
  restore = () => {
    remote.getCurrentWindow().unmaximize();
    this.setState({ max: false });
  };
  setStateAsync = state => {
    return new Promise(resolve => {
      this.setState(state, resolve);
    });
  };
  frame = {
    setSideBarComponent: async side => this.setStateAsync({ side }),
    setTitleAndSideBarComponent: async (subTitle, side) =>
      this.setStateAsync({ subTitle, side }),
    setSubtitle: async subTitle => this.setStateAsync({ subTitle }),
    clearSideBarComponent: async () => this.setStateAsync({ side: null })
  };
  render() {
    const Side = this.state.side;
    return (
      <FrameContext.Provider value={this.frame}>
        <React.Fragment>
          <header id="titlebar">
            <div id="drag-region">
              <div id="window-title">
                {(this.state.side && (
                  <div className="toggle-button">
                    <IconButton
                      className={"toggle"}
                      icon="bars"
                      iconSize={16}
                      color={"white"}
                      onClick={this.toggleSideMenu}
                    />
                  </div>
                )) ||
                  null}
                <span>{`Furmly${(this.state.subTitle &&
                  " - " + this.state.subTitle) ||
                  ""}`}</span>
              </div>
              <div id="window-controls">
                <div className="button" id="min-button" onClick={this.minimize}>
                  <span>&#xE921;</span>
                </div>
                {(!this.state.max && (
                  <div
                    className="button"
                    id="max-button"
                    onClick={this.maximize}
                  >
                    <span>&#xE922;</span>
                  </div>
                )) || (
                  <div
                    className="button"
                    id="restore-button"
                    onClick={this.restore}
                  >
                    <span>&#xE923;</span>
                  </div>
                )}
                <div className="button" id="close-button" onClick={this.close}>
                  <span>&#xE8BB;</span>
                </div>
              </div>
            </div>
          </header>
          <div id="main">
            <ThemeProvider theme={defaultTheme}>
              <div className={"wrapper"}>
                <div className={`sidebar ${this.state.sideVisible}`}>
                  {Side && <Side />}
                </div>
                <Router>
                  <Switch>
                    <Route path="/" exact component={Login} />
                    <Route path="/home" component={Home} />
                  </Switch>
                </Router>
              </div>
            </ThemeProvider>
          </div>
        </React.Fragment>
      </FrameContext.Provider>
    );
  }
}

App.propTypes = {
  side: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
  subTitle: PropTypes.string
};
export default App;