import React from "react";
import PropTypes from "prop-types";
import { FormContainer, Modal, Button, Label } from "furmly-base-web";
import "brace";
import AceEditor from "react-ace";
import "brace/mode/javascript";
import "brace/mode/json";
import "brace/theme/monokai";
import "brace/snippets/javascript";
import "brace/ext/searchbox";
import "./ext-tern";
import "./style.scss";

const editorProps = { $blockScrolling: false };
class Script extends React.Component {
  state = {
    visible: false,
    value: "",
    aceOptions: {
      enableTern: {
        defs: [],
        plugins: {},
        useWorker: true,
        startedCb: () => {
          this.setState({ workerReady: true });
        }
      },
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      enableSnippets: true
    }
  };

  setValue = value => {
    this.setState({ value });
  };
  removeWorker = () => {
    if (this.aceEditor && this.state.workerReady) {
      this.aceEditor.editor.ternServer.server.terminate();
    }
  };
  onValueChanged = shouldSet => {
    if (shouldSet) {
      this.props.valueChanged({ [this.props.name]: this.state.value });
    }
    this.removeWorker();
    this.setState(
      {
        value: "",
        visible: false,
        workerReady: false
      },
      () => {
        //clean up ace-editor
        const stuffToRemove = document.getElementsByClassName("ace_editor");
        for (let i = 0; i < stuffToRemove.length; i++) {
          stuffToRemove[i].remove();
        }
      }
    );
  };
  setAceEditor = ref => {
    this.aceEditor = ref;
  };
  showEditor = () => {
    this.setState({
      visible: true,
      value: this.props.value
    });
  };
  render() {
    return (
      <>
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
            ref={this.setAceEditor}
            className={"custom-editor"}
            setOptions={this.state.aceOptions}
            value={this.state.value || ""}
            onChange={this.setValue}
            mode={(this.props.args && this.props.args.mode) || "javascript"}
            theme={"monokai"}
            name={this.props.name}
            editorProps={editorProps}
          />
        </Modal>
      </>
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
