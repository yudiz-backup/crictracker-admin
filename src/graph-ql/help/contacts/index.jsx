import { gql } from '@apollo/client'

export const GET_CONTACTS_LIST = gql`
  query GetContacts($input: getContactInput!) {
    getContacts(input: $input) {
      aResults {
        _id
        eQueryType
        sEmail
        sName
        sSubject
        eStatus
        dCreated
      }
      nTotal
    }
  }
`

export const GET_CONTACT_BY_ID = gql`
  query GetContacts($input: getContactById) {
    getContactById(input: $input) {
      _id
      eQueryType
      sCity
      sCompany
      sEmail
      sMessage
      sName
      sPhone
      sSubject
    }
  }
`

export const DELETE_CONTACT = gql`
  mutation DeleteContact($input: deleteContact) {
    deleteContact(input: $input) {
      sMessage
    }
  }
`
export const BULK_OPERATION = gql`
  mutation BulkContactDelete($input: bulkContactActionInput) {
    bulkContactDelete(input: $input) {
      sMessage
    }
  }
`
