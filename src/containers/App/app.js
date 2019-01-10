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

injectFontsAndCSSBase();
const defaultTheme = {
  dropDownMenuColor: "rgb(40, 39, 64)",
  labelBackgroundColor: "rgb(28, 27, 47)",
  inputBackgroundColor: "rgba(171, 171, 171, 0.3)",
  formComponentBackgroundColor: "transparent",
  labelColor: "rgb(85, 83, 136)",
  inputColor: "white",
  accentColor: "orange",
  factor: 1.2,
  modalBackgroundColor: "rgb(40, 39, 64)",
  errorColor: "#ab0101",
  errorForeground: "white"
};

class App extends React.PureComponent {
  state = {
    max: false
  };
  toggleSideMenu = () => {
    this.setState({
      side: this.state.side ? "" : "show"
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
  render() {
    const Side = this.props.side;
    return (
      <React.Fragment>
        <header id="titlebar">
          <div id="drag-region">
            <div id="window-title">
              {(this.props.side && (
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
              <span>{`Furmly${(this.props.subTitle &&
                " - " + this.props.subTitle) ||
                ""}`}</span>
            </div>
            <div id="window-controls">
              <div className="button" id="min-button" onClick={this.minimize}>
                <span>&#xE921;</span>
              </div>
              {(!this.state.max && (
                <div className="button" id="max-button" onClick={this.maximize}>
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
              <div className={`sidebar ${this.state.side}`}>
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
    );
  }
}

App.propTypes = {
  side: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
  subTitle: PropTypes.string
};
export default App;
