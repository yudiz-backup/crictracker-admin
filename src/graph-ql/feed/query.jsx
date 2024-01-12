import { gql } from '@apollo/client'

export const GET_DAILY_HUNT_FEED = gql`
  query OCategory {
    getFeedSeriesCategory {
      oCategory {
        # iSeriesId
        _id
        sName
      }
    }
  }
`
