import React from "react";
import { Select, ThemeProvider, Input } from "furmly-base-web";

import style from "./style.scss";
const defaultTheme = {
  labelBackgroundColor: "white",
  formComponentBackgroundColor: "transparent",
  labelColor: "black",
  accentColor: "orange",
  factor: 1.2,
  modalBackgroundColor: "#ffd3d3",
  errorColor: "#ab0101",
  errorForeground: "white"
};
class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: "" };
  }

  render() {
    return (
      <ThemeProvider theme={defaultTheme}>
        <div className={style.loginPage}>
          <div className={style.loginControl}>
            <Input
              value={this.state.username}
              label="Username"
              valueChanged={this.usernameChanged}
            />
            <Select
              label="Gender"
              items={[{ id: 1, t: "Something optional 1" }]}
              keyProperty="id"
              displayProperty="t"
            />
          </div>
        </div>
      </ThemeProvider>
    );
  }
}

export default Login;
