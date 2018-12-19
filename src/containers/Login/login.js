import React from "react";
import { Select, Input, Button, FormContainer, Modal } from "furmly-base-web";
import { ipcRenderer } from "electron";
import "assets/styles/common.scss";
import img from "assets/images/logo.svg";

import "./style.scss";

import ManageServers, { SERVER } from "./manage-servers";
import preferences from "../../preferences";
import client from "../../client";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serverDialogOpen: false,
      username: "",
      password: "",
      server: "",
      servers: preferences.getObj(SERVER) || [{ uri: "http://localhost:5000" }]
    };
  }

  usernameChanged = username => {
    this.setState({ username });
  };
  passwordChanged = password => {
    this.setState({ password });
  };
  serverChanged = server => {
    this.setState({ server });
  };
  openNewServer = () => {
    this.setState({ serverDialogOpen: true });
  };
  doneWithServerDialog = () => {
    this.setState({
      serverDialogOpen: false,
      servers: preferences.getObj(SERVER)
    });
  };
  doLogin = async () => {
    try {
      const { started } = ipcRenderer.sendSync("start-proxy", {
        connection: this.state.server
      });
      const { username, password } = this.state;
      if (started) {
        const result = await client.doLogin({ username, password });
        window.alert(JSON.stringify(result, null, " "));
      }
    } catch (e) {
      window.alert(e.message);
    }
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
              label="Select server to connect to"
              description={
                "Please ensure your furmly server is up and running...."
              }
              items={this.state.servers}
              value={this.state.server}
              keyProperty="uri"
              valueChanged={this.serverChanged}
              displayProperty="uri"
            />
            <FormContainer>
              <Button intent={"DEFAULT"} onClick={this.openNewServer}>
                Add new item
              </Button>
            </FormContainer>
            <FormContainer>
              <Button onClick={this.doLogin}>LOGIN</Button>
            </FormContainer>
          </div>
          <Modal
            visibility={this.state.serverDialogOpen}
            done={this.doneWithServerDialog}
            title={"Manage Servers"}
          >
            <ManageServers />
          </Modal>
        </div>
      </div>
    );
  }
}

export default Login;
