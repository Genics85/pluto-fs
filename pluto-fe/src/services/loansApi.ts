import { createApi } from "@reduxjs/toolkit/query/react";
import type { Loan, LoanAddRequest, LoanWithSchedule } from "../types/loan";
import { baseQueryWithAuth } from "./commons";

export type LoanStatus = "ACTIVE" | "PAID" | "DEFAULTED" | "CANCELLED";

export interface UpdateLoanStatusRequest {
  status: LoanStatus;
}

export const loansApi = createApi({
  reducerPath: "loansApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Loans"],
  endpoints: (build) => ({
    getLoans: build.query<Loan[], void>({
      query: () => "/loans",
      providesTags: (result) =>
        result
          ? [
              ...result.map((loan) => ({
                type: "Loans" as const,
                id: loan.id,
              })),
              { type: "Loans", id: "LIST" },
            ]
          : [{ type: "Loans", id: "LIST" }],
    }),

    getLoanById: build.query<LoanWithSchedule, number | string>({
      query: (id) => `/loans/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Loans", id }],
    }),

    addLoan: build.mutation<Loan, LoanAddRequest>({
      query: (newLoan) => ({
        url: "/loans",
        method: "POST",
        body: newLoan,
      }),
      invalidatesTags: [{ type: "Loans", id: "LIST" }],
    }),

    updateLoanStatus: build.mutation<Loan, { id: number; status: UpdateLoanStatusRequest }>({
      query: ({ id, status }) => ({
        url: `/loans/${id}/status`,
        method: "POST",
        body: status,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Loans", id },
        { type: "Loans", id: "LIST" },
      ],
    }),
  }),
});

export const { useGetLoansQuery, useGetLoanByIdQuery, useAddLoanMutation, useUpdateLoanStatusMutation } = loansApi;
