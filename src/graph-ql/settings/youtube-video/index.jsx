import { gql } from '@apollo/client'

export const GET_PLAYLISTS = gql`
  query GetPlaylists($input: oGetPlaylistsInput) {
    getPlaylists(input: $input) {
      aResults {
        _id
        oCategory {
          _id
          sName
          eType
          oSeo {
            sSlug
          }
        }
        dCreated
        dPublishDate
        dUpdated
        eStatus
        iCategoryId
        sTitle
        oSeo {
          sSlug
        }
      }
      nTotal
    }
  }
`
export const BULK_OPERATION = gql`
  mutation Mutation($input: oBulkPlaylistActionInput) {
    bulkPlaylistUpdate(input: $input) {
      sMessage
    }
  }
`
export const UPDATE_PLAYLIST = gql`
  mutation UpdatePlaylist($input: oUpdatePlaylistInput) {
    updatePlaylist(input: $input) {
      sMessage
    }
  }
`
