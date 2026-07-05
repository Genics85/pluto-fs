import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./commons";

export interface Principal {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrincipalRequest {
  name: string;
  email: string;
  phone: string;
}

export const principalsApi = createApi({
  reducerPath: "principalsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Principals"],
  endpoints: (build) => ({
    getPrincipals: build.query<Principal[], void>({
      query: () => "/principals",
      providesTags: (result) =>
        result
          ? [
              ...result.map((principal) => ({
                type: "Principals" as const,
                id: principal.id,
              })),
              { type: "Principals", id: "LIST" },
            ]
          : [{ type: "Principals", id: "LIST" }],
    }),
    createPrincipal: build.mutation<Principal, CreatePrincipalRequest>({
      query: (newPrincipal) => ({
        url: "/principals",
        method: "POST",
        body: newPrincipal,
      }),
      invalidatesTags: [{ type: "Principals", id: "LIST" }],
    }),
  }),
});

export const { useGetPrincipalsQuery, useCreatePrincipalMutation } = principalsApi;
