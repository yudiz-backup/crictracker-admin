import { gql } from '@apollo/client'

export const articleData = `
  _id
  aPlayer {
    _id
    sName
  }
  aSecCategories
  oSticky {
    bHome
  }
  aSeries {
    sName
    eType
    _id
  }
  aTags {
    _id
    sName
  }
  aTeam {
    _id
    sName
  }
  aVenue {
    _id
    sName
  }
  aPoll {
    _id
    sTitle
    sMatchPollTitle
  }
  aQuiz {
    _id
    sTitle
  }
  aPollId
  bOld
  bPriority
  nCommentCount
  dPublishDate
  dPublishDisplayDate
  dUpdated
  eState
  eVisibility
  iAuthorDId
  iAuthorId
  iCategoryId
  iReviewerId
  nDuration
  oAdvanceFeature {
    bAllowLike
    bAllowComments
    bAmp
    bBrandedContent
    bEditorsPick
    bExclusiveArticle
    bFBEnable
    bRequireAdminApproval
  }
  oAuthor {
    sDisplayName
    sFName
    sUrl
  }
  oCategory {
    _id
    sName
    oSeo {
      sSlug
    }
  }
  oDisplayAuthor {
    _id
    sDisplayName
    sFName
    sUrl
    aSLinks {
      eSocialNetworkType
      sLink
    }
    oSeo {
      sSlug
    }
  }
  oImg {
    sUrl
    sText
    sCaption
    sAttribute
  }
  oReviewer {
    sFName
    sUrl
    sDisplayName
  }
  oTImg {
    sUrl
    sText
    sCaption
    sAttribute
  }
  sContent
  sDescription
  sEditorNotes
  sSrtTitle
  sTitle
  sSubtitle
  oSeo {
    aKeywords
    eType
    iId
    oFB {
      sUrl
      sTitle
      sDescription
    }
    oTwitter {
      sUrl
      sTitle
      sDescription
    }
    sCUrl
    sDescription
    sRobots
    sSlug
    sTitle
    eSchemaType
  }
  dCreated
  nViewCount
`

export const CREATE_ARTICLE = gql`
  mutation CreateArticleMutation($input: oCreateArticleInput) {
    createArticle(input: $input) {
      sMessage
      oData {
        ${articleData}
      }
    }
  }
`
export const EDIT_ARTICLE = gql`
  mutation EditArticle($input: oEditArticleInput) {
    editArticle(input: $input) {
      sMessage
      oData {
        ${articleData}
      }
    }
  }
`

export const AUTO_SAVE_ARTICLE = gql`
  mutation AutoSaveArticle($input: oAutoSaveArticleInput) {
    autoSaveArticle(input: $input) {
      oData {
        ${articleData}
      }
    }
  }
`

export const UPDATE_PICK_ARTICLE = gql`
  mutation UpdatePickArticleData($input: oEditArticleInput) {
    updatePickArticleData(input: $input) {
      sMessage
      oData {
        ${articleData}
      }
    }
  }
`

export const PICK_ARTICLE = gql`
  mutation PickArticle($input: oPickArticleInput) {
    pickArticle(input: $input) {
      sMessage
    }
  }
`

export const CREATE_ARTICLE_COMMENT = gql`
  mutation CreateArticleComment($input: oCreateArticleCommentInput) {
    createArticleComment(input: $input) {
      sMessage
    }
  }
`
export const CHANGE_DISPLAY_AUTHOR = gql`
  mutation EditDisplayAuthor($input: editDisplayAuthorInput) {
    editDisplayAuthor(input: $input) {
      sMessage
    }
  }
`
export const GENERATE_PREVIEW_TOKEN = gql`
  query GenerateTokenFront($input: oGenerateTokenFrontInput) {
    generateTokenFront(input: $input) {
      sMessage
      oData {
        sToken
      }
    }
  }
`
export const UPDATE_ARTICLE_STATUS = gql`
  mutation UpdateArticleStatus($input: oUpdateArticleStatusInput!) {
    updateArticleStatus(input: $input) {
      sMessage
    }
  }
`

export const INSERT_IMAGE = gql`
  mutation InsertImage($input: [insertImageInput]!) {
    insertImage(input: $input) {
      sMessage
    }
  }
`

export const EDIT_IMAGE = gql`
  mutation EditImage($input: editImageInput!) {
    editImage(input: $input) {
      sMessage
    }
  }
`

export const DELETE_IMAGE = gql`
  mutation DeleteImage($input: deleteImageInput!) {
    deleteImage(input: $input) {
      sMessage
    }
  }
`
