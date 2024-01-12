import { gql } from '@apollo/client'

export const ADD_ADS = gql`
  mutation AddAdsTxt($input: addAdsTxtInput) {
    addAdsTxt(input: $input) {
      sMessage
    }
  }
`
