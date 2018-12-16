import React from "react";
import { Select, Input } from "furmly-base-web";

import "./style.scss";
import "assets/styles/common.scss";
import img from "assets/images/logo.png";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: "", password: "" };
  }
  usernameChanged = username => {
    this.setState({ username });
  };
  passwordChanged = password => {
    this.setState({ password });
  };
  render() {
    return (
      <div className={"loginPage"}>
        <div className={"container card"}>
          <div className={"decal"} />
          <div className={"control"}>
            <img height={120} src={img} />
            <Input
              value={this.state.username}
              label="Username"
              valueChanged={this.usernameChanged}
            />
            <Input
              value={this.state.password}
              label="Password"
              type={"password"}
              valueChanged={this.passwordChanged}
            />
            <Select
              label="Gender"
              items={[{ id: 1, t: "Something optional 1" }]}
              keyProperty="id"
              displayProperty="t"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
