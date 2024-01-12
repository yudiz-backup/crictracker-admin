import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { Col, Form, Row, Button } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { GET_ENQUIRY_BY_ID } from 'graph-ql/settings/job-post/query'
import { getDesignationInJob, convertDate } from 'shared/utils'
import { S3_PREFIX } from 'shared/constants'

function DetailEnquiry() {
  const [enquiryData, setEnquiryData] = useState()
  const { id } = useParams()
  const [getEnquiryById] = useLazyQuery(GET_ENQUIRY_BY_ID, {
    onCompleted: (data) => {
      if (data?.getEnquiryById) {
        setEnquiryData(data.getEnquiryById)
      }
    }
  })

  useEffect(() => {
    id &&
      getEnquiryById({
        variables: { input: { _id: id } }
      })
  }, [id])

  return (
    <>
      <Row>
        <Col md="2">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="dateOfEnquiry" />
            </Form.Label>
            <Form.Control
              type="text"
              name="dCreated"
              disabled
              defaultValue={enquiryData?.dCreated && (convertDate(enquiryData?.dCreated) || '')}
            />
          </Form.Group>
        </Col>
        <Col md="2">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="designation" />
            </Form.Label>
            <Form.Control
              type="text"
              name="eDesignation"
              disabled
              defaultValue={getDesignationInJob(enquiryData?.oJobData?.eDesignation)?.props?.defaultMessage || ''}
            />
          </Form.Group>
        </Col>
        <Col md="2">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="jobTitle" />
            </Form.Label>
            <Form.Control type="text" name="sJobTitle" disabled defaultValue={enquiryData?.oJobData?.sTitle} />
          </Form.Group>
        </Col>
        <Col md="2">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="fullName" />
            </Form.Label>
            <Form.Control type="text" name="sFullName" disabled defaultValue={enquiryData?.sFullName} />
          </Form.Group>
        </Col>
        <Col md="2">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="email" />
            </Form.Label>
            <Form.Control type="text" name="sEmail" disabled defaultValue={enquiryData?.sEmail} />
          </Form.Group>
        </Col>
        <Col md="2">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="phoneNumber" />
            </Form.Label>
            <Form.Control type="text" name="sPhone" disabled defaultValue={enquiryData?.sPhone} />
          </Form.Group>
        </Col>
        <Col md="2">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="currentEmployer" />
            </Form.Label>
            <Form.Control type="text" name="sCurrentEmployer" disabled defaultValue={enquiryData?.sCurrentEmployer} />
          </Form.Group>
        </Col>
        <Col md="2">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="currentCtc" />
            </Form.Label>
            <Form.Control type="text" name="sCurrentCTC" disabled defaultValue={enquiryData?.sCurrentCTC} />
          </Form.Group>
        </Col>
        <Col md="2">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="expectedCtc" />
            </Form.Label>
            <Form.Control type="text" name="sExpectedCTC" disabled defaultValue={enquiryData?.sExpectedCTC} />
          </Form.Group>
        </Col>
        <Col md="2">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="currentLocation" />
            </Form.Label>
            <Form.Control type="text" name="sCurrentLocation" disabled defaultValue={enquiryData?.sCurrentLocation} />
          </Form.Group>
        </Col>
        <Col md="2">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="preferredLocation" />
            </Form.Label>
            <Form.Control type="text" name="sLocationTitle" disabled defaultValue={enquiryData?.oPreferredLocation?.sTitle} />
          </Form.Group>
        </Col>
        <Col md="2">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="totalExperience" />
            </Form.Label>
            <Form.Control type="text" name="sTotalExperience" disabled defaultValue={enquiryData?.sTotalExperience} />
          </Form.Group>
        </Col>
        {
          enquiryData?.sReference && <Col md="2">
            <Form.Group className="form-group">
              <Form.Label>
                <FormattedMessage id="reference" />
              </Form.Label>
              <Form.Control type="text" name="sReference" disabled defaultValue={enquiryData?.sReference} />
            </Form.Group>
          </Col>
        }
        <Col md="12">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="message" />
            </Form.Label>
            <Form.Control as={'textarea'} className='h-auto' rows={15} type="text" name="sMessage" disabled defaultValue={enquiryData?.sMessage} />
          </Form.Group>
        </Col>
        <Col md="2">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="cv" />
            </Form.Label>
          </Form.Group>
          <a href={`${S3_PREFIX}${enquiryData?.sUploadCV}`} download rel="noreferrer" target="_blank">
            <Button variant="primary">{useIntl().formatMessage({ id: 'download' })}</Button>
          </a>
        </Col>
      </Row>
    </>
  )
}

export default DetailEnquiry
