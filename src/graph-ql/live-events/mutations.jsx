import { gql } from '@apollo/client'

export const eventData = `
_id
dEndDate
dPublishDate
iPollId
oPoll {
  _id
  sTitle
  dEndDate
  aSlides {
    _id
    eMediaType
    eSlideType
    oBgImgUrl {
      sUrl
      # sText
    }
    oMediaUrl {
      sUrl
      sText
      sAttribute
    }
    sTitle
    aField {
      _id
      eMediaType
      nVote
      oMediaUrl {
        sUrl
        sText
      }
      sTitle
    }
    nTotalVote
  }
}
oAuthor {
  _id
  sFName
  sUrl
}
eStatus
sTitle
sContent
eType
`

export const ADD_LIVE_BLOG_EVENT = gql`
  mutation AddLiveBlogEvent($input: addLiveBlogEventInput!) {
    addLiveBlogEvent(input: $input) {
      oData {
      _id
      aEditors {
        _id
        sFName
      }
      dCreated
      dEventDate
      dEventEndDate
      oTeams {
        sTeamAovers
        sTeamBovers
        oTeamA {
          sName
          sLogoUrl
          oSecondInningScore {
            sRun
            sWicket
          }
          oFirstInningScore {
            sRun
            sWicket
          }
        }
        oTeamB {
          oSecondInningScore {
            sRun
            sWicket
          }
          oFirstInningScore {
            sRun
            sWicket
          }
          sLogoUrl
          sName
        }
        sScoreSummary
      }
      oAuthor {
        sUrl
        sFName
      }
      sDescription
      sEventName
      sEventStatus
      sLocation
    }
    sMessage
    }
  }
`
export const ADD_LIVE_EVENT_CONTENT = gql`
  mutation AddLiveBlogContent($input: addLiveBlogContentInput!) {
    addLiveBlogContent(input: $input) {
      oData {
        ${eventData}
        eMatchStatus
      }
      sMessage
    }
  }
`

export const UPDATE_MATCH_SCORE = gql`
  mutation UpdateMatchScores($input: updateMatchScoresInput!) {
    updateMatchScores(input: $input) {
      sMessage
      oData {
        _id
        oTeams {
          sTeamAovers
          sTeamBovers
          oTeamA {
            oFirstInningScore {
              sRun
              sWicket
            }
            oSecondInningScore {
              sRun
              sWicket
            }
            sName
            sLogoUrl
          }
          oTeamB {
            oFirstInningScore {
              sRun
              sWicket
            }
            oSecondInningScore {
              sRun
              sWicket
            }
            sLogoUrl
            sName
          }
          sScoreSummary
        }
      }
    }
  }
`

export const ADD_POLL = gql`
mutation AddPoll($input: addPollInput!) {
  addPoll(input: $input) {
    aResults {
      _id
      dCreated
      iEventId
      oPoll {
        _id
        nTotalVote
        aField {
          nVote
          sTitle
        }
        sTitle
      }
      sTitle
      sContent
    }
    sMessage
  }
}
`

export const EDIT_POLL = gql`
mutation EditPoll($input: editPollInput!) {
  editPoll(input: $input) {
    aResults {
      _id
      dCreated
      iEventId
      oPoll {
        _id
        nTotalVote
        aField {
          nVote
          sTitle
        }
        sTitle
      }
      sTitle
      sContent
    }
    sMessage
  }
}
`

export const EDIT_LIVE_EVENT_CONTENT = gql`
mutation EditLiveBlogContent($input: editLiveBlogContentInput!) {
  editLiveBlogContent(input: $input) {
    oData {
      ${eventData}
      eMatchStatus
    }
    sMessage
  }
}
`

export const DELETE_LIVE_EVENT_CONTENT = gql`
mutation DeleteLiveBlogContent($input: getLiveBlogContentInput!) {
  deleteLiveBlogContent(input: $input) {
    sMessage
  }
}
`

export const DELETE_LIVE_EVENT = gql`
mutation BulkDeleteLiveBlogEvent($input: bulkDeleteLiveBlogEventInput!) {
  bulkDeleteLiveBlogEvent(input: $input) {
    sMessage
    aResults {
      _id
      dCreated
      sEventName
    }
  }
}
`

export const EDIT_LIVE_EVENT = gql`
mutation EditLiveBlogEvent($input: editLiveBlogEventInput!) {
  editLiveBlogEvent(input: $input) {
    oData {
      _id
      aEditors {
        _id
        sFName
      }
      dCreated
      dEventDate
      dEventEndDate
      oTeams {
        sTeamAovers
        sTeamBovers
        oTeamA {
          sName
          sLogoUrl
          oSecondInningScore {
            sRun
            sWicket
          }
          oFirstInningScore {
            sRun
            sWicket
          }
        }
        oTeamB {
          oSecondInningScore {
            sRun
            sWicket
          }
          oFirstInningScore {
            sRun
            sWicket
          }
          sLogoUrl
          sName
        }
        sScoreSummary
      }
      oAuthor {
        sUrl
        sFName
      }
      sDescription
      sEventName
      sEventStatus
      sLocation
    }
    sMessage
  }
}
`
export const LIST_LIVE_BLOG_CONTENT = gql`
  query ListLiveBlogContent($input: listLiveBlogContentInput!) {
    listLiveBlogContent(input: $input) {
      oEvent {
        oAuthor {
          _id
          sFName
        }
        aEditors {
          sFName
          _id
        }
        oMatch {
          sTitle
          sSubtitle
          iMatchId
        }
        oTeams {
          sTeamAovers
          sTeamBovers
          oTeamA {
            oFirstInningScore {
              sRun
              sWicket
            }
            oSecondInningScore {
              sRun
              sWicket
            }
            sLogoUrl
            sName
          }
          oTeamB {
            oFirstInningScore {
              sRun
              sWicket
            }
            oSecondInningScore {
              sRun
              sWicket
            }
            sLogoUrl
            sName
          }
          sScoreSummary
        }
      }
      aResults {
        ${eventData}
      }
    }
  }
`
