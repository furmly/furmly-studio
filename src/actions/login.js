import { LOGGING_IN, LOGGED_IN, LOGIN_FAILED } from "../constants";
export default credentials => {
  return {
    type: LOGGING_IN,
    credentials
  };
};

export function loggedIn(token) {
  return {
    type: LOGGED_IN,
    token
  };
}

export function loginFailed(error) {
  return {
    type: LOGIN_FAILED,
    error
  };
}
