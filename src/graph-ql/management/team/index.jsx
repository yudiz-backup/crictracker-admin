import { gql } from '@apollo/client'

const team = `
      _id
      bTagEnabled
      eProvider
      eTagStatus
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
      sAbbr
      sAltName
      sCountry
      sCountryFull
      sTeamKey
      sTeamType
      sTitle
      oImg {
      sUrl
      sText
      sCaption
      sAttribute
      }
`
export const GET_TEAM_TAGS = gql`
  query Query($input: listTeamTagsInput) {
    listTeamTags(input: $input) {
      aResults {
        _id
        bTagEnabled
        eProvider
        eTagStatus
        sAbbr
        sAltName
        sCountry
        sCountryFull
        sTeamKey
        sTeamType
        sTitle
        oSeo {
          _id
          sSlug
        }
      }
      nTotal
    }
  }
`
export const GET_TEAM_BY_ID = gql`
  query GetTeamById($input: oGetTeamByIdInput) {
    getTeamById(input: $input) {
      ${team}
    }
  }
`
export const EDIT_TEAM_MUTATION = gql`
  mutation EditTeam($input: oEditTeamInput) {
    editTeam(input: $input) {
      sMessage
      oData {
      ${team}
      }
    }
  }
`
