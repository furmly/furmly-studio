import { setup } from "furmly-base-web";
import router from "furmly-react-router-web-addons";
import Script from "./script";
import createDesigner from "./designer";

const config = {
  loginUrl: "/",
  homeUrl: "/home",
  providerConfig: []
};
const extend = (map, _defaultMap, Deffered) => {
  // add all custom controls
  map.SCRIPT = Script;
  // add recipe for designer
  map.addRecipe(
    "DESIGNER",
    [new Deffered("container"), map.withTemplateCache],
    createDesigner
  );
  // add react router addon.
  router(map, config);
  return map.cook();
};
const controls = setup({ ...config, extend });
export default controls;
