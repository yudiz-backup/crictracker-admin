import { gql } from '@apollo/client'

const profile = `
_id
aSLinks {
  eSocialNetworkType
  eStatus
  sDisplayName
  sLink
}
eGender
oKyc {
  sAName
  sANumber
  sIfsc
  sPName
  sUrl
  sBankDetailPic
  sPanNumber
  sBranchName
  sBankName
}
sBio
sEmail
sFName
sNumber
sUName
sUrl
sDisplayName
`

export const GET_PROFILE_DATA = gql`
  query Query {
    getProfile {
      ${profile}
    }
  }
`

export const EDIT_PROFILE = gql`
  mutation EditProfileMutation($input: editProfileInput) {
    editProfile(input: $input) {
      sMessage
      oData {
        ${profile}
      }
    }
  }
`
