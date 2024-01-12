import { gql } from '@apollo/client'
import { fantasyData, fantasyOverviewData } from './mutation'

export const FETCH_FANTASY_TIPS_MATCHES = gql`
  query ListFantasyMatch($input: listFantasyMatchInput) {
    listFantasyMatch(input: $input) {
      aResults {
        _id
        eFetchPriority
        bIsCommentary
        aFantasyTips {
          _id
          ePlatformType
          dCreated
          dPublishDate
          dUpdated
          eState
          iAuthorDId
          iAuthorId
          iReviewerId
          oDisplayAuthor {
            sDisplayName
          }
          oReviewer {
            sUName
          }
        }
        sTitle
        sSubtitle
        oVenue {
          sLocation
        }
        oSeries {
          sTitle
        }
        bFantasyTips
        dStartDate
      }
      nTotal
    }
  }
`

export const GET_FANTASY_ARTICLE = gql`
  query GetFantasyArticle($input: getFantasyArticleInput) {
    getFantasyArticle(input: $input) {
      ${fantasyData}
    }
  }
`
export const GET_FANTASY_PLAYER = gql`
  query ListFantasyPlayer($input: listFantasyPlayerInput) {
    listFantasyPlayer(input: $input) {
      _id
      aFantasyPlayerRating {
        ePlatformType
        nRating
      }
      bTagEnabled
      sLastName
      sFullName
      sFirstName
      sPlayingRole
      sTeamAbbr
      sTeamName
    }
  }
`
export const GET_FANTASY_PLAYER_LIST = gql`
  query ListFantasyPlayersInfo($input: oListFantasyPlayerInfoInput) {
    listFantasyPlayersInfo(input: $input) {
      _id
      eRole
      nRating
      oTeam {
        sAbbr
      }
      oPlayer {
        _id
        sFirstName
        sFullName
        oImg {
          sUrl
          sText
        }
      }
    }
  }
`

export const GET_FANTASY_ARTICLE_COMMENT = gql`
  query ListFantasyArticleComment($input: oListFantasyArticleCommentInput) {
    listFantasyArticleComment(input: $input) {
      aResults {
        _id
        aPic
        dSentDate
        iReceiverId
        iSenderId
        oReceiver {
          _id
          eDesignation
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
export const GET_FANTASY_OVERVIEW_BY_ID = gql`
  query GetMatchOverview($input: getMatchOverviewInput) {
    getMatchOverview(input: $input) {
      ${fantasyOverviewData}
    }
  }
`
export const FETCH_MATCHES_FROM_API = gql`
  query FetchMatchData($input: fetchMatchDataInput) {
    fetchMatchData(input: $input) {
      sMessage
    }
  }
`
