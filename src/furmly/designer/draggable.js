import React from "react";
import PropTypes from "prop-types";

class Draggable extends React.Component {
  serialize = event => {
    event.dataTransfer.setData(
      "furmly-diagram-node",
      JSON.stringify(this.props.item)
    );
  };
  render() {
    return (
      <span
        className={`draggable ${this.props.className}`}
        draggable
        onDragStart={this.serialize}
      >
        {this.props.item.key}
      </span>
    );
  }
}

Draggable.propTypes = {
  item: PropTypes.object.isRequired,
  className: PropTypes.string
};
export default Draggable;
