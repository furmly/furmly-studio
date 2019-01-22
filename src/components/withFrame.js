import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";


export const FrameContext = React.createContext();


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
