import { gql } from '@apollo/client'

export const GET_FEEDBACKS_LIST = gql`
  query GetFeedbacks($input: getFeedbackInput!) {
    getFeedbacks(input: $input) {
      nTotal
      aResults {
        _id
        sName
        eQueryType
        sSubject
        sEmail
        eStatus
        dCreated
      }
    }
  }
`

export const GET_FEEDBACK_BY_ID = gql`
  query GetFeedbacks($input: getFeedbackById) {
    getFeedbackById(input: $input) {
      _id
      eQueryType
      sEmail
      sMessage
      sName
      sPageLink
      sPhone
      sSubject
    }
  }
`

export const DELETE_FEEDBACK = gql`
  mutation Mutation($input: deleteFeedback) {
    deleteFeedback(input: $input) {
      sMessage
    }
  }
`
export const BULK_OPERATION = gql`
  mutation BulkFeedbackDelete($input: bulkFeedbackActionInput) {
    bulkFeedbackDelete(input: $input) {
      sMessage
    }
  }
`
