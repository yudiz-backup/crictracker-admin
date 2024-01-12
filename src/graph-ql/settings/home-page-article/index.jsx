import { gql } from '@apollo/client'

export const GET_SERIES_TAG_HOME_PAGE = gql`
  query GetHomePagePriority {
    getHomePagePriority {
      _id
      iId
      eType
      nSort
      sName
    }
  }
`

export const MAKE_HOME_PAGE_ARTICLE = gql`
  query Query {
    makeHomePageArticle
  }
`

export const UPDATE_SERIES_TAG_HOME_PAGE = gql`
  mutation UpdateHomePagePriority($input: [updateHomePagePriorityInput!]!) {
    updateHomePagePriority(input: $input)
  }
`
