import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'

import { convertDate, spreadOutText } from 'shared/utils'
import { Link } from 'react-router-dom'
import PermissionProvider from 'shared/components/permission-provider'
import { ToastrContext } from '../../toastr'
import { FormattedMessage } from 'react-intl'
import { TOAST_TYPE } from 'shared/constants'
import { allRoutes } from 'shared/constants/AllRoutes'

function LiveEventsItemRow({ event, index, actionPermission, bulkPermission, selectedEvents, onSelect, onDelete }) {
  const { dispatch } = useContext(ToastrContext)
  function copyPermaLink() {
    try {
      navigator.clipboard.writeText(event?._id)
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: <FormattedMessage id="eventIDCopied" />, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
      })
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }
  return (
    <tr key={event?._id}>
      <PermissionProvider isAllowedTo={bulkPermission} isArray>
        <td>
          <Form.Check
            type="checkbox"
            id={selectedEvents[index]?._id}
            name={selectedEvents[index]?._id}
            checked={selectedEvents[index]?.value || false}
            className="form-check m-0"
            onChange={onSelect}
            label="&nbsp;"
          />
        </td>
      </PermissionProvider>
      <td className='d-flex align-items-center gap-2'>
        {spreadOutText(event?._id)}
        <Button variant="link" className="square icon-btn" onClick={copyPermaLink}>
          <i className="icon-copy d-block" />
        </Button>
      </td>
      <td>
        <div className='d-flex align-items-center gap-2'>
          {event?.sEventName}
          <PermissionProvider isAllowedTo="EDIT_LIVEEVENT">
            <Button variant="link" className="square icon-btn" as={Link} to={allRoutes.editEvent(event?._id)}>
              <i className="icon-create d-block" />
            </Button>
          </PermissionProvider>
        </div>
      </td>
      <td>{convertDate(event?.dCreated)}</td>
      <PermissionProvider isAllowedTo={actionPermission} isArray>
        <td>
          <PermissionProvider isAllowedTo="MANAGE_LIVEEVENTCONTENT">
            <Button variant="link" className="square icon-btn" as={Link} to={allRoutes.editEventContent(event._id)}>
              <i className="icon-create d-block" />
            </Button>
          </PermissionProvider>
          <PermissionProvider isAllowedTo="DELETE_LIVEEVENT">
            <Button variant="link" className="square icon-btn" onClick={() => onDelete(event._id)}>
              <i className="icon-delete d-block" />
            </Button>
          </PermissionProvider>
        </td>
      </PermissionProvider>
    </tr>
  )
}
LiveEventsItemRow.propTypes = {
  event: PropTypes.object,
  index: PropTypes.number,
  selectedEvents: PropTypes.array,
  actionPermission: PropTypes.array,
  bulkPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSelect: PropTypes.func
}
export default LiveEventsItemRow
