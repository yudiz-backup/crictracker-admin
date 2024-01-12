import React from 'react'
import PropTypes from 'prop-types'
import { ApolloClient, ApolloProvider, createHttpLink, from, InMemoryCache, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'

import { TOAST_TYPE, API_URL, SUBSCRIPTION_URL } from 'shared/constants'
import { history } from 'App'
import { getMainDefinition } from '@apollo/client/utilities'

const subscriptionUrl = SUBSCRIPTION_URL
const httpLink = createHttpLink({
  uri: API_URL
})

const wsLink = () => {
  return new GraphQLWsLink(
    createClient({
      url: subscriptionUrl
    })
  )
}

const splitLink =
  typeof window === 'undefined' ? httpLink : split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
    },
    wsLink(),
    httpLink
  )

class MyApolloProvider extends React.Component {
  constructor(props) {
    super(props)
    this.middleware = setContext((_, { headers }) => {
      const token = localStorage.getItem('token')
      return {
        headers: {
          ...headers,
          authorization: token && `${token}`,
          language: 'english'
        }
      }
    })

    this.errorLink = onError(({ graphQLErrors, networkError, operation }) => {
      if (graphQLErrors && operation.operationName !== 'GetSeoBySlug' && operation.operationName !== 'GetTagById') {
        graphQLErrors.forEach(({ message, extensions }) => {
          if (extensions?.code === 'UNAUTHENTICATED') {
            // unauthorized
            localStorage.clear()
            sessionStorage.clear()
            history.replace('/')
          }
          this.props.dispatch({
            type: 'SHOW_TOAST',
            payload: { message, type: TOAST_TYPE.Error, btnTxt: 'Close' }
          })
        })
      }
      if (networkError) console.log(`[Network error]: ${networkError}`)
    })

    this.graphqlClient = new ApolloClient({
      link: from([this.errorLink, this.middleware, splitLink]),
      defaultOptions: {
        watchQuery: { fetchPolicy: 'network-only', errorPolicy: 'all' },
        query: { fetchPolicy: 'network-only', errorPolicy: 'all' },
        mutate: { fetchPolicy: 'network-only', errorPolicy: 'all' }
      },
      cache: new InMemoryCache(),
      connectToDevTools: true
    })
  }

  render() {
    return <ApolloProvider client={this.graphqlClient}>{this.props.children}</ApolloProvider>
  }
}
MyApolloProvider.propTypes = {
  children: PropTypes.node,
  dispatch: PropTypes.func,
  logout: PropTypes.func
}
export default MyApolloProvider
