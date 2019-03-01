import React from "react";
import { Input, Button, List, FormContainer, Icon } from "furmly-base-web";
import preferences from "../../preferences";
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
    sslFolder: "",
    uri: "",
    clientCertName: "",
    clientPrivateKeyName: "",
    caCertName: "",
    uris: preferences.getObj(SERVER) || []
  };
  reset = () => {
    return {
      uri: "",
      sslFolder: "",
      index: -1,
      clientCertName: "",
      clientPrivateKeyName: "",
      caCertName: ""
    };
  };
  setUri = uri => {
    this.setState({ uri });
  };
  setCa = caCertName => {
    this.setState({ caCertName });
  };
  setClientCert = clientCertName => {
    this.setState({ clientCertName });
  };
  setClientPrivateKey = clientPrivateKeyName => {
    this.setState({ clientPrivateKeyName });
  };
  setSSLFolder = sslFolder => {
    this.setState({ sslFolder });
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
    const uris = this.state.uris.slice();
    const obj = {
      uri: this.state.uri,
      sslFolder: this.state.sslFolder,
      clientCertName: this.state.clientCertName,
      clientPrivateKeyName: this.state.clientPrivateKeyName,
      caCertName: this.state.caCertName
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
          </span>
        </FormContainer>

        <Input
          value={this.state.uri}
          label={"Uri"}
          valueChanged={this.setUri}
        />
        <Input
          value={this.state.sslFolder}
          label={"SSL Certificate Directory"}
          description={
            "This directory would contain all the certificates required to successfully connect to this domain"
          }
          valueChanged={this.setSSLFolder}
        />
        <Input
          value={this.state.clientCertName}
          label={"Client certificate file name"}
          valueChanged={this.setClientCert}
          description={
            "The name of the certificate file that would be used by furmly to authorize sensitive actions"
          }
        />
        <Input
          value={this.state.clientPrivateKeyName}
          label={"Client certificate private key file name"}
          valueChanged={this.setClientPrivateKey}
          description={
            "The name of the private key file for the Client Certificate above."
          }
        />
        <Input
          value={this.state.caCertName}
          label={"CA certificate ( needed for self signed certificates )"}
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
