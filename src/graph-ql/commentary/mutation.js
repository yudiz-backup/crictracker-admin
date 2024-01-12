import { gql } from '@apollo/client'

export const ADD_CUSTOM_COMMENTARY = gql`
mutation AddCustomCommentary($input: oAddCustomCommentaryInput!) {
    addCustomCommentary(input: $input) {
      sMessage
    }
  }
`

export const UPDATE_CUSTOM_COMMENTARY = gql`
mutation EditCustomCommentary($input: oEditCustomCommentaryInput!) {
    editCustomCommentary(input: $input) {
      sMessage
    }
  }
`

export const DELETE_COMMENTARY = gql`
mutation DeleteCustomCommentary($input: oDeleteCustomCommentaryInput!) {
    deleteCustomCommentary(input: $input) {
      sMessage
    }
  }
`
export const CHANGE_COMMENTARY_STATUS = gql`
mutation UpdateMatchCommentaryStatus($input: updateMatchCommentaryStatusInput) {
  updateMatchCommentaryStatus(input: $input) {
    sMessage
  }
}
`
