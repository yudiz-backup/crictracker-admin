import React from 'react'
import PropTypes from 'prop-types'
import { Badge, Button, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import { convertDate, getDesignationInJob } from 'shared/utils'
import { allRoutes } from 'shared/constants/AllRoutes'
import PermissionProvider from 'shared/components/permission-provider'
import ToolTip from 'shared/components/tooltip'
import { S3_PREFIX } from 'shared/constants'

function EnquiryItemRow({ enquiry, index, selectedEnquiry, onAction, onSelect, bulkPermission, actionPermission }) {
  const getStatusBadge = (state) => {
    if (state === 'ap') {
      return (
        <Badge bg="success" className="mt-2 text-uppercase">
          <FormattedMessage id="approved" />
        </Badge>
      )
    } else if (state === 'r') {
      return (
        <Badge bg="primary" className="mt-2 text-uppercase">
          <FormattedMessage id="read" />
        </Badge>
      )
    } else if (state === 'rj') {
      return (
        <Badge bg="danger" className="mt-2 text-uppercase">
          <FormattedMessage id="rejected" />
        </Badge>
      )
    } else {
      return (
        <Badge bg="secondary" className="mt-2 text-uppercase">
          <FormattedMessage id="unread" />
        </Badge>
      )
    }
  }

  return (
    <tr key={enquiry._id}>
      <PermissionProvider isAllowedTo={bulkPermission} isArray>
        <td>
          <Form.Check
            type="checkbox"
            id={selectedEnquiry[index]?._id}
            name={selectedEnquiry[index]?._id}
            checked={selectedEnquiry[index]?.value}
            className="form-check m-0"
            onChange={onSelect}
            label="&nbsp;"
          />
        </td>
      </PermissionProvider>
      <td>
        <p className="title jobTitle">{enquiry.sFullName}</p>
        {enquiry?.sReference && (
          <p className="date mt-1">
            <span>
              <FormattedMessage id="ref" />
            </span>
            {enquiry?.sReference}
          </p>
        )}
        <div className="d-flex align-items-center gap-2">
          {getStatusBadge(enquiry?.eStatus)}
          <p className="date mt-2">
            <span>
              <FormattedMessage id="d" />
            </span>
            {convertDate(enquiry.dCreated)}
          </p>
        </div>
      </td>
      <td>{getDesignationInJob(enquiry?.oJobData?.eDesignation)}</td>
      <td>{enquiry?.oJobData?.sTitle}</td>
      <td>{enquiry?.sEmail}</td>
      <td>{enquiry?.sPhone}</td>
      <td>
        <PermissionProvider isAllowedTo={actionPermission} isArray>
          <div className="d-flex align-items-center justify-content-end">
            <PermissionProvider isAllowedTo="GET_ENQUIRY">
              <ToolTip toolTipMessage={<FormattedMessage id='view' />}>
                <Button variant="link" className="square icon-btn" as={Link} to={allRoutes.detailEnquiry(enquiry._id)}>
                  <i className="icon-visibility d-block" />
                </Button>
              </ToolTip>
            </PermissionProvider>
            <ToolTip toolTipMessage={<FormattedMessage id='downloadCV' />}>
              <a href={`${S3_PREFIX}${enquiry?.sUploadCV}`} download rel="noreferrer" target="_blank" className='square icon-btn btn btn-link'>
                <i className='icon-download'></i>
              </a>
            </ToolTip>
            {enquiry?.eStatus !== 'ap' && (
              <PermissionProvider isAllowedTo="EDIT_ENQUIRY">
                <ToolTip toolTipMessage={<FormattedMessage id='approved' />}>
                  <i className="icon-check approved" onClick={() => onAction(enquiry?._id, 'ap')} />
                </ToolTip>
              </PermissionProvider>
            )}
            {enquiry?.eStatus !== 'rj' && (
              <PermissionProvider isAllowedTo="EDIT_ENQUIRY">
                <ToolTip toolTipMessage={<FormattedMessage id='decline' />}>
                  <i className="icon-close decline" onClick={() => onAction(enquiry?._id, 'rj')} />
                </ToolTip>
              </PermissionProvider>
            )}
            <PermissionProvider isAllowedTo="EDIT_ENQUIRY">
              <ToolTip toolTipMessage={<FormattedMessage id='delete' />}>
                <Button variant="link" className="square icon-btn" onClick={() => onAction(enquiry?._id, 'd')}>
                  <i className="icon-delete d-block" />
                </Button>
              </ToolTip>
            </PermissionProvider>
          </div>
        </PermissionProvider>
      </td>
    </tr>
  )
}
EnquiryItemRow.propTypes = {
  enquiry: PropTypes.object,
  index: PropTypes.number,
  selectedEnquiry: PropTypes.array,
  bulkPermission: PropTypes.array,
  actionPermission: PropTypes.array,
  onAction: PropTypes.func,
  onSelect: PropTypes.func
}
export default EnquiryItemRow
