import { createStore } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import createElectronStorage from "redux-persist-electron-storage";
import rootReducer from "./reducers";

const persistConfig = {
  key: "root",
  storage: createElectronStorage()
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

export default () => {
  const store = createStore(persistedReducer);
  const persistor = persistStore(store);
  return { store, persistor };
};
