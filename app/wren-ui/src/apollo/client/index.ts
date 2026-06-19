import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import errorHandler from '@/utils/errorHandler';
import { apiPath } from '@/utils/url';

const apolloErrorLink = onError((error) => errorHandler(error));

const httpLink = new HttpLink({
  uri: apiPath('/api/graphql'),
});

const client = new ApolloClient({
  link: from([apolloErrorLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;
