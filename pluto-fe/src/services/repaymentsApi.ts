import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Repayment } from "../types/loan";
import { baseUrl } from "./commons";

interface UpdateRepaymentStatusRequest {
  repaymentStatus: "PAID" | "PENDING" | "OVERDUE";
}

export const repaymentsApi = createApi({
  reducerPath: "repaymentsApi",
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ["Repayments"],
  endpoints: (build) => ({
    getRepaymentsByLoan: build.query<Repayment[], number | string>({
      query: (loanId) => `/repayments/by-loan/${loanId}`,
      providesTags: (result, _error, loanId) =>
        result
          ? [
              ...result.map((repayment) => ({
                type: "Repayments" as const,
                id: repayment.id,
              })),
              { type: "Repayments", id: `LOAN-${loanId}` },
            ]
          : [{ type: "Repayments", id: `LOAN-${loanId}` }],
    }),
    updateRepaymentStatus: build.mutation<Repayment, { id: number; status: UpdateRepaymentStatusRequest }>({
      query: ({ id, status }) => ({
        url: `/repayments/${id}/status`,
        method: "POST",
        body: status,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Repayments", id },
        { type: "Repayments", id: "LOAN-*" },
      ],
    }),
  }),
});

export const { useGetRepaymentsByLoanQuery, useUpdateRepaymentStatusMutation } = repaymentsApi;
