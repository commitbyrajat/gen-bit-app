import { AppProps } from 'next/app';
import Head from 'next/head';
import { Spin } from 'antd';
import posthog from 'posthog-js';
import apolloClient from '@/apollo/client';
import { GlobalConfigProvider } from '@/hooks/useGlobalConfig';
import { PostHogProvider } from 'posthog-js/react';
import { ApolloProvider } from '@apollo/client';
import { defaultIndicator } from '@/components/PageLoading';
import { AuthProvider } from '@/hooks/useAuth';
import { appPath } from '@/utils/url';

require('../styles/index.less');

Spin.setDefaultIndicator(defaultIndicator);

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Atlas</title>
        <link rel="icon" href={appPath('/favicon.ico')} />
      </Head>
      <AuthProvider>
        <GlobalConfigProvider>
          <ApolloProvider client={apolloClient}>
            <PostHogProvider client={posthog}>
              <main className="app">
                <Component {...pageProps} />
              </main>
            </PostHogProvider>
          </ApolloProvider>
        </GlobalConfigProvider>
      </AuthProvider>
    </>
  );
}

export default App;
