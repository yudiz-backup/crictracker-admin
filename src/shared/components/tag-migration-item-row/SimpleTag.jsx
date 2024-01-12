import React from 'react'
import PropTypes from 'prop-types'
import { Form, Button } from 'react-bootstrap'
import Select from 'react-select'
import { FormattedMessage } from 'react-intl'

import PermissionProvider from 'shared/components/permission-provider'
import { TAG_MIGRATION_TYPES, URL_PREFIX } from 'shared/constants'
import ToolTip from 'shared/components/tooltip'

function TagMigrationSimpleItemRow({ tag, index, selectedTag, onSelect, bulkPermission, onDelete, onChangeTagType, onTagMerge }) {
  const defaultValue = { label: <FormattedMessage id="simple" />, value: 'simple' }

  return (
    <tr key={tag._id}>
      <td>
        <PermissionProvider isAllowedTo={bulkPermission} isArray>
          <Form.Check
            type="checkbox"
            id={selectedTag[index]?._id}
            name={selectedTag[index]?._id}
            checked={selectedTag[index]?.value}
            className="form-check m-0"
            onChange={onSelect}
            label="&nbsp;"
          />
        </PermissionProvider>
      </td>
      <td>{tag.sName ? tag.sName : '-'}</td>
      <td className="migration-dropdown-td">
        <div className="migration-dropdown">
          <Select
            options={TAG_MIGRATION_TYPES}
            defaultValue={defaultValue}
            className="react-select"
            classNamePrefix="select"
            onChange={(e) => {
              onChangeTagType(e, tag.iTermId, tag._id)
            }}
          />
        </div>
      </td>
      <td>
        <ToolTip toolTipMessage={<FormattedMessage id="openInNewTab"/>}>
          <a className="link" href={`${URL_PREFIX}${tag?.sSlug}`} target="_blank" rel="noreferrer">
            <Button variant="link" className="square icon-btn">
              <i className="icon-language d-block" />
            </Button>
          </a>
        </ToolTip>
        <PermissionProvider isAllowedTo="LIST_MIGRATION_TAG">
          <ToolTip toolTipMessage={<FormattedMessage id="merge"/>}>
            <Button variant="link" className="square icon-btn" onClick={() => onTagMerge(tag._id)}>
              <i className="icon-merge d-block" />
            </Button>
          </ToolTip>
        </PermissionProvider>
        <PermissionProvider isAllowedTo="LIST_MIGRATION_TAG">
          <ToolTip toolTipMessage={<FormattedMessage id="delete"/>}>
            <Button variant="link" className="square icon-btn" onClick={() => onDelete(tag._id)}>
              <i className="icon-delete d-block" />
            </Button>
          </ToolTip>
        </PermissionProvider>
      </td>
    </tr>
  )
}
TagMigrationSimpleItemRow.propTypes = {
  tag: PropTypes.object,
  index: PropTypes.number,
  selectedTag: PropTypes.array,
  onSelect: PropTypes.func,
  bulkPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onChangeTagType: PropTypes.func,
  onTagMerge: PropTypes.func
}
export default TagMigrationSimpleItemRow
