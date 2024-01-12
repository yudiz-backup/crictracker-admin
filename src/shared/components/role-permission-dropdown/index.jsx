import React from 'react'
import PropTypes from 'prop-types'
import { Accordion } from 'react-bootstrap'
import { useIntl } from 'react-intl'

import { PERMISSION_CATEGORY } from 'shared/constants'
import PermissionsText from '../permissions-text'

function RolePermissionDropdown({ data, eventKey, title, colSpan }) {
  const permissionNotFound = useIntl().formatMessage({ id: 'permissionNotFound' })

  const permission = {
    [PERMISSION_CATEGORY.content]: data.filter((item) => item.eType === PERMISSION_CATEGORY.content),
    [PERMISSION_CATEGORY.admin]: data.filter((item) => item.eType === PERMISSION_CATEGORY.admin),
    [PERMISSION_CATEGORY.analytics]: data.filter((item) => item.eType === PERMISSION_CATEGORY.analytics)
  }
  return (
    <tr className="border-0">
      <td colSpan={colSpan} className="py-0 text-start">
        <Accordion.Collapse className="permissions" eventKey={eventKey}>
          <>
            {title && <h4 className="title-txt">{title}</h4>}
            <div className="p-cat d-flex">
              <h5 className="cat-title">{PERMISSION_CATEGORY.content} :</h5>
              {permission[PERMISSION_CATEGORY.content].length > 0 ? (
                <PermissionsText item={permission[PERMISSION_CATEGORY.content]} />
              ) : (
                permissionNotFound
              )}
            </div>
            <div className="p-cat d-flex">
              <h5 className="cat-title">{PERMISSION_CATEGORY.admin} :</h5>
              {permission[PERMISSION_CATEGORY.admin].length > 0 ? (
                <PermissionsText item={permission[PERMISSION_CATEGORY.admin]} />
              ) : (
                permissionNotFound
              )}
            </div>
            <div className="p-cat d-flex">
              <h5 className="cat-title">{PERMISSION_CATEGORY.analytics} :</h5>
              {permission[PERMISSION_CATEGORY.analytics].length > 0 ? (
                <PermissionsText item={permission[PERMISSION_CATEGORY.analytics]} />
              ) : (
                permissionNotFound
              )}
            </div>
          </>
        </Accordion.Collapse>
      </td>
    </tr>
  )
}
RolePermissionDropdown.propTypes = {
  eventKey: PropTypes.any,
  title: PropTypes.string,
  data: PropTypes.array,
  colSpan: PropTypes.number
}
export default RolePermissionDropdown
