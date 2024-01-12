import { gql } from '@apollo/client'

export const fantasyData = `
_id
sVideoUrl
sTitle
sSubtitle
sSrtTitle
sMatchPreview
sMustPick
sEditorNotes
nCommentCount
dPublishDisplayDate
aPoll {
  _id
  sTitle
}
aQuiz {
  _id
  sTitle
}
oTImg {
  sCaption
  sAttribute
  sText
  sUrl
}
oSeo {
  sDescription
  sCUrl
  oTwitter {
    sUrl
    sTitle
    sDescription
  }
  sRobots
  sSlug
  sTitle
  oFB {
    sUrl
    sTitle
    sDescription
  }
  iId
  eType
  eStatus
  aKeywords
  _id
  eSchemaType
}
oReviewer {
  sUrl
  sFName
  sDisplayName
}
oOtherInfo {
  sExpertAdvice
}
oImg {
  sCaption
  sAttribute
  sText
  sUrl
}
oAdvanceFeature {
  bAllowComments
  bAmp
  bImp
  bBrandedContent
  bEditorsPick
  bExclusiveArticle
  bFBEnable
  bRequireAdminApproval
  bPitchReport
  bTeamForm
  bPlayerStats
}
iReviewerId
iMatchId
iAuthorId
iAuthorDId
eVisibility
eState
oDisplayAuthor {
  _id
  sUrl
  sFName
  sDisplayName
}
oAuthor {
  sUrl
  sFName
  sDisplayName
  _id
}
ePlatformType
dPublishDate
bPriority
aVenue
oMatch {
  oTeamScoreA {
    oTeam {
      sAbbr
      _id
    }
  }
  oTeamScoreB {
    oTeam {
      sAbbr
      _id
    }
  }
}
aVenueTag {
  _id
  sName
}
oCategory {
  sName
  _id
  oSeo {
    sSlug
  }
}
aSeriesCategory {
  _id
  sName
}
aTeamTag {
  _id
  sName
}
aTagsData {
  _id
  sName
}
aPlayerTag {
  _id
  sName
}
iCategoryId
aCVCFan {
  eType
  sDescription
  oPlayerFan {
    _id
    oPlayer {
      sFirstName
      sFullName
    }
  }
}
aTopicPicksFan {
  sDescription
  oPlayerFan {
    _id
    oPlayer {
      sFirstName
      sFullName
    }
  }
}
aBudgetPicksFan {
  sDescription
  oPlayerFan {
    _id
    oPlayer {
      sFirstName
      sFullName
    }
  }
}
aAvoidPlayerFan {
  sDescription
  oPlayerFan {
    _id
    oPlayer {
      sFirstName
      sFullName
    }
  }
}
aLeague {
  eLeague
  aTeam {
    aSelectedPlayerFan {
      _id
    }
    oCapFan {
      _id
    }
    oVCFan {
      _id
    }
    oTPFan {
      _id
    }
    oTeamA {
      nCount
      oTeam {
        sAbbr
        _id
      }
    }
    oTeamB {
      nCount
      oTeam {
        sAbbr
        _id
      }
    }
  }
}
dCreated
nViewCount
`
export const fantasyOverviewData = `
  oMatch {
    _id
    bIsDomestic
    dEndDate
    dStartDate
    sFormatStr
    sReferee
    sStatusStr
    sSubtitle
    sTitle
    sUmpires
    oTeamA {
      sTitle
      oImg {
          sAttribute
          sCaption
          sText
          sUrl
        }
      sAbbr
      _id
    }
    oTeamB {
      sTitle
      oImg {
          sAttribute
          sCaption
          sText
          sUrl
        }
      sAbbr
      _id
    }
    oVenue {
      sName
      sLocation
    }
    oSeries {
      _id
      sTitle
    }
  }
  oOverview {
    _id
    aCricPrediction {
      ePlatformType
      _id
    }
    oSeo {
      _id
      aKeywords
      eStatus
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
    oTeam1 {
      aPlayers {
        _id
        sFirstName
        sPlayingRole
      }
      iC
      iTeamId
      iVC
      iWK
    }
    oTeam2 {
      aPlayers {
        _id
        sPlayingRole
        sFirstName
      }
      iC
      iTeamId
      iVC
      iWK
    }
    oWinnerTeam {
      _id
      sTitle
    }
    sMatchPreview
    sNews
    sOutFieldCondition
    sPitchCondition
    sAvgScore
    sPitchReport
    sBroadCastingPlatform
    sLiveStreaming
    nPaceBowling
    nSpinBowling
    nBattingPitch
    nBowlingPitch
    sWeatherCondition
    sWeatherReport
  }
`

export const FANTASY_TIPS_STATUS = gql`
  mutation UpdateFantasyTipsStatus($input: updateFantasyTipsStatusInput) {
    updateFantasyTipsStatus(input: $input) {
      sMessage
    }
  }
`

export const FANTASY_TIPS_PRIORITY = gql`
  mutation UpdateMatchPriority($input: updateMatchPriorityInput!) {
    updateMatchPriority(input: $input) {
      sMessage
    }
  }
`

export const CREATE_FANTASY_ARTICLE = gql`
  mutation CreateFantasyArticle($input: oCreateFantasyArticleInput) {
    createFantasyArticle(input: $input) {
      sMessage
      oData {
        iMatchId
        ePlatformType
        _id
      }
    }
  }
`

export const COPY_FANTASY_ARTICLE = gql`
  mutation CopyFantasyArticle($input: copyFantasyArticleInput) {
    copyFantasyArticle(input: $input) {
      sMessage
      oData {
        _id
        ePlatformType
      }
    }
  }
`

export const EDIT_FANTASY_ARTICLE = gql`
  mutation EditFantasyArticle($input: editFantasyArticleInput) {
    editFantasyArticle(input: $input) {
      sMessage
      oData {
        ${fantasyData}
      }
    }
  }
`

export const UPDATE_FANTASY_PICK_ARTICLE = gql`
mutation UpdatePickFantasyArticleData($input: editFantasyArticleInput) {
  updatePickFantasyArticleData(input: $input) {
      sMessage
      oData {
        ${fantasyData}
      }
    }
  }
`

export const CHANGE_FANTASY_DISPLAY_AUTHOR = gql`
  mutation EditFantasyDisplayAuthor($input: editFantasyDisplayAuthorInput) {
    editFantasyDisplayAuthor(input: $input) {
      sMessage
    }
  }
`

export const PICK_FANTASY_ARTICLE = gql`
  mutation PickFantasyArticle($input: pickFantasyArticleInput) {
    pickFantasyArticle(input: $input) {
      sMessage
    }
  }
`

export const CREATE_FANTASY_ARTICLE_COMMENT = gql`
  mutation CreateFantasyArticleComment($input: oCreateFantasyArticleCommentInput) {
    createFantasyArticleComment(input: $input) {
      sMessage
    }
  }
`

export const DELETE_FANTASY_ARTICLE = gql`
  mutation DeleteFantasyArticle($input: deleteFantasyArticleInput) {
    deleteFantasyArticle(input: $input) {
      sMessage
    }
  }
`
export const EDIT_FANTASY_OVERVIEW = gql`
  mutation EditMatchOverview($input: editMatchOverviewInput) {
    editMatchOverview(input: $input) {
      sMessage
      oData {
        ${fantasyOverviewData}
      }
    }
  }
`

export const EDIT_PLAYER_RATING = gql`
  mutation EditPlayerRating($input: editPlayerRatingInput) {
    editPlayerRating(input: $input) {
      sMessage
    }
  }
`

export const CHANGE_FANTASY_ARTICLE_STATUS = gql`
  mutation UpdateFantasyArticleStatus($input: oUpdateFantasyArticleStatus!) {
    updateFantasyArticleStatus(input: $input) {
      sMessage
    }
  }
`
