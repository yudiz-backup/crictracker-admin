import React, { useContext, useEffect, useState } from 'react'
import { Form, Row, Col, Button } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'
import { useMutation, useLazyQuery } from '@apollo/client'
import { confirmAlert } from 'react-confirm-alert'
import { useIntl, FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'

import { GET_CONTACT_BY_ID, DELETE_CONTACT } from 'graph-ql/help/contacts'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { allRoutes } from 'shared/constants/AllRoutes'
import CustomAlert from 'shared/components/alert'
import PermissionProvider from 'shared/components/permission-provider'
import { queryType } from 'shared/utils'

function DetailContact({ id }) {
  const history = useHistory()
  const [contactData, setContactData] = useState({})
  const { dispatch } = useContext(ToastrContext)
  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }
  const [getContact] = useLazyQuery(GET_CONTACT_BY_ID, {
    onCompleted: (data) => {
      if (data && data.getContactById) {
        setContactData(data.getContactById)
      }
    }
  })
  const [delAction] = useMutation(DELETE_CONTACT, {
    onCompleted: (data) => {
      if (data && data.deleteContact) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.deleteContact.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  useEffect(() => {
    id && getContact({ variables: { input: { _id: id } } })
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
            data && history.push(allRoutes.contacts)
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
            <Form.Control disabled type="text" name="sName" defaultValue={contactData?.sName} />
          </Form.Group>
        </Col>
        <Col sm="4">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="emailAddress" />
            </Form.Label>
            <Form.Control disabled type="text" name="email" defaultValue={contactData?.sEmail} />
          </Form.Group>
        </Col>
        <Col sm="4">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="subject" />
            </Form.Label>
            <Form.Control type="text" disabled name="subject" defaultValue={contactData?.sSubject} />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col sm="3">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="phoneNumber" />
            </Form.Label>
            <Form.Control type="text" disabled name="phoneNumber" defaultValue={contactData?.sPhone} />
          </Form.Group>
        </Col>
        <Col sm="3">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="queryType" />
            </Form.Label>
            <Form.Control disabled type="text" name="status" defaultValue={queryType(contactData?.eQueryType)} />
          </Form.Group>
        </Col>
        <Col sm="3">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="city" />
            </Form.Label>
            <Form.Control disabled type="text" name="city" defaultValue={contactData?.sCity} />
          </Form.Group>
        </Col>
        <Col sm="3">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="company" />
            </Form.Label>
            <Form.Control disabled type="text" name="company" defaultValue={contactData?.sCompany} />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col sm="12">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="message" />
            </Form.Label>
            <Form.Control as={'textarea'} className='h-auto' rows="15" type="text" disabled name="message" defaultValue={contactData?.sMessage} />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col sm="3">
          <PermissionProvider isAllowedTo="DELETE_FEEDBACK">
            <Button onClick={() => handleDelete(contactData._id)} variant="outline-danger">
              Delete Contact
            </Button>
          </PermissionProvider>
        </Col>
      </Row>
    </>
  )
}

DetailContact.propTypes = {
  id: PropTypes.string.isRequired
}

export default DetailContact
