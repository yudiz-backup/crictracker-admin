import { gql } from '@apollo/client'

export const BULK_OPERATION = gql`
  mutation BulkMigrationTagUpdate($input: oBulkUpdateMigrationTag) {
    bulkMigrationTagUpdate(input: $input) {
      sMessage
    }
  }
`
export const UPDATE_MIGRATION_TAG_TYPE = gql`
  mutation UpdateMigrationTagType($input: oUpdateMigrationTagType) {
    updateMigrationTagType(input: $input) {
      sMessage
    }
  }
`
export const UPDATE_MIGRATION_TAG = gql`
  mutation UpdateMigrationTag($input: oUpdateMigrationTagInput) {
    updateMigrationTag(input: $input) {
      sMessage
    }
  }
`
export const MERGE_TAG = gql`
  mutation MergeTag($input: mergeTagInput) {
    mergeTag(input: $input) {
      sMessage
    }
  }
`

export const CLEAR_SUGGESTED_PLAYER = gql`
  mutation ClearList($input: oClearListInput!) {
    clearList(input: $input) {
      sMessage
    }
  }
`
