const React = require("react");
const furmlyBase = require("furmly-base-web");
module.exports = e => {
  const FormContainer = furmlyBase.FormContainer;
  return React.createElement(
    FormContainer,
    {},
    React.createElement("p", {}, e.message)
  );
};
