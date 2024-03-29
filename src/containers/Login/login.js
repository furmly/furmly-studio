import React from "react";
import {
  Select,
  Input,
  Button,
  FormContainer,
  Modal,
  BusyIndicator
} from "furmly-base-web";
import { ipcRenderer } from "electron";
import PropTypes from "prop-types";
import "assets/styles/common.scss";
import img from "assets/images/invert1.png";
import "./style.scss";
import ManageServers, { SERVER } from "./manage-servers";
import preferences from "../../preferences";
import Dispatcher from "../../../app/dispatcher";
import ipcConstants from "../../../app/ipc-constants";
import { CREDENTIALS } from "../../constants";
import { ipcSend } from "../../util";

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      serverDialogOpen: false,
      busy: false,
      username: "",
      password: "",
      server: "",
      servers: preferences.getObj(SERVER) || [
        { uri: "http://furmly-demo.herokuapp.com:80" }
      ]
    };
  }

  componentDidMount() {
    this.dispatcher = new Dispatcher(
      ipcRenderer,
      [ipcConstants.START_PROXY],
      ipcSend
    );
  }
  componentWillUnmount() {
    this.dispatcher.destructor();
  }

  getSelectedServer = () => {
    return this.state.servers.find(x => x.uri == this.state.server);
  };
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
    const { uri, ...rest } = this.getSelectedServer() || {};
    this.setState({ error: "", busy: true }, () =>
      this.dispatcher.send(
        ipcConstants.START_PROXY,
        {
          connection: uri,
          username: this.state.username,
          ...rest
        },
        async (sender, { started, er }) => {
          let error;
          try {
            if (er) return this.setState({ error: er, busy: false });
            const { username, password } = this.state;
            if (started) {
              const result = await this.props.client.doLogin({
                username,
                password
              });
              const cred = { ...result, username, uri };
              preferences.set(CREDENTIALS, cred);
              this.props.client.setCredentials(cred);
              this.props.history.push("/home");
              this.props.history.length = 0;
            }
          } catch (e) {
            error = e.message;
          }
          this.setState({ error, busy: false });
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
            {(this.state.busy && <BusyIndicator />) || (
              <React.Fragment>
                {(this.state.error && (
                  <FormContainer>
                    <p className="error">
                      {typeof this.state.error == "object"
                        ? JSON.stringify(this.state.error)
                        : this.state.error}
                    </p>
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
                  getKeyValue={x => x.uri}
                  displayProperty="uri"
                />
                <FormContainer>
                  <Button intent={"DEFAULT"} onClick={this.openNewServer}>
                    Manage connections
                  </Button>
                </FormContainer>
                <FormContainer>
                  <Button disabled={this.state.busy} onClick={this.doLogin}>
                    LOGIN
                  </Button>
                </FormContainer>
              </React.Fragment>
            )}
          </div>
          <Modal
            className={"manage-servers"}
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
