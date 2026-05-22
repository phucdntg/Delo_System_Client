import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { allRTKServices } from "../services/allRTKServices";

const reducers = Object.values(allRTKServices).reduce((acc, service) => {
  acc[service.reducerPath] = service.reducer;
  return acc;
}, {});

export const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    Object.values(allRTKServices).reduce(
      (middleware, service) => middleware.concat(service.middleware),
      getDefaultMiddleware(),
    ),
});

setupListeners(store.dispatch);
