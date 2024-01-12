import { gql } from '@apollo/client'

export const GET_QUIZ_BY_ID = gql`
  query GetQuizById($input: getQuizByIdInput) {
    getQuizById(input: $input) {
      # _id
      sTitle
      sButtonText
      oResSlide {
        sMidText
        sLowText
        sHighText
        oBgImgUrl {
          sAttribute
          sCaption
          sText
          sUrl
        }
      }
      oBgImgUrl {
        sUrl
        sText
        sCaption
        sAttribute
      }
      eStatus
      aQuestions {
        _id
        sQuestion
        oMediaUrl {
          sUrl
          sText
          sCaption
          sAttribute
        }
        oBgImgUrl {
          sUrl
          sText
          sCaption
          sAttribute
        }
        # nTotalVote
        eType
        eMediaType
        aPausePoint
        aAnswers {
          _id
          sAnswer
          oMediaUrl {
            sUrl
            sText
            sCaption
            sAttribute
          }
          nVote
          isCorrect
          eMediaType
        }
        aQuestions {
          _id
          eType
          # nTotalVote
          sQuestion
          aAnswers {
            _id
            sAnswer
            eMediaType
            isCorrect
            nVote
            oMediaUrl {
              sUrl
              sText
              sCaption
              sAttribute
            }
          }
        }
      }
    }
  }
`

export const LIST_QUIZ = gql`
  query ListQuiz($input: listQuizInput) {
    listQuiz(input: $input) {
      nTotal
      aQuiz {
        eStatus
        _id
        sTitle
      }
    }
  }
`
