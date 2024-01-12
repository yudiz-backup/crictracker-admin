import { gql } from '@apollo/client'

export const ARTICLE_TAKEOVER = gql`
  subscription Subscription($input: oArticleTakeOverInput) {
    articleTakeOver(input: $input) {
      _id
      sFName
    }
  }
`
export const ARTICLE_TAKEOVER_UPDATE = gql`
  subscription Subscription($input: oArticleTakeOverInput) {
    articleTakeOverUpdate(input: $input)
  }
`
