import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { onError } from "@apollo/client/link/error"

// GraphQL endpoint
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8080/query"

// HTTP link
const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
})

// Auth link - tự động thêm token và semester vào headers
const authLink = setContext(async (_, { headers }) => {
  // Lấy token từ backend API (localStorage)
  let token: string | null = null
  let semesterId: string | null = null
  
  if (typeof window !== "undefined") {
    try {
      // Lấy access token từ localStorage và tự động refresh nếu cần
      const { getValidAccessToken } = await import("@/lib/api/auth")
      token = await getValidAccessToken()
      
      // Lấy semester ID từ localStorage (được set bởi semester context)
      semesterId = localStorage.getItem("currentSemesterId")
    } catch (error) {
      console.error("Error getting auth token:", error)
    }
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
      "x-semester": semesterId || "",
    },
  }
})

// Error link - xử lý lỗi GraphQL
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    })
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
    // Có thể xử lý các trường hợp như 401, 403, etc.
    if ("statusCode" in networkError && networkError.statusCode === 401) {
      // Redirect to login hoặc refresh token
    }
  }
})

// Tạo Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    // Cấu hình cache nếu cần
    typePolicies: {
      // Ví dụ: cấu hình cache cho từng type
      // Query: {
      //   fields: {
      //     // Merge policy cho arrays
      //     posts: {
      //       merge(existing = [], incoming) {
      //         return [...existing, ...incoming]
      //       },
      //     },
      //   },
      // },
    },
  }),
  // Bật SSR support cho Next.js
  ssrMode: typeof window === "undefined",
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
})

