import { gql } from '@apollo/client'

export const FANTASY_ARTICLE_TAKEOVER = gql`
  subscription FantasyArticleTakeOver($input: oArticleTakeOverInput) {
    fantasyArticleTakeOver(input: $input) {
      _id
      sFName
    }
  }
`
export const FANTASY_ARTICLE_TAKEOVER_UPDATE = gql`
  subscription Subscription($input: oArticleTakeOverInput) {
    fantasyArticleTakeOverUpdate(input: $input)
  }
`
