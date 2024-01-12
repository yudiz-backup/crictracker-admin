import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Badge, Button, Form } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'

import PermissionProvider from '../permission-provider'
import ToolTip from 'shared/components/tooltip'
import PopUpModal from '../pop-up-modal'
import DetailContact from 'views/help/detail-contact'
import { convertDate } from 'shared/utils'

function ContactItemRow({ contact, index, selectedContact, onDelete, onStatusChange, onSelect, bulkPermission, actionPermission }) {
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
      <tr key={contact._id}>
        <PermissionProvider isAllowedTo={bulkPermission} isArray>
          <td>
            <Form.Check
              type="checkbox"
              id={selectedContact[index]?._id}
              name={selectedContact[index]?._id}
              checked={selectedContact[index]?.value}
              className="form-check m-0"
              onChange={onSelect}
              label="&nbsp;"
            />
          </td>
        </PermissionProvider>
        <td>
          <p className="titleName">{contact.sName}</p>
          <div className="d-flex align-items-center gap-2">
            {getStatusBadge(contact?.eStatus === 'ur' ? eStatus : contact?.eStatus)}
            <p className="date mt-2">
              <span>
                <FormattedMessage id="d" />
              </span>
              {convertDate(contact.dCreated)}
            </p>
          </div>
        </td>
        <td>{contact.sEmail}</td>
        {/* <td>{queryType(contact.eQueryType)}</td> */}
        <td>{contact.sSubject}</td>
        <td>
          <PermissionProvider isAllowedTo="GET_CONTACT">
            <ToolTip toolTipMessage={<FormattedMessage id="view" />}>
              <Button variant="link" className="square icon-btn" onClick={() => { setEStatus('r'); setView(true) }}>
                <i className="icon-visibility d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
          <PermissionProvider isAllowedTo="DELETE_CONTACT">
            <ToolTip toolTipMessage={<FormattedMessage id="delete" />}>
              <Button variant="link" className="square icon-btn" onClick={() => onDelete(contact._id)}>
                <i className="icon-delete d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
        </td>
      </tr>
      <PopUpModal title="Details" isOpen={view} onClose={() => { setView(false) }} isCentered>
        <DetailContact id={contact._id} />
      </PopUpModal>
    </>
  )
}
ContactItemRow.propTypes = {
  contact: PropTypes.object,
  index: PropTypes.number,
  selectedContact: PropTypes.array,
  bulkPermission: PropTypes.array,
  actionPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSelect: PropTypes.func
}
export default ContactItemRow
