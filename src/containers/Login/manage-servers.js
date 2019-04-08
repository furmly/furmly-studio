import React from "react";
import { Input, Button, List, FormContainer, Icon } from "furmly-base-web";
import preferences from "../../preferences";
import FileSelector from "../../components/FileSelector";
export const SERVER = "BACKEND_SERVER";
const rowTemplate = {
  name: "expression",
  config: {
    exp: "{uri}"
  }
};
class ManageServers extends React.Component {
  state = {
    index: -1,
    uri: "",
    clientCertDir: "",
    caCertName: "",
    proxyKey: "",
    proxyCert: "",
    uris: preferences.getObj(SERVER) || []
  };
  reset = () => {
    return {
      uri: "",
      index: -1,
      clientCertDir: "",
      clientPrivateKeyName: "",
      caCertName: "",
      proxyKey: "",
      proxyCert: "",
      error: null
    };
  };
  setUri = uri => {
    this.setState({ uri });
  };
  setCa = caCertName => {
    this.setState({ caCertName });
  };
  setClientCertDir = clientCertDir => {
    this.setState({ clientCertDir });
  };

  setProxyCert = proxyCert => {
    this.setState({ proxyCert });
  };
  setProxyPrivateKey = proxyKey => {
    this.setState({ proxyKey });
  };

  removeUri = index => {
    const uris = this.state.uris.slice();
    uris.splice(index, 1);
    this.setState(
      {
        uris,
        ...this.reset()
      },
      this.store
    );
  };
  store = () => {
    preferences.set(SERVER, this.state.uris);
  };
  cancel = () => {
    this.setState({ ...this.reset() });
  };
  saveUri = () => {
    const { clientCertDir, caCertName, proxyCert, proxyKey, uri } = this.state;
    if (
      uri.indexOf("https") !== -1 &&
      (!clientCertDir || !proxyCert || !proxyKey)
    ) {
      return this.setState({
        error:
          "https requires Client Certificate , Proxy Certificate and Proxy Certificate Key"
      });
    }
    const uris = this.state.uris.slice();
    const obj = {
      uri,
      clientCertDir,
      caCertName,
      proxyKey,
      proxyCert
    };
    if (this.state.index >= 0) {
      uris[this.state.index] = obj;
    } else {
      uris.push(obj);
    }
    this.setState(
      {
        uris,
        ...this.reset()
      },
      this.store
    );
  };
  rowClicked = (index, row) => {
    this.setState({
      index,
      ...this.state.uris[index]
    });
  };
  render() {
    return (
      <div className={"manageServers"}>
        <FormContainer className="m-info">
          <Icon icon="info-circle" />
          <span>
            The remote location of the furmly server you are trying to connect
            to. Furmly uses client certificates to allow the user access to some
            features.
            <span className="error">
              <b>{this.state.error}</b>
            </span>
          </span>
        </FormContainer>

        <Input
          value={this.state.uri}
          label={"Uri"}
          valueChanged={this.setUri}
        />
        <FileSelector
          value={this.state.clientCertDir}
          label={"Client certificate dir name"}
          valueChanged={this.setClientCertDir}
          dialogProperties={["openDirectory"]}
          description={
            "Directory containing client certificates and keys. Certificates should be saved with {username}-crt.{extension} file name and {username}-key.{extension} for the private key"
          }
        />
        <FileSelector
          value={this.state.proxyCert}
          label={"Proxy certificate file name"}
          valueChanged={this.setProxyCert}
          description={
            "The path to the certificate file that would be used by furmly to authorize sensitive actions"
          }
        />
        <FileSelector
          value={this.state.proxyKey}
          label={"Proxy certificate private key file name"}
          valueChanged={this.setProxyPrivateKey}
          description={
            "The path to the private key file for the Proxy Certificate above."
          }
        />
        <FileSelector
          value={this.state.caCertName}
          label={"CA certificate path (needed for self signed certificates )"}
          valueChanged={this.setCa}
        />
        <FormContainer>
          {this.state.index >= 0 ? (
            <Button intent="DEFAULT" onClick={this.cancel}>
              Cancel
            </Button>
          ) : null}
          <Button disabled={!this.state.uri} onClick={this.saveUri}>
            {this.state.index >= 0 ? "Edit" : "Add"}
          </Button>
        </FormContainer>
        <div className="divider" />
        <FormContainer>
          <List
            items={this.state.uris}
            rowTemplate={rowTemplate}
            rowClicked={this.rowClicked}
            rowRemoved={this.removeUri}
          />
        </FormContainer>
      </div>
    );
  }
}

export default ManageServers;
