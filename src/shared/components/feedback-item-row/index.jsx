import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Badge, Button, Form } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'

import PermissionProvider from '../permission-provider'
import { convertDate, feedbackQueryType } from 'shared/utils'
import ToolTip from 'shared/components/tooltip'
import PopUpModal from '../pop-up-modal'
import DetailFeedback from 'views/help/detail-feedback'

function FeedbackItemRow({ feedback, index, selectedFeedback, onDelete, onStatusChange, onSelect, bulkPermission, actionPermission }) {
  const [view, setView] = useState(false)
  const [eStatus, setEStatus] = useState('ur')

  const getStatusBadge = (state) => {
    if (state === 'r') {
      return (
        <Badge bg="primary" className="mt-2 text-uppercase">
          <FormattedMessage id="read" />
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
    <>
      <tr key={feedback._id}>
        <PermissionProvider isAllowedTo={bulkPermission} isArray>
          <td>
            <Form.Check
              type="checkbox"
              id={selectedFeedback[index]?._id}
              name={selectedFeedback[index]?._id}
              checked={selectedFeedback[index]?.value}
              className="form-check m-0"
              onChange={onSelect}
              label="&nbsp;"
            />
          </td>
        </PermissionProvider>
        <td>
          <p className="titleName">{feedback.sName}</p>
          <div className="d-flex align-items-center gap-2">
            {getStatusBadge(feedback?.eStatus === 'ur' ? eStatus : feedback?.eStatus)}
            <p className="date mt-2">
              <span>
                <FormattedMessage id="d" />
              </span>
              {convertDate(feedback.dCreated)}
            </p>
          </div>
        </td>
        <td>{feedback.sEmail}</td>
        <td>{feedbackQueryType(feedback.eQueryType)}</td>
        <td>{feedback.sSubject}</td>
        <td>
          <PermissionProvider isAllowedTo="GET_FEEDBACK">
            <ToolTip toolTipMessage={<FormattedMessage id="view" />}>
              <Button variant="link" className="square icon-btn" onClick={() => { setEStatus('r'); setView(true) }}>
                <i className="icon-visibility d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
          <PermissionProvider isAllowedTo="DELETE_FEEDBACK">
            <ToolTip toolTipMessage={<FormattedMessage id="delete" />}>
              <Button variant="link" className="square icon-btn" onClick={() => onDelete(feedback._id)}>
                <i className="icon-delete d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
        </td>
      </tr>
      <PopUpModal title="Details" isOpen={view} onClose={() => { setView(false) }} isCentered>
        <DetailFeedback id={feedback._id} />
      </PopUpModal>
    </>
  )
}
FeedbackItemRow.propTypes = {
  feedback: PropTypes.object,
  index: PropTypes.number,
  selectedFeedback: PropTypes.array,
  bulkPermission: PropTypes.array,
  actionPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSelect: PropTypes.func,
  refetch: PropTypes.func
}
export default FeedbackItemRow
