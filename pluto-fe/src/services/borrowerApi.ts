import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./commons";
import type { Borrower, AddBorrowerRequest, UpdateBorrowerRequest } from "../types/loan";

export const borrowerApi = createApi({
  reducerPath: "borrowerApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Borrowers"],
  endpoints: (build) => ({
    getBorrowers: build.query<Borrower[], void>({
      query: () => "/borrowers",
      providesTags: (result) =>
        result
          ? [
              ...result.map((user) => ({
                type: "Borrowers" as const,
                id: user.id,
              })),
              { type: "Borrowers", id: "LIST" },
            ]
          : [{ type: "Borrowers", id: "LIST" }],
    }),

    getBorrowerById: build.query<Borrower, number>({
      query: (id) => `/borrowers/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Borrowers", id }],
    }),

    addBorrower: build.mutation<Borrower, AddBorrowerRequest>({
      query: (newBorrower) => ({
        url: "/borrowers",
        method: "POST",
        body: newBorrower,
      }),
      invalidatesTags: [{ type: "Borrowers", id: "LIST" }],
    }),

    updateBorrower: build.mutation<Borrower, UpdateBorrowerRequest>({
      query: ({ id, ...body }) => ({
        url: `/borrowers/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Borrowers", id },
        { type: "Borrowers", id: "LIST" },
      ],
    }),
  }),
});

export const { useGetBorrowersQuery, useGetBorrowerByIdQuery, useAddBorrowerMutation, useUpdateBorrowerMutation } = borrowerApi;
