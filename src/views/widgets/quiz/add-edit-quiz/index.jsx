import React, { useContext } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Button, ButtonGroup, Col, Dropdown, Form, Row, Spinner } from 'react-bootstrap'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { FormattedMessage } from 'react-intl'
import { useParams, useHistory } from 'react-router'

import { ADD_QUIZ, EDIT_QUIZ } from 'graph-ql/quiz/mutation'
import { GET_QUIZ_BY_ID } from 'graph-ql/quiz/query'
import FirstSlide from 'shared/components/quiz/firstSlide/input'
import QuizLayout from 'shared/components/quiz/layout'
import ResultSlide from 'shared/components/quiz/resultSlide'
import { QUIZ_SLIDES } from 'shared/lib/quiz-poll'
import { removeTypenameKey } from 'shared/utils'
import { allRoutes } from 'shared/constants/AllRoutes'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'

function AddEditQuiz() {
  const history = useHistory()
  const methods = useForm({ defaultValues: { sButtonText: 'Start Quiz', aQuestions: [QUIZ_SLIDES.sq] } })
  const { handleSubmit, control, reset } = methods
  const { dispatch } = useContext(ToastrContext)
  const id = useParams()?.id

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'aQuestions'
  })

  const [addQuiz, { loading: addLoading }] = useMutation(ADD_QUIZ, {
    onCompleted: (data) => {
      if (data?.addQuiz) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.addQuiz.sMessage, type: TOAST_TYPE.Success }
        })
        history.push(allRoutes.quizList)
      }
    }
  })
  const [editQuiz, { loading: editLoading }] = useMutation(EDIT_QUIZ, {
    onCompleted: (data) => {
      if (data?.editQuiz) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editQuiz.sMessage, type: TOAST_TYPE.Success }
        })
        history.push(allRoutes.quizList)
      }
    }
  })

  useQuery(GET_QUIZ_BY_ID, {
    skip: !id,
    variables: { input: { _id: id } },
    onCompleted: (data) => {
      data?.getQuizById && setFormData(data?.getQuizById)
    }
  })

  function onSubmit(data, eStatus) {
    prepareData(data, eStatus)
  }

  function prepareData(data, eStatus) {
    data.eStatus = eStatus
    data.aQuestions = data?.aQuestions?.map((item) => {
      if (item?.eType === 'vq') {
        item.aQuestions = item.aQuestions.map((q) => {
          const i = Number(q?.aAnswers?.isCorrect || 0)
          q.aAnswers[i].isCorrect = true
          delete q?.aAnswers?.isCorrect
          return q
        })
      } else {
        const i = Number(item?.aAnswers?.isCorrect || 0)
        item.aAnswers[i].isCorrect = true
        delete item?.aAnswers?.isCorrect
      }
      return item
    })
    if (id) {
      data._id = id
      editQuiz({ variables: { input: data } })
    } else {
      addQuiz({ variables: { input: data } })
    }
  }

  function setFormData(data) {
    const d = removeTypenameKey(data)
    d.aQuestions = d?.aQuestions?.map((item) => {
      if (item?.eType === 'vq') {
        item.aQuestions = item?.aQuestions?.map((q) => {
          const correct = q?.aAnswers?.findIndex((e) => e?.isCorrect)?.toString()
          q.aAnswers = q?.aAnswers?.map((ans) => {
            return { ...ans, isCorrect: false }
          })
          q.aAnswers.isCorrect = correct
          return q
        })
        return item
      } else {
        const correct = item?.aAnswers?.findIndex((e) => e?.isCorrect)?.toString()
        item.aAnswers = item?.aAnswers?.map((ans) => {
          return { ...ans, isCorrect: false }
        })
        item.aAnswers.isCorrect = correct
        return item
      }
    })
    reset(d)
  }

  return (
    <FormProvider {...methods}>
      <Form className="d-flex flex-column gap-3" onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col lg={7}>
            <FirstSlide />
            {fields.map((item, index) => (
              <div key={item.eType + index} className="position-relative">
                {fields?.length > 1 && (
                  <Button variant="danger" onClick={() => remove(index)} className="dlt-button p-0 position-absolute">
                    <i className="icon-delete d-block" style={{ fontSize: '20px' }}></i>
                  </Button>
                )}
                <QuizLayout index={index} eType={item?.eType} />
              </div>
            ))}
            <Button className="w-50 mx-auto d-block mt-4" onClick={() => append(QUIZ_SLIDES.sq)}>
              <i className="icon-add me-1" /> <FormattedMessage id="addSlide" />
            </Button>
            <ResultSlide />
            <Dropdown as={ButtonGroup}>
              <Button type="submit" variant="primary" onClick={handleSubmit((d) => onSubmit(d, 'pub'))}>
                <FormattedMessage id={id ? 'save' : 'publish'} /> {id && <FormattedMessage id="changes" />}
                {(addLoading || editLoading) && <Spinner animation="border" size="sm" />}
              </Button>
              <Dropdown.Toggle split variant="primary" />
              <Dropdown.Menu>
                {!id && (
                  <Dropdown.Item onClick={handleSubmit((d) => onSubmit(d, 'dr'))}>
                    <FormattedMessage id="saveDraft" />
                  </Dropdown.Item>
                )}
                <Dropdown.Item onClick={handleSubmit((d) => onSubmit(d, 'd'))}>
                  <FormattedMessage id="delete" />
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
      </Form>
    </FormProvider>
  )
}
export default AddEditQuiz
