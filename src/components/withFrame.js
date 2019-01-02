import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";

const FrameContext = React.createContext();

export const withFrameProvider = WrappedComponent => {
  class Provider extends React.Component {
    constructor(props) {
      super(props);
      this.state = {};
    }
    setStateAsync = state => {
      return new Promise(resolve => {
        this.setState(state, resolve);
      });
    };
    frame = {
      setSideBarComponent: async side => {
        this.setStateAsync({ side });
      },
      setSubtitle: async subTitle => {
        this.setStateAsync({ subTitle });
      },
      clearSideBarComponent: async () => {
        this.setStateAsync({ side: null });
      }
    };
    render() {
      return (
        <FrameContext.Provider value={this.frame}>
          <WrappedComponent {...this.props} {...this.state} />
        </FrameContext.Provider>
      );
    }
  }
  hoistNonReactStatics(WrappedComponent, Provider);
  return Provider;
};

export const withFrame = WrappedComponent => {
  class ClientConsumer extends React.Component {
    render() {
      return (
        <FrameContext.Consumer>
          {frame => <WrappedComponent {...this.props} frame={frame} />}
        </FrameContext.Consumer>
      );
    }
  }
  hoistNonReactStatics(WrappedComponent, ClientConsumer);
  return ClientConsumer;
};
