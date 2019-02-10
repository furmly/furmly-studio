import React from "react";
import { Select, Input, Button, FormContainer, Modal } from "furmly-base-web";
import { ipcRenderer } from "electron";
import PropTypes from "prop-types";
import "assets/styles/common.scss";
import img from "assets/images/logo.svg";
import "./style.scss";
import ManageServers, { SERVER } from "./manage-servers";
import preferences from "../../preferences";
import Dispatcher from "../../../dispatcher";
import ipcConstants from "../../ipcConstants";
import { CREDENTIALS } from "../../constants";
import { ipcSend } from "../../util";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.dispatcher = new Dispatcher(
      ipcRenderer,
      [ipcConstants.START_PROXY],
      ipcSend
    );
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
  doLogin = () => {
    this.setState(
      { error: "", busy: true },
      this.dispatcher.send(
        ipcConstants.START_PROXY,
        {
          connection: this.state.server
        },
        async (sender, { started, er }) => {
          try {
            if (er) return this.setState({ error: er, busy: false });
            const { username, password } = this.state;
            if (started) {
              const result = await this.props.client.doLogin({
                username,
                password
              });
              preferences.set(CREDENTIALS, result);
              this.props.client.setCredentials(result);
              this.props.history.push("/home");
              this.props.history.length = 0;
            }
          } catch (e) {
            this.setState({ error: e.message, busy: false });
          }
        }
      )
    );
  };
  render() {
    return (
      <div className={"loginPage"}>
        <div className={"container card"}>
          <div className={"decal"} />
          <div className={"control"}>
            <img height={120} src={img} />
            {(this.state.error && (
              <FormContainer>
                <p className="error">{this.state.error}</p>
              </FormContainer>
            )) ||
              null}
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
              keyProperty={["uri"]}
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

Login.propTypes = {
  history: PropTypes.object.isRequired,
  client: PropTypes.object.isRequired
};
export default Login;
