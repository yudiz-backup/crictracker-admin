import { gql } from '@apollo/client'

export const GET_COMMENTS = gql`
  query Query($input: commentPaginationInput) {
    listComments(input: $input) {
      aResults {
        dCreated
        dUpdated
        eStatus
        oArticle {
          _id
          sTitle
        }
        oArticleSeo{
          sSlug
        }
        oCreatedBy {
          sUsername
          sFullName
        }
        nReportCount
        sContent
        _id
      }
      nTotal
    }
  }
`

export const GET_FANTASY_COMMENTS = gql`
  query ListFantasyComments($input: oCommentFantasyInput) {
    listFantasyComments(input: $input) {
      aResults {
        dCreated
        dUpdated
        eStatus
        oArticle {
          _id
          sTitle
          oSeo {
            sSlug
          }
        }
        oCreatedBy {
          sUsername
          sFullName
        }
        nReportCount
        sContent
        _id
      }
      nTotal
    }
  }
`

export const GET_COMMENTS_COUNT = gql`
  query GetCommentCounts {
    getCommentCounts {
      nAll
      nApproved
      nPending
      nRejected
      nSpam
      nTrash
    }
  }
`
export const GET_FANTASY_ARTICLE_COMMENTS = gql`
  query GetFantasyCommentCounts {
    getFantasyCommentCounts {
      nAll
      nApproved
      nPending
      nSpam
      nRejected
      nTrash
    }
  }
`
