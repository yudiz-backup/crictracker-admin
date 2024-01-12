import { gql } from '@apollo/client'

export const storyData = `
_id
sTitle
dCreated
dUpdated
eState
iWPId
nPage
iAuthorId
eVisibility
iAuthorDId
oCoverImg {
  sText
  sUrl
  sCaption
  sAttribute
}
oLogoImg {
  sAttribute
  sCaption
  sText
  sUrl
}
oAuthor {
  sDisplayName
  sFName
  sUrl
}
oDisplayAuthor {
  _id
  sDisplayName
  sFName
  sUrl
}
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
}
`

export const EDIT_STORY = gql`
mutation EditWebStory($input: oEditWebStoryInput) {
  editWebStory(input: $input) {
    oData {
      ${storyData}    
    }
    sMessage
  }
}
`
export const CHANGE_WEB_STORY_AUTHOR = gql`
  mutation EditWebStoryDisplayAuthor($input: oEditWebStoryDisplayAuthorInput) {
    editWebStoryDisplayAuthor(input: $input) {
      sMessage
    }
  }
`

export const UPDATE_STORY_STATUS = gql`
  mutation EditWebStoryStatus($input: oEditWebStoryStatusInput) {
    editWebStoryStatus(input: $input) {
      sMessage
    }
  }
`
