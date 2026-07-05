import { configureStore } from "@reduxjs/toolkit";
import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";
import { borrowerApi } from "../services/borrowerApi";
import { loansApi } from "../services/loansApi";
import { repaymentsApi } from "../services/repaymentsApi";
import { accountApi } from "../services/accountApi";
import { principalsApi } from "../services/principalsApi";
import { transactionsApi } from "../services/transactionsApi";
import { usersApi } from "../services/usersApi";

// Configure the root store and attach RTK Query slices here.
export const store = configureStore({
  reducer: {
    [borrowerApi.reducerPath]: borrowerApi.reducer,
    [loansApi.reducerPath]: loansApi.reducer,
    [repaymentsApi.reducerPath]: repaymentsApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
    [principalsApi.reducerPath]: principalsApi.reducer,
    [transactionsApi.reducerPath]: transactionsApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(borrowerApi.middleware)
      .concat(loansApi.middleware)
      .concat(repaymentsApi.middleware)
      .concat(accountApi.middleware)
      .concat(principalsApi.middleware)
      .concat(transactionsApi.middleware)
      .concat(usersApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
