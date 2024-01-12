import gql from 'graphql-tag'
import { newPollData } from './mutation'

export const GET_ALL_POLL = gql`
  query ListPoll($input: listPollInput!) {
    listPoll(input: $input) {
      aPolls {
        _id
        eStatus
        sMatchPollTitle
        sTitle
        # eType
        dStartDate
        dEndDate
        aSlides {
          nTotalVote
        }
      }
      nTotal
    }
  }
`

export const DELETE_POLLS = gql`
  mutation BulkDeletePoll($input: bulkDeletePollInput) {
    bulkDeletePoll(input: $input) {
      sMessage
    }
  }
`

export const GET_HOME_WIDGETS = gql`
  query GetHomeWidgets {
    getHomeWidgets {
      _id
      eType
      mValue {
        _id
        sTitle
      }
      nPriority
      sPosition
    }
  }
`
export const EDIT_HOME_WIDGETS = gql`
  mutation UpdateHomeWidgets($input: [updateHomeWidgetsInput!]!) {
    updateHomeWidgets(input: $input)
  }
`
export const GET_POLL = gql`
  query GetPollById($input: getPollInput!) {
    getPollById(input: $input) {
      ${newPollData}
    }
  }
`
