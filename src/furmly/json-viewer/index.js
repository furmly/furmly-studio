import React from "react";
import PropTypes from "prop-types";
import "brace";
import AceEditor from "react-ace";
import "brace/mode/json";
import "brace/theme/monokai";
import "brace/ext/language_tools";
import "brace/ext/searchbox";
import { FormContainer } from "furmly-base-web";
import "./style.scss";

class JsonViewer extends React.Component {
  render() {
    //console.log(this.props);
    return (
      <FormContainer>
        <AceEditor
          readOnly={true}
          className={"json-view"}
          value={this.props.description || ""}
          mode={"json"}
          theme={"monokai"}
          name={"json-viewer"}
          editorProps={{ $blockScrolling: false }}
          enableBasicAutocompletion={false}
          enableLiveAutocompletion={false}
          enableSnippets={false}
          style={{ width: "100%" }}
          
        />
      </FormContainer>
    );
  }
}

JsonViewer.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  label: PropTypes.string
};
export default JsonViewer;
