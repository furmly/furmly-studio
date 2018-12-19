import React from "react";
import { Input, Button, List, FormContainer } from "furmly-base-web";
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
    sslFolder: "",
    uri: "",
    uris: preferences.getObj(SERVER) || []
  };
  reset = () => {
    return { uri: "", sslFolder: "" };
  };
  setUri = uri => {
    this.setState({ uri });
  };
  removeUri = index => {
    const uris = this.state.uris.slice();
    uris.splice(index, 1);
    this.setState(
      {
        uris
      },
      this.store
    );
  };
  store = () => {
    preferences.set(SERVER, this.state.uris);
  };
  saveUri = () => {
    const uris = this.state.uris.slice();
    uris.push({ uri: this.state.uri });
    this.setState(
      {
        uris,
        ...this.reset()
      },
      this.store
    );
  };
  render() {
    return (
      <div className={"manageServers"}>
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
          valueChanged={this.setUri}
        />
        <Input
          value={this.state.uri}
          label={"Uri"}
          valueChanged={this.setUri}
        />
        <FormContainer>
          <Button disabled={!this.state.uri} onClick={this.saveUri}>
            Add
          </Button>
          <List
            items={this.state.uris}
            rowTemplate={rowTemplate}
            rowClicked={() => {}}
            rowRemoved={this.removeUri}
          />
        </FormContainer>
      </div>
    );
  }
}

export default ManageServers;
