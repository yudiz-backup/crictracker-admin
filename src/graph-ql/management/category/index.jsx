import { gql } from '@apollo/client'

const category = `
      _id
      bIsLeague
      dCreated
      dUpdated
      eStatus
      iParentId
      eType
      nCount
      sContent
      sName
      oImg {
        sUrl
        sText
        sCaption
        sAttribute
      }
      oSeries {
        _id
        isBlockedMini
        sTitle
        sSeason
        sSrtTitle
        dStartDate
        dEndDate
      }
      oParentCategory {
        _id
        sName
        oSeo {
          sSlug
        }
        oParentCategory {
          oSeo {
            sSlug
          }
          oParentCategory {
            oSeo {
              sSlug
            }
            oParentCategory {
              oSeo {
                sSlug
              }
              oParentCategory {
                oSeo {
                  sSlug
                }
                oParentCategory {
                  oSeo {
                    sSlug
                  }
                }
              }
            }
          }
        }
      }
      oSeo {
        aKeywords
        eType
        iId
        oFB {
          sUrl
          sDescription
          sTitle
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
      }`

export const ADD_CATEGORY_MUTATION = gql`
  mutation AddCategoryMutation($input: addCategoryInput) {
    addCategory(input: $input) {
      sMessage
      oData {
       ${category}
      }
    }
  }
`

export const EDIT_CATEGORY_MUTATION = gql`
  mutation EditCategoryMutation($input: editCategoryInput) {
    editCategory(input: $input) {
      sMessage
      oData {
       ${category}
      }
    }
  }
`

export const GET_CATEGORY_BY_ID = gql`
  query Query($input: getCategoryById) {
    getCategoryById(input: $input) {
      ${category}      
    }
  }
`

export const GET_CATEGORY_LIST = gql`
  query GetCategory($input: getCategoryInput!) {
    getCategory(input: $input) {
      nTotal
      aResults {
        _id
        dCreated
        dUpdated
        eStatus
        eType
        nCount
        oParentCategory {
          sName
        }
        oSeo {
          sSlug
        }
        oSeries {
          sTitle
        }
        oSubAdmin {
          sFName
        }
        sName
      }
    }
  }
`
export const GET_SERIES_CATEGORY_LIST = gql`
  query GetApiSeriesCategory($input: getApiSeriesCategoryInput!) {
    getApiSeriesCategory(input: $input) {
      _id
      sName
      oSeo {
        sSlug
      }
    }
  }
`

export const DELETE_CATEGORY = gql`
  mutation DeleteCategoryMutation($input: deleteCategory) {
    deleteCategory(input: $input) {
      sMessage
    }
  }
`

export const STATUS_CATEGORY = gql`
  mutation UpdateCategoryStatusMutation($input: updateCategoryStatus) {
    updateCategoryStatus(input: $input) {
      sMessage
    }
  }
`

export const BULK_OPERATION = gql`
  mutation BulkCategoryUpdateMutation($input: bulkCategoryActionInput) {
    bulkCategoryUpdate(input: $input) {
      sMessage
    }
  }
`
export const GET_SERIES_LIST = gql`
  query ListSeries($input: listSeriesInput) {
    listSeries(input: $input) {
      aResults {
        _id
        sTitle
        dStartDate
        dEndDate
        sSeason
      }
      nTotal
    }
  }
`
export const GET_CATEGORY_COUNT = gql`
  query GetCategoryCount {
    getCategoryCount {
      nAS
      nP
      nS
    }
  }
`
