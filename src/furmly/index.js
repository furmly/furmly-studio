import { setup } from "furmly-base-web";

const controls = setup({
  loginUrl: "/",
  homeUrl: "/home",
  providerConfig: [],
  extend: (map, _defaultMap) => {
    //add all custom controls
    return map.cook();
  }
});
export default controls;
