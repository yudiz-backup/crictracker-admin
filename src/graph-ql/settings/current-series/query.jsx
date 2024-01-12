import { gql } from '@apollo/client'

export const LIST_CURRENT_SERIES = gql`
  query ListCurrentSeries($input: oListCurrentSeriesInput) {
    listCurrentSeries(input: $input) {
      nTotal
      aResults {
        _id
        oSeries {
          sTitle
        }
        iSeriesId
        nPriority
        bIsSuperPriority
      }
    }
  }
`
export const LIST_CURRENT_ONGOING_SERIES = gql`
  query ListCurrentOngoingSeries($input: oListCurrentOngoingSeriesInput) {
    listCurrentOngoingSeries(input: $input) {
      nTotal
      aResults {
        sTitle
        _id
        oSeo {
          sSlug
        }
      }
    }
  }
`
