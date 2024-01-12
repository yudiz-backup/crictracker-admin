import { gql } from '@apollo/client'

export const GET_MINISCORECARD_CATEGORY_PRIORITY = gql`
  query GetMiniScoreCardPriority {
    getMiniScoreCardPriority {
      _id
      iSeriesId
      sTitle
      nPriority
      sSrtTitle
    }
  }
`

export const UPDATE_SERIES_PRIORITY = gql`
  mutation UpdateMiniScoreCardPriority($input: [updateMiniScoreCardPriorityInput]) {
    updateMiniScoreCardPriority(input: $input)
  }
`
