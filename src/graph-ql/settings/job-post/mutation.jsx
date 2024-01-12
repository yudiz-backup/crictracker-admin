import { gql } from '@apollo/client'

export const ADD_JOB = gql`
  mutation AddJob($input: addJobInput) {
    addJob(input: $input) {
      sMessage
      oData {
        _id
        dUpdated
        dCreated
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
  }
`

export const EDIT_JOB = gql`
  mutation EditJob($input: editJobInput) {
    editJob(input: $input) {
      sMessage
      oData {
        _id
        dCreated
        eDesignation
        dUpdated
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
  }
`

export const BULK_OPERATION_JOB_POST = gql`
  mutation BulkJobUpdate($input: bulkJobActionInput) {
    bulkJobUpdate(input: $input) {
      sMessage
    }
  }
`
export const BULK_OPERATION_ENQUIRIES = gql`
  mutation BulkEnquiryUpdate($input: bulkEnquiryActionInput) {
    bulkEnquiryUpdate(input: $input) {
      sMessage
    }
  }
`
