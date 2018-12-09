import Login from "./login";
import { connect } from "react-redux";
import doLogin from "../../actions/login";

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
)(Login);
