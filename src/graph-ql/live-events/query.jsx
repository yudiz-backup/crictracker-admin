import { gql } from '@apollo/client'
import { eventData } from './mutations'

export const GET_LIVE_EVENTS = gql`
query ListLiveBlogEvents($input: listLiveBlogEventsInput!) {
    listLiveBlogEvents(input: $input) {
      aResults {
        _id
        dCreated
        sEventName
      }
      nTotal
    }
  }
`

export const GET_POLL_BY_ID = gql`
query GetPollById($input: getPollInput!) {
  getPollById(input: $input) {
    _id
    aField {
      nVote
      sTitle
    }
    sTitle
  }
}
`

export const GET_LIVE_EVENT_BY_ID = gql`
query GetLiveBlogEventById($input: oCommonInput) {
  getLiveBlogEventById(input: $input) {
    _id
    aEditors {
      _id
      sFName
    }
    dCreated
    dEventDate
    dEventEndDate
    sEventName
    sDescription
    sEventStatus
    sLocation
    oMatch {
      iMatchId
      sTitle
      sSubtitle
    }
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
      sFName
      _id
    }
  }
}
`

export const LIST_FANTASY_TIPS_MATCH = gql`
query ListMatchFantasyTipsFront($input: oListMatchFantasyTipsFrontInput) {
  listMatchFantasyTipsFront(input: $input) {
    aResults {
      _id
      sTitle
      sSubtitle
    }
  }
}
`
export const LIST_MATCH_FOR_LIVE_EVENT = gql`
  query ListFantasyMatch($input: listFantasyMatchInput) {
    listFantasyMatch(input: $input) {
      aResults {
        _id
        sTitle
        sSubtitle
      }
    }
  }
`

export const GET_LIVE_EVENTS_CONTENT = gql`
query GetLiveBlogContent($input: oCommonInput!) {
  getLiveBlogContent(input: $input) {
    ${eventData}
    eMatchStatus
  }
}
`

export const GET_LIVE_BLOG_BY_ID = gql`
query GetLiveBlog($input: oCommonInput!) {
  getLiveBlog(input: $input) {
    aBlogContent {
      _id
      dCreated
      iEventId
      oPoll {
        _id
        sTitle
        nTotalVote
        aField {
          nVote
          sTitle
        }
      }
      sContent
      sTitle
    }
    oBlogEvent {
      _id
      dCreated
      sEventName
    }
  }
}
`
