import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'

import CustomToggle from '../custom-toggle'
import { convertDate } from 'shared/utils'
import RolePermissionDropdown from '../role-permission-dropdown'
import PermissionProvider from '../permission-provider'
import ToolTip from 'shared/components/tooltip'

function RoleItemRow({ event, dataModal, editRole, deleteRole, actionPermission }) {
  return (
    <>
      <tr>
        <td>
          <div className="title-b">
            <CustomToggle Tag="i" className="icon-arrow-drop-down" eventKey={event} />
            <span>{dataModal.sName}</span>
          </div>
        </td>
        <td>
          {dataModal.aParent.length === 0 && '-'}
          {dataModal.aParent.length !== 0 &&
            dataModal.aParent.map((parent, index) => `${parent.sName} ${dataModal.aParent.length - 1 !== index ? ', ' : ''}`)}
        </td>
        <td>{convertDate(dataModal.dUpdated)}</td>
        <PermissionProvider isAllowedTo={actionPermission} isArray>
          <td>
            <PermissionProvider isAllowedTo="EDIT_ROLE">
              <ToolTip toolTipMessage={<FormattedMessage id='edit'/>}>
                <Button onClick={() => editRole(dataModal._id)} variant="link" className="square icon-btn">
                  <i className="icon-create d-block" />
                </Button>
              </ToolTip>
            </PermissionProvider>
            <PermissionProvider isAllowedTo="DELETE_ROLE">
              <ToolTip toolTipMessage={<FormattedMessage id="delete"/>}>
                <Button onClick={() => deleteRole(dataModal._id)} variant="link" className="square icon-btn">
                  <i className="icon-delete d-block" />
                </Button>
              </ToolTip>
            </PermissionProvider>
          </td>
        </PermissionProvider>
      </tr>
      <RolePermissionDropdown title="Permission" data={dataModal.aPermissions} eventKey={event} colSpan={4} />
    </>
  )
}
RoleItemRow.propTypes = {
  event: PropTypes.any,
  dataModal: PropTypes.object,
  editRole: PropTypes.func,
  deleteRole: PropTypes.func,
  actionPermission: PropTypes.array
}
export default RoleItemRow
