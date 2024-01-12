import { gql } from '@apollo/client'
import { storyData } from './mutation'

export const LIST_WEB_STORY = gql`
  query ListWebStory($input: listWebStoryInputAdmin) {
    listWebStory(input: $input) {
      aWebStory {
        _id
        dCreated
        dUpdated
        eState
        iWPId
        oCoverImg {
          sText
          sUrl
        }
        sTitle
      }
      nTotal
    }
  }
`

export const GET_WEB_STORY_BY_ID = gql`
query GetWebStory($input: getWebStoryFront) {
  getWebStory(input: $input) {
       ${storyData}
  }
}
`
export const UPDATE_WEB_STORY = gql`
  query FetchWebStory($input: fetchWebStoryInput) {
    fetchWebStory(input: $input) {
      sMessage
    }
  }
`
