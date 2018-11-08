import React from "react";
import { ipcRenderer } from "electron";
import style from "./style.scss";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = { connection: "https://localhost:443" };
    this.startProxy = this.startProxy.bind(this);
    this.stopProxy = this.stopProxy.bind(this);
  }
  startProxy() {
    ipcRenderer.send("start-proxy", Object.assign({}, this.state));
  }
  stopProxy() {
    ipcRenderer.send("stop-proxy");
  }
  render() {
    return <div className={style.wrapper}>LOGIN</div>;
  }
}

export default Login;
