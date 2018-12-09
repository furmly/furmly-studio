import React from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { injectFontsAndCSSBase } from "furmly-base-web";
import Login from "../Login";
import Home from "../Home";
import "./style.scss";

injectFontsAndCSSBase();
class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className={"wrapper"}>
        <Router>
          <Switch>
            <Route path="/" component={Login} />
            <Route path="/home" component={Home} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
