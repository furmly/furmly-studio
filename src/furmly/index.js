import { setup } from "furmly-base-web";
import Script from "./script";

const controls = setup({
  loginUrl: "/",
  homeUrl: "/home",
  providerConfig: [],
  extend: (map, _defaultMap) => {
    //add all custom controls
    map.SCRIPT = Script;
    return map.cook();
  }
});
export default controls;
 