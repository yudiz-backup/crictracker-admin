import { gql } from '@apollo/client'

export const HEADER_MENU = gql`
  query Results {
    getMenuTree {
      aResults {
        sTitle
        sSlug
        _id
        eMenuType
        eUrlTarget
        sUrl
        bIsMulti
        oChildren {
          _id
          eMenuType
          eUrlTarget
          sSlug
          sTitle
          sUrl
      }
      }
    }
  }
`

export const ADD_HEADER_MENU = gql`
  mutation AddHeaderMenu($input: [headerMenuIpnut!]!) {
    addHeaderMenu(input: $input)
  }
`

export const GET_SLIDER = gql`
  query GetFrontSlider {
    getFrontSlider {
      sSlug
      sName
      oImg {
        sUrl
        sText
        sCaption
        sAttribute
      }
      _id
      aSlide {
        _id
        sName
        sSlug
      }
      dUpdated
      dCreated
      bIsMulti
      eStatus
      nPriority
    }
  }
`

export const ADD_SLIDER = gql`
  mutation AddSlider($input: [oSliderDataInput!]!) {
  addSlider(input: $input)
}
`

export const FOOTER_MENU = gql`
  query GetFrontFooter {
    getFrontFooter {
      eType
      _id
      aResults {
        _id
        sTitle
        sUrl
      }
    }
  }
`
export const ADD_FOOTER_MENU = gql`
  mutation AddFooterMenu($input: [footerMenuIpnut!]!) {
  addFooterMenu(input: $input)
}
`
