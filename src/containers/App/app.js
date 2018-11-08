import React from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import Login from "../Login";
import Home from "../Home";
import style from "./style.scss";

class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className={style.wrapper}>
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
