import React from "react";
import PropTypes from "prop-types";
import { IconButton } from "furmly-base-web";

class Panel extends React.Component {
  state = {
    isOpen: "show"
  };
  getIcon = () => {
    if (this.props.right) {
      return this.state.isOpen == "show" ? "chevron-right" : "chevron-left";
    }
    return this.state.isOpen == "show" ? "chevron-left" : "chevron-right";
  };
  toggle = () => {
    this.setState({
      isOpen: this.state.isOpen == "show" ? "collapsed" : "show"
    });
  };
  render() {
    return (
      <div className={`panel ${this.state.isOpen} ${this.props.type}`}>
        <IconButton
          onClick={this.toggle}
          icon={this.getIcon()}
        />
        <div className={"content"}>{this.props.children}</div>
      </div>
    );
  }
}

Panel.propTypes = {
  children: PropTypes.node,
  iconSize: PropTypes.number,
  right: PropTypes.bool,
  type: PropTypes.oneOf(["large", "huge"])
};

export default Panel;
