import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "./commons";

export interface FundingAccount {
  id: number;
  name: string;
  currency: string;
  totalBalance: number;
  availableBalance: number;
  reservedBalance: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFundingAccountRequest {
  name: string;
  currency: string;
  initialDeposit: number;
}

export const accountApi = createApi({
  reducerPath: "accountApi",
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ["FundingAccounts"],
  endpoints: (build) => ({
    getFundingAccounts: build.query<FundingAccount[], void>({
      query: () => "/funding/accounts",
      providesTags: (result) =>
        result
          ? [
              ...result.map((account) => ({
                type: "FundingAccounts" as const,
                id: account.id,
              })),
              { type: "FundingAccounts", id: "LIST" },
            ]
          : [{ type: "FundingAccounts", id: "LIST" }],
    }),
    createFundingAccount: build.mutation<FundingAccount, CreateFundingAccountRequest>({
      query: (newAccount) => ({
        url: "/funding/accounts",
        method: "POST",
        body: newAccount,
      }),
      invalidatesTags: [{ type: "FundingAccounts", id: "LIST" }],
    }),
  }),
});

export const { useGetFundingAccountsQuery, useCreateFundingAccountMutation } = accountApi;
