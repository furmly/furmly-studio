import React from "react";
import { ipcRenderer } from "electron";
import hoistNonReactStatics from "hoist-non-react-statics";

export default WrappedComponent => {
  class Proxy extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        started: false
      };
      this.startProxy = this.startProxy.bind(this);
      this.stopProxy = this.stopProxy.bind(this);
    }
    UNSAFE_componentWillMount() {
      if (ipcRenderer.sendSync("status")) {
        this.setState({
          started: true
        });
      }
    }
    componentDidMount() {
      ipcRenderer.on("start", this.proxyStartEvent);
    }
    proxyStartEvent = message => {
      if (/error/.test(message)) {
        return this.setState({
          error: message.match(/error:(\w+)/)[1]
        });
      }

      this.setState({
        started: true
      });
    };
    startProxy() {
      ipcRenderer.send("start-proxy", Object.assign({}, this.state));
    }
    stopProxy() {
      ipcRenderer.send("stop-proxy");
    }
    render() {
      return (
        <WrappedComponent
          {...this.props}
          {...this.state}
          startProxy={this.startProxy}
          stopProxy={this.stopProxy}
        />
      );
    }
  }
  hoistNonReactStatics(Proxy, WrappedComponent);
  return Proxy;
};
