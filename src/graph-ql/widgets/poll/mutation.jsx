import { gql } from '@apollo/client'

export const newPollData = `
_id
eStatus
dEndDate
dStartDate
sTitle
aSlides {
  _id
  eMediaType
  nTotalVote
  aField {
    _id
    eMediaType
    nVote
    oMediaUrl {
      sCaption
      sAttribute
      sText
      sUrl
    }
    sTitle
  }
  eSlideType
  oBgImgUrl {
    sCaption
    sAttribute
    sText
    sUrl
  }
  oMediaUrl {
    sCaption
    sAttribute
    sText
    sUrl
  }
  sTitle
}
`

export const ADD_NEW_POLL = gql`
  mutation AddPoll($input: addPollInput!) {
    addPoll(input: $input) {
      sMessage
      oData {
        ${newPollData}
      }
    }
  }
`

export const EDIT_NEW_POLL = gql`
  mutation EditPoll($input: editPollInput!) {
    editPoll(input: $input) {
       sMessage
       oData {
        ${newPollData}
      }
    }
  }
`
