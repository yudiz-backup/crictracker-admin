import { gql } from '@apollo/client'
import { tag } from './query'

export const ADD_TAG_MUTATION = gql`
  mutation AddTagMutation($input: addTagInput) {
    addTag(input: $input) {
      sMessage
      oData {
        ${tag}
      }
    }
  }
`

export const EDIT_TAG_MUTATION = gql`
  mutation EditTagMutation($input: editTagInput) {
    editTag(input: $input) {
      sMessage
      oData {
        ${tag}
      }
    }
  }
`

export const DELETE_TAG = gql`
  mutation DeleteTagMutation($input: deleteTag) {
    deleteTag(input: $input) {
      sMessage
    }
  }
`

export const STATUS_TAG = gql`
  mutation UpdateTagStatusMutation($input: updateTagStatus) {
    updateTagStatus(input: $input) {
      sMessage
    }
  }
`

export const BULK_OPERATION = gql`
  mutation BulkTagUpdate($input: bulkTagActionInput) {
    bulkTagUpdate(input: $input) {
      sMessage
    }
  }
`
