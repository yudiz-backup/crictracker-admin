import { gql } from '@apollo/client'

export const ADD_QUIZ = gql`
  mutation AddQuiz($input: addQuizInput) {
    addQuiz(input: $input) {
      oData {
        _id
      }
      sMessage
    }
  }
`

export const EDIT_QUIZ = gql`
  mutation EditQuiz($input: editQuizInput) {
    editQuiz(input: $input) {
      sMessage
    }
  }
`

export const DELETE_QUIZ = gql`
  mutation DeleteQuiz($input: deleteQuizInput) {
    deleteQuiz(input: $input) {
      sMessage
    }
  }
`
