import "../assets/css/App.css";
import React, { Component } from "react";
import { ipcRenderer } from "electron";
import "./style.css";

class App extends React.Component {
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
    return (
      <div>
        <h1>Hello, Electron!</h1>

        <p>
          I hope you enjoy using basic-electron-react-boilerplate to start your
          dev off right!
        </p>
        <div>
          <label for="input"  >Email</label>
          <input name="input" />
        </div>
        <button onClick={this.startProxy}>start proxy</button>
        <button onClick={this.stopProxy}>stop proxy</button>
      </div>
    );
  }
}

export default App;
