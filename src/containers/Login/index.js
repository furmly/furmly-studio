import Login from "./login";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import doLogin from "./action";

const mapStateToProps = state => {
  return {
    credentials: state.login.credentials
  };
};
const mapDispatchToProps = dispatch => {
  return {
    doLogin: credentials => dispatch(doLogin(credentials))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Login));
