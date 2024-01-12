import { gql } from '@apollo/client'

const roleParams = `
  _id
  aParent {
    _id
    sName
  }
  aPermissions {
    eType
    _id
    eKey
    sTitle
  }
  dUpdated
  sName
`

export const GET_ROLES = gql`
  query getRoles {
    getRoles {
      aResults {
        ${roleParams}
      }
    }
  }
`
export const GET_ROLES_DETAIL = gql`
  query Query($input: getRoleById) {
    getRoleById(input: $input) {
      ${roleParams}
      bIsDefault
    }
  }
`
export const ADD_ROLE = gql`
  mutation AddRoleMutation($sName: String!, $aPermissions: [String]!, $aParent: [String]!) {
    addRole(input: { sName: $sName, aPermissions: $aPermissions, aParent: $aParent }) {
      sMessage
      oData {
        ${roleParams}
        bIsDefault
      }
    }
  }
`
export const EDIT_ROLE = gql`
  mutation Mutation($aParent: [String], $aPermissions: [String], $bIsDefault: Boolean, $id: ID!, $sName: String!) {
    editRole(input: { aParent: $aParent, aPermissions: $aPermissions, bIsDefault: $bIsDefault, _id: $id, sName: $sName }) {
      sMessage
      oData {
        ${roleParams}
        bIsDefault
      }
    }
  }
`
export const DELETE_ROLE = gql`
  mutation DeleteRole($input: deleteRole) {
    deleteRole(input: $input) {
      sMessage
    }
  }
`
export const GET_DEFAULT_ROLE = gql`
  query Query {
    getDefaultRoles {
      _id
      aParent {
        _id
        sName
      }
      aPermissions {
        _id
        eType
        eKey
        sTitle
      }
      dUpdated
      sName
    }
  }
`
