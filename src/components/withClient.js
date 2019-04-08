import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";
import PropTypes from "prop-types";
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
          `http://localhost:${process.env.FURMLY_STUDIO_PORT || 3330}`,
          preferences.getObj(CREDENTIALS)
        )
      });
    }
    render() {
      return (
        <ClientContext.Provider value={this.state.client}>
          {this.props.children}
        </ClientContext.Provider>
      );
    }
  }
  Provider.propTypes = {
    children: PropTypes.node
  };
  const ClientProvider = props => (
    <Provider>
      <WrappedComponent {...props} />
    </Provider>
  );
  hoistNonReactStatics(WrappedComponent, ClientProvider);
  return ClientProvider;
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
