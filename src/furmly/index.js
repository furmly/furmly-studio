import { setup } from "furmly-base-web";
import Script from "./script";
import createDesigner from "./designer";

const controls = setup({
  loginUrl: "/",
  homeUrl: "/home",
  providerConfig: [],
  extend: (map, _defaultMap, Deffered) => {
    // add all custom controls
    map.SCRIPT = Script;
    // add recipe for designer
    map.addRecipe(
      "DESIGNER",
      [new Deffered("container"), map.withTemplateCache],
      createDesigner
    );
    return map.cook();
  }
});
export default controls;
