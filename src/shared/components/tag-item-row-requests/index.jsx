import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'

import { convertDateInDMY, eTypeName } from 'shared/utils'
import PermissionProvider from '../permission-provider'
import ToolTip from 'shared/components/tooltip'

function TagItemRowRequestes({ tag, index, selectedTag, onDelete, onSelect, onIsApprove, bulkPermission, actionPermission }) {
  return (
    <tr key={tag?._id}>
      <PermissionProvider isAllowedTo={bulkPermission} isArray>
        <td>
          <Form.Check
            type="checkbox"
            id={selectedTag[index]?._id}
            name={selectedTag[index]?._id}
            checked={selectedTag[index]?.value}
            className="form-check m-0"
            onChange={onSelect}
            label="&nbsp;"
          />
        </td>
      </PermissionProvider>
      <td>{tag?.sName}</td>
      <td>{eTypeName(tag?.eType)}</td>
      <td>{tag?.oSeo?.sSlug || '-'}</td>
      <td>{convertDateInDMY(tag?.dCreated)}</td>
      <td>{tag?.oSubAdmin?.sFName || '-'}</td>
      <PermissionProvider isAllowedTo={actionPermission} isArray>
        <td>
          <PermissionProvider isAllowedTo="APPROVE_REJECT_REQUESTS_TAG">
            <ToolTip toolTipMessage={<FormattedMessage id="approved"/>}>
              <i className="icon-check approved" onClick={() => onIsApprove(tag?._id, 'approved')} />
            </ToolTip>
          </PermissionProvider>
          <PermissionProvider isAllowedTo="APPROVE_REJECT_REQUESTS_TAG">
            <ToolTip toolTipMessage={<FormattedMessage id="decline"/>}>
              <i className="icon-close decline" onClick={() => onIsApprove(tag?._id, 'decline')} />
            </ToolTip>
          </PermissionProvider>
          <PermissionProvider isAllowedTo="DELETE_REQUESTS_TAG">
            <ToolTip toolTipMessage={<FormattedMessage id="delete"/>}>
              <i className="icon-delete delete" onClick={() => onDelete(tag?._id)} />
            </ToolTip>
          </PermissionProvider>
        </td>
      </PermissionProvider>
    </tr>
  )
}
TagItemRowRequestes.propTypes = {
  tag: PropTypes.object,
  index: PropTypes.number,
  selectedTag: PropTypes.array,
  bulkPermission: PropTypes.array,
  actionPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onIsApprove: PropTypes.func,
  onSelect: PropTypes.func
}
export default TagItemRowRequestes
