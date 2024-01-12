import React, { useContext, useEffect, useState } from 'react'
import { Form, Row, Col, Button } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'
import { useMutation, useLazyQuery } from '@apollo/client'
import { confirmAlert } from 'react-confirm-alert'
import { useIntl, FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'

import { GET_FEEDBACK_BY_ID, DELETE_FEEDBACK } from 'graph-ql/help/feedbacks'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { allRoutes } from 'shared/constants/AllRoutes'
import CustomAlert from 'shared/components/alert'
import PermissionProvider from 'shared/components/permission-provider'
import { feedbackQueryType } from 'shared/utils'

function DetailFeedback({ id }) {
  const history = useHistory()
  const [feedbackData, setFeedbackData] = useState({})
  const { dispatch } = useContext(ToastrContext)
  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }
  const [getFeedback] = useLazyQuery(GET_FEEDBACK_BY_ID, {
    onCompleted: (data) => {
      if (data && data.getFeedbackById) {
        setFeedbackData(data.getFeedbackById)
      }
    }
  })

  const [delAction] = useMutation(DELETE_FEEDBACK, {
    onCompleted: (data) => {
      if (data && data.deleteFeedback) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.deleteFeedback.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  useEffect(() => {
    id && getFeedback({ variables: { input: { _id: id } } })
  }, [id])

  function handleDelete(id) {
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.confirmationMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            const { data } = await delAction({ variables: { input: { _id: id } } })
            data && history.push(allRoutes.feedbacks)
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }
  return (
    <>
      <Row>
        <Col sm="4">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="name" />
            </Form.Label>
            <Form.Control disabled type="text" name="sName" defaultValue={feedbackData?.sName} />
          </Form.Group>
        </Col>
        <Col sm="4">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="emailAddress" />
            </Form.Label>
            <Form.Control disabled type="text" name="sEmail" defaultValue={feedbackData?.sEmail} />
          </Form.Group>
        </Col>
        <Col sm="4">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="subject" />
            </Form.Label>
            <Form.Control disabled type="text" name="sSubject" defaultValue={feedbackData?.sSubject} />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col sm="4">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="phoneNumber" />
            </Form.Label>
            <Form.Control disabled type="text" name="phoneNumber" defaultValue={feedbackData?.sPhone} />
          </Form.Group>
        </Col>
        <Col sm="4">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="queryType" />
            </Form.Label>
            <Form.Control disabled type="text" name="eQueryType" defaultValue={feedbackQueryType(feedbackData?.eQueryType)} />
          </Form.Group>
        </Col>
        <Col sm="4">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="pageLink" />
            </Form.Label>
            <Form.Control disabled type="text" name="sPageLink" defaultValue={feedbackData?.sPageLink} />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col sm="12">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="message" />
            </Form.Label>
            <Form.Control
              as={'textarea'}
              type="text"
              disabled
              className='h-auto'
              rows="15"
              name="message"
              placeholder={useIntl().formatMessage({ id: 'writeHere' })}
              defaultValue={feedbackData?.sMessage}
            />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col sm="3">
          <PermissionProvider isAllowedTo="DELETE_FEEDBACK">
            <Button onClick={() => handleDelete(feedbackData._id)} variant="outline-danger">
              Delete Feedback
            </Button>
          </PermissionProvider>
        </Col>
      </Row>
    </>
  )
}
DetailFeedback.propTypes = {
  id: PropTypes.string.isRequired
}
export default DetailFeedback
