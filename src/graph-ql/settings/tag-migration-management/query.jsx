import { gql } from '@apollo/client'

export const GET_MIGRATION_TAGS = gql`
  query GetMigrationTags($input: oGetMigrationPaginationInput) {
    getMigrationTags(input: $input) {
      nTotal
      eType
      aResults {
        _id
        dCreated
        dUpdated
        eStatus
        eType
        iId
        iTermId
        nCount
        sDescription
        sName
        sSlug
        sTaxonomy
        sAssignedName
      }
    }
  }
`
export const LIST_MIGRATION_TAGS_DOCS = gql`
  query GetMigrationTagDocs($input: oGetMigrationTagDocsInput!) {
    getMigrationTagDocs(input: $input) {
      sMessage
      oVenueTag {
        _id
        sName
      }
      oTeamTag {
        _id
        sTitle
      }
      oSimpleTag {
        _id
        sName
      }
      oPlayerTag {
        _id
        sFirstName
      }
      nCount
    }
  }
`

export const GET_MIGRATION_TAGS_COUNT = gql`
  query GetMigrationCounts($input: oGetMigrationCountsInput) {
    getMigrationCounts(input: $input) {
      nV
      nT
      nS
      nP
      nA
    }
  }
`
