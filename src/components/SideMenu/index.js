import SideMenu from "./SideMenu";
import { withClient } from "../withClient";
import { withFrame } from "../withFrame";
export default withClient(withFrame(SideMenu));
