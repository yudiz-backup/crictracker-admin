import { gql } from '@apollo/client'

export const GET_COMMENTARY_BY_ID = gql`
query ListMatchCommentariesV2($input: oListMatchCommentaryFrontInputV2) {
  listMatchCommentariesV2(input: $input) {
    sCommentary
    sBall
    sOver
    _id
    nTimestamp
    eEvent
  }
}
`
