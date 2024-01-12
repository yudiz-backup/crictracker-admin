import { gql } from '@apollo/client'

const cms = `
  _id
  dCreated
  dUpdated
  eStatus
  sContent
  sTitle
  oSeo {
    _id
    aKeywords
    eStatus
    eType
    iId
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

export const LIST_CMS = gql`
  query ListCMSPage($input: oListCMSPageInput) {
    listCMSPage(input: $input) {
      aResults {
        dCreated
        dUpdated
        oSeo {
          sSlug
        }
        sTitle
        eStatus
        _id
      }
      nTotal
    }
  }
`
export const GET_CMS_BY_ID = gql`
  query GetCMSPageById($input: oGetCmsById!) {
    getCMSPageById(input: $input) {
      ${cms}
    }
  }
`
export const ADD_CMS = gql`
  mutation AddCMSPage($input: oCmsInput) {
    addCMSPage(input: $input) {
      sMessage
      oData {
        ${cms}
      }
    }
  }
`
export const EDIT_CMS = gql`
  mutation EditCMSPage($input: oEditCmsInput) {
    editCMSPage(input: $input) {
      sMessage
      oData {
        ${cms}
      }
    }
  }
`

export const BULK_OPERATION = gql`
  mutation BulkUpdateCMSPage($input: oBulkUpdateCMSInput) {
    bulkUpdateCMSPage(input: $input) {
      sMessage
    }
  }
`
