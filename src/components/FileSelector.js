import React from "react";
import { remote } from "electron";
import { Input, Icon } from "furmly-base-web";
import PropTypes from "prop-types";
import { labelColor } from "../theme";

class FileSelector extends React.Component {
  open = () => {
    remote.dialog.showOpenDialog(
      { properties: this.props.dialogProperties || ["openFile"] },
      filePaths => {
        if (filePaths.length) this.props.valueChanged(filePaths[0]);
      }
    );
  };
  render() {
    return (
      <div className="interactive" onClick={this.open}>
        <Input
          {...this.props}
          label={
            <span>
              <Icon icon="folder" color={labelColor} />
              {this.props.label}
            </span>
          }
        />
      </div>
    );
  }
}

FileSelector.propTypes = {
  valueChanged: PropTypes.func.isRequired,
  label: PropTypes.string,
  dialogProperties: PropTypes.arrayOf(PropTypes.string)
};
export default FileSelector;
