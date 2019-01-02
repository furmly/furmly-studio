import App from "./app";
import { withClientProvider } from "components/withClient";
import { withFrameProvider } from "../../components/withFrame";
export default withClientProvider(withFrameProvider(App));
