import { gql } from '@apollo/client'
import { articleData } from './mutation'

export const GET_TAG_LIST_ARTICLE = gql`
  query Query($input: getTagsInput) {
    getTags(input: $input) {
      nTotal
      aResults {
        _id
        sName
        eType
        iId
      }
    }
  }
`
export const GET_CATEGORY_LIST_ARTICLE = gql`
  query CategoryList($input: getCategoryInput!) {
    getCategory(input: $input) {
      nTotal
      aResults {
        _id
        sName
        oSeo {
          sSlug
        }
        eType
        oSeries {
          _id
          sSrtTitle
          sTitle
        }
      }
    }
  }
`

export const GET_ARTICLE_DETAIL = gql`
  query GetArticle($input: oGetArticleInput) {
    getArticle(input: $input) {
      ${articleData}
      iEventId
    }
  }
`

export const LIST_ARTICLE = gql`
  query ListArticle($input: getArticleInput) {
    listArticle(input: $input) {
      aResults {
        dCreated
        dUpdated
        _id
        eState
        oCategory {
          sName
        }
        sTitle
        oAuthor {
          sUName
          eDesignation
        }
        oAuthorSeo{
          sSlug
        }
        oSeo {
          aKeywords
          sSlug
        }
        dPublishDate
        oAdvanceFeature {
          bBrandedContent
        }
        bPriority
      }
      nTotal
    }
  }
`
export const COUNT_ARTICLES = gql`
  query ListArticle {
    getArticleCounts {
      nAll
      nChangeRequested
      nChangeSubmitted
      nDraft
      nPending
      nPublished
      nRejected
      nScheduled
      nTrash
      nMine
    }
  }
`

export const GET_ARTICLE_COMMENT = gql`
  query ListArticleComment($input: listArticleCommentInput) {
    listArticleComment(input: $input) {
      aResults {
        _id
        aPic
        dSentDate
        iReceiverId
        iSenderId
        oReceiver {
          eDesignation
          sDisplayName
        }
        oSender {
          eDesignation
          sDisplayName
        }
        sMessage
      }
      nTotal
    }
  }
`

export const GET_DISPLAY_AUTHOR = gql`
  query GetDisplayAuthor($input: getDisplayAuthorInput) {
    getDisplayAuthor(input: $input) {
      aResults {
        _id
        eType
        sFName
        sUName
        sUrl
      }
      nTotal
    }
  }
`

export const GET_GALLERY_IMAGES = gql`
  query GetImages($input: oGetImagesInput) {
    getImages(input: $input) {
      nTotal
      aResults {
        _id
        sUrl
        sText
        sCaption
        sAttribute
        oAuthor {
          sDisplayName
          sUName
        }
        oMeta {
          nWidth
          nHeight
          nSize
        }
        dUpdated
        dCreated
      }
      oRange {
        dMax
        dMin
      }
    }
  }
`

export const LIST_AUTHORS = gql`
  query ListAuthors($input: listAuthorInput) {
    listAuthors(input: $input) {
      aResults {
        sDisplayName
        _id
      }
      nTotal
    }
  }
`
