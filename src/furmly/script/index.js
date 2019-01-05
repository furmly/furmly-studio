import React from "react";
import brace from "brace";
import PropTypes from "prop-types";
import AceEditor from "react-ace";
import "brace/mode/javascript";
import "brace/mode/json";
import "brace/theme/monokai";
import "brace/ext/language_tools";
import 'brace/ext/searchbox';
import { FormContainer, Modal, Button, Label } from "furmly-base-web";
import "./style.scss";

class Script extends React.Component {
  state = {
    visible: false,
    value: ""
  };
  setValue = value => {
    this.setState({ value });
  };
  onValueChanged = shouldSet => {
    if (shouldSet) {
      this.props.valueChanged({ [this.props.name]: this.state.value });
    }
    this.setState({
      value: "",
      visible: false
    });
  };
  showEditor = () => {
    this.setState({
      visible: true,
      value: this.props.value
    });
  };
  render() {
    return (
      <React.Fragment>
        <FormContainer>
          <Label>{this.props.label}</Label>
          <Button className={"edit-button"} onClick={this.showEditor}>
            Edit
          </Button>
        </FormContainer>
        <Modal
          className={"script-modal"}
          visibility={this.state.visible}
          done={this.onValueChanged}
        >
          <AceEditor
            className={"editor"}
            value={this.state.value}
            onChange={this.setValue}
            mode={this.props.args.mode || "javascript"}
            theme={"monokai"}
            name={this.props.name}
            editorProps={{ $blockScrolling: false }}
            enableBasicAutocompletion={true}
            enableLiveAutocompletion={true}
            enableSnippets={true}
          />
        </Modal>
      </React.Fragment>
    );
  }
}

Script.propTypes = {
  name: PropTypes.string.isRequired,
  args: PropTypes.object,
  valueChanged: PropTypes.func.isRequired,
  value: PropTypes.string,
  label: PropTypes.string
};
export default Script;
