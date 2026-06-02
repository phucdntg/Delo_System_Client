import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { allRTKServices } from "../services/allRTKServices";
import domainReducer from "./domainSlice";

const apiReducers = Object.values(allRTKServices).reduce((acc, service) => {
  acc[service.reducerPath] = service.reducer;
  return acc;
}, {});

export const store = configureStore({
  reducer: {
    ...apiReducers,
    domain: domainReducer,
  },
  middleware: (getDefaultMiddleware) =>
    Object.values(allRTKServices).reduce(
      (middleware, service) => middleware.concat(service.middleware),
      getDefaultMiddleware(),
    ),
});

setupListeners(store.dispatch);
