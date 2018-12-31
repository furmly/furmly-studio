import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";
import preferences from "../preferences";
import Client from "../client";
import { CREDENTIALS } from "../constants";

const ClientContext = React.createContext();

export const withClientProvider = WrappedComponent => {
  class Provider extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
    }
    UNSAFE_componentWillMount() {
      //get client context from store.
      this.setState({
        client: new Client(
          `https://localhost:${process.env.FURMLY_STUDIO_PORT || 3330}`,
          preferences.getObj(CREDENTIALS)
        )
      });
    }
    render() {
      return (
        <ClientContext.Provider value={this.state.client}>
          <WrappedComponent {...this.props} />
        </ClientContext.Provider>
      );
    }
  }
  hoistNonReactStatics(WrappedComponent, Provider);
  return Provider;
};

export const withClient = WrappedComponent => {
  class ClientConsumer extends React.Component {
    render() {
      return (
        <ClientContext.Consumer>
          {client => <WrappedComponent {...this.props} client={client} />}
        </ClientContext.Consumer>
      );
    }
  }
  hoistNonReactStatics(WrappedComponent, ClientConsumer);
  return ClientConsumer;
};
