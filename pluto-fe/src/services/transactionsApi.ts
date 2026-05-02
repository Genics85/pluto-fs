import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl } from "./commons";
import type { FundingAccount } from "./accountApi";
import type { Principal } from "./principalsApi";

export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "ALLOCATION" | "RELEASE" | "ADJUSTMENT";

export interface FundingTransaction {
  id: number;
  fundingAccount: FundingAccount;
  amount: number;
  type: TransactionType;
  note: string;
  principal: Principal | null;
  createdAt: string;
}

export interface CreateFundingTransactionRequest {
  accountId: number;
  amount: number;
  type: TransactionType;
  note: string;
  principalId?: number;
}

export const transactionsApi = createApi({
  reducerPath: "transactionsApi",
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ["FundingTransactions"],
  endpoints: (build) => ({
    getTransactionsByAccount: build.query<FundingTransaction[], number>({
      query: (accountId) => `/funding/transactions/by-account/${accountId}`,
      providesTags: (result, _error, accountId) =>
        result
          ? [
              ...result.map((transaction) => ({
                type: "FundingTransactions" as const,
                id: transaction.id,
              })),
              { type: "FundingTransactions", id: `ACCOUNT-${accountId}` },
            ]
          : [{ type: "FundingTransactions", id: `ACCOUNT-${accountId}` }],
    }),
    createFundingTransaction: build.mutation<FundingTransaction, CreateFundingTransactionRequest>({
      query: (transaction) => ({
        url: "/funding/transactions",
        method: "POST",
        body: transaction,
      }),
      invalidatesTags: (_result, _error, { accountId }) => [
        { type: "FundingTransactions", id: "LIST" },
        { type: "FundingTransactions", id: `ACCOUNT-${accountId}` },
      ],
    }),
  }),
});

export const { useGetTransactionsByAccountQuery, useCreateFundingTransactionMutation } = transactionsApi;
