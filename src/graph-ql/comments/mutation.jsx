import { gql } from '@apollo/client'

export const STATUS_COMMENT = gql`
  mutation UpdateCommentStatus($input: updateCommentInput) {
    updateCommentStatus(input: $input) {
      sMessage
    }
  }
`
export const STATUS_FANTASY_COMMENT = gql`
  mutation UpdateFantasyCommentStatus($input: updateFantasyCommentInput) {
    updateFantasyCommentStatus(input: $input) {
      sMessage
    }
  }
`

export const BULK_STATUS_COMMENT = gql`
  mutation BulkCommentUpdate($input: bulkCommentInput) {
    bulkCommentUpdate(input: $input) {
      sMessage
    }
  }
`
export const BULK_FANTASY_ARTICLE_COMMENT = gql`
  mutation BulkFantasyCommentUpdate($input: bulkFantasyCommentInput) {
    bulkFantasyCommentUpdate(input: $input) {
      sMessage
    }
  }
`
