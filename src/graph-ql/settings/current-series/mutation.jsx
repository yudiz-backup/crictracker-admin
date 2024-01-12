import { gql } from '@apollo/client'

export const ADD_CURRENT_SERIES = gql`
  mutation AddCurrentSeries($input: oCurrentSeriesInput) {
    addCurrentSeries(input: $input) {
      sMessage
    }
  }
`
export const UPDATE_SUPER_PRIORITY = gql`
  mutation UpdateSuperPrioritySeriesStatus($input: updateSuperPrioritySeriesStatusInput!) {
    updateSuperPrioritySeriesStatus(input: $input) {
      oData {
        _id
      }
      sMessage
    }
  }
`
