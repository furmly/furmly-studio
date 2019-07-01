import React from "react";
import PropTypes from "prop-types";
import hoistNonReactStatics from "hoist-non-react-statics";

export const FrameContext = React.createContext();

export class FrameProvider extends React.Component {
  render() {
    return (
      <FrameContext.Provider value={this.props.value}>
        {this.props.children}
      </FrameContext.Provider>
    );
  }
}
FrameProvider.propTypes = {
  children: PropTypes.node,
  value: PropTypes.object
};
export const withFrame = WrappedComponent => {
  class FrameConsumer extends React.Component {
    render() {
      return (
        <FrameContext.Consumer>
          {frame => <WrappedComponent {...this.props} frame={frame} />}
        </FrameContext.Consumer>
      );
    }
  }
  hoistNonReactStatics(WrappedComponent, FrameConsumer);
  return FrameConsumer;
};

export const withDrawer = WrappedComponent => {
  class DrawerConsumer extends React.Component {
    render() {
      return (
        <FrameContext.Consumer>
          {frame => <WrappedComponent {...this.props} frame={frame} />}
        </FrameContext.Consumer>
      );
    }
  }
  hoistNonReactStatics(WrappedComponent, DrawerConsumer);
  return DrawerConsumer;
};
