import { gql } from '@apollo/client'

export const COMMENTARY_SUBSCRIPTION = gql`
subscription Subscription($input: oListCommentariesInput) {
  listMatchCommentaries(input: $input) {
      sCommentary
      sBall
      sOver
      _id
    }
  }
`
