import React from "react";
import { FormContainer } from "furmly-base-web";
import "./style.scss";

const createDesigner = Container => {
  class Designer extends React.Component {
    render() {
      return (
        <FormContainer className={"container"}>
          {"Something is mad"}
        </FormContainer>
      );
    }
  }
  return { getComponent: () => Designer };
};

export default createDesigner;
