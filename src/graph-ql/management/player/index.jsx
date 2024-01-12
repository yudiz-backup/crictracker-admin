import { gql } from '@apollo/client'

const player = `
  _id
  eTagStatus
  sCountry
  sFirstName
  sContent
  sFullName
  sLastName
  sPlayingRole
  sCountryFull
  sNickName
  dBirthDate
  sBirthPlace
  sBattingStyle
  sBowlingStyle
  sFieldingPosition
  sSex
  oImg {
    sUrl
    sText
    sCaption
    sAttribute
  }
  oSeo {
    _id
    aKeywords
    eStatus
    iId
    eType
    oFB {
      sDescription
      sTitle
      sUrl
    }
    oTwitter {
      sDescription
      sTitle
      sUrl
    }
    sCUrl
    sDescription
    sRobots
    sSlug
    sTitle
  }
`
export const GET_PLAYER_TAGS = gql`
  query ListPlayerTags($input: listPlayerTagsInput) {
    listPlayerTags(input: $input) {
      nTotal
      aResults {
        _id
        bTagEnabled
        sFirstName
        sFullName
        sLastName
        sMiddleName
        eTagStatus
        sPlayingRole
        sCountry
        sCountryFull
        oSeo {
          _id
          sSlug
        }
      }
    }
  }
`
export const GET_PLAYER_BY_ID = gql`
  query GetPlayerById($input: getPlayerByIdInput) {
    getPlayerById(input: $input) {
       ${player}
    }
  }
`

export const EDIT_PLAYER_MUTATION = gql`
  mutation EditPlayer($input: editPlayerInput) {
    editPlayer(input: $input) {
      oData {
      ${player}
      }
      sMessage
    }
  }
`
export const GET_COUNTRY_LIST = gql`
  query Query($input: listCountryInput) {
    listCountry(input: $input) {
      nTotal
      aResults {
        sTitle
        sAbbr
        sISO
      }
    }
  }
`
export const GET_NEW_PLAYER_FROM_API = gql`
  query FetchPlayersFromApi($input: fetchPlayersFromApiInput) {
    fetchPlayersFromApi(input: $input) {
      sMessage
    }
  }
`
export const BULK_OPERATION_PLAYERS = gql`
  mutation BulkUpdateOtherTagMutation($input: bulkUpdateOtherTagInput) {
    bulkUpdateOtherTag(input: $input) {
      sMessage
    }
  }
`
export const BULK_STATUS_UPDATE = gql`
  mutation BulkEnableStatusMutation($input: bulkEnableStatusInput) {
    bulkEnableStatus(input: $input) {
      sMessage
    }
  }
`
export const GET_COUNTS = gql`
  query GetCount($input: oGetCount!) {
    getCount(input: $input) {
      eType
      nAll
      nAp
      nCM
      nP
      nR
      nT
      nUM
    }
  }
`
