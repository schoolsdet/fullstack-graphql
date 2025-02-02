import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import fetch from 'isomorphic-unfetch';
import nextCookies from 'next-cookies';

import { redirect } from './auth';

let apolloClient = null;
const isBrowser = typeof window !== 'undefined';

const createClient = (initialState, { ctx } = {}) => {
  // Links
  const authLink = setContext((_, { headers }) => {
    const { token } = isBrowser
      ? nextCookies()
      : ctx && ctx.req
      ? nextCookies(ctx)
      : {};

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  
  const httpLink = createHttpLink({
    uri: isBrowser ? `${window.location.origin}/api/` : `http://localhost:${process.env.APP_PORT}/`,
    fetch: !isBrowser && fetch,
  });

  const redirectionLink = onError(({ graphQLErrors }) => {
    if (graphQLErrors && graphQLErrors.length > 0) {
      const notLoggedIn = graphQLErrors.some(
        err => err.message === 'NOT_LOGGED_IN',
      );
      if (notLoggedIn) {
        redirect(
          '/unauthorized',
          ctx && ctx.res && !isBrowser ? ctx.res : null,
        );
      }
    }
  });

  // Client
  const client = new ApolloClient({
    connectToDevTools: isBrowser,
    ssrMode: !isBrowser,
    link: ApolloLink.from([authLink, redirectionLink, httpLink]),
    cache: new InMemoryCache().restore(initialState || {}),
  });

  return client;
};

export default function initApollo(initialState, ctx) {
  // New client for every server-side request
  if (!isBrowser) {
    return createClient(initialState, ctx);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = createClient(initialState, ctx);
  }

  return apolloClient;
}
