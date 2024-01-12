import { gql } from '@apollo/client'

export const GET_JOBS = gql`
  query GetJobs($input: getJobInput!) {
    getJobs(input: $input) {
      nTotal
      aResults {
        _id
        dCreated
        dUpdated
        eDesignation
        eOpeningFor
        eStatus
        fExperienceFrom
        fSalaryFrom
        fExperienceTo
        fSalaryTo
        nEnquiryCount
        oLocation {
          sTitle
          _id
        }
        nOpenPositions
        sDescription
        oSeo {
          _id
          sSlug
        }
        sTitle
      }
    }
  }
`
export const GET_JOB_BY_ID = gql`
  query GetJobById($input: getJobById) {
    getJobById(input: $input) {
      _id
      dCreated
      oSeo {
        _id
        sTitle
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
      }
      dUpdated
      eDesignation
      eOpeningFor
      eStatus
      fExperienceFrom
      fExperienceTo
      fSalaryFrom
      fSalaryTo
      nEnquiryCount
      nOpenPositions
      oLocation {
        sTitle
        _id
      }
      sDescription
      sTitle
    }
  }
`

export const GET_ENQUIRIES = gql`
  query GetEnquiries($input: getEnquiryInput!) {
    getEnquiries(input: $input) {
      nTotal
      aResults {
        _id
        dCreated
        eStatus
        oJobData {
          sTitle
          eDesignation
          _id
        }
        # oPreferredLocation {
        #   sTitle
        #   _id
        # }
        # sCurrentCTC
        # sCurrentLocation
        sReference
        sCurrentEmployer
        sEmail
        # sExpectedCTC
        sFullName
        # sMessage
        sPhone
        # sTotalExperience
        # sUploadSample
        sUploadCV
      }
    }
  }
`
export const GET_ENQUIRY_BY_ID = gql`
  query GetEnquiryById($input: getEnquiryById) {
    getEnquiryById(input: $input) {
      _id
      dCreated
      oJobData {
        sTitle
        eDesignation
        _id
      }
      oPreferredLocation {
        sTitle
        _id
      }
      sCurrentCTC
      sCurrentEmployer
      sCurrentLocation
      sEmail
      sExpectedCTC
      sFullName
      sMessage
      sReference
      sTotalExperience
      sPhone
      sUploadCV
    }
  }
`

export const GET_LOCATIONS = gql`
  query GetLocations {
    getLocations {
      sTitle
      _id
    }
  }
`

export const GET_CAREER_COUNTS = gql`
  query GetCountsCareer($input: oGetCountsCareer!) {
    getCountsCareer(input: $input) {
      nJP
      nER
    }
  }
`
