import { combineReducers } from "redux";
import home from "../containers/Home/reducer";
import login from "../containers/Login/reducer";

export default combineReducers({
  home,
  login
});
