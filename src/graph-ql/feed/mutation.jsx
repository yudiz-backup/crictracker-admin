import { gql } from '@apollo/client'

export const UPDATE_DAILY_HUNT_FEED = gql`
  mutation UpdateFeedSeriesCategory($input: updateFeedSeriesCategoryInput) {
    updateFeedSeriesCategory(input: $input) {
      sMessage
    }
  }
`
