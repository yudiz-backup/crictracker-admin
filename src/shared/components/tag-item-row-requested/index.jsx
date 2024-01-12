import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Badge } from 'react-bootstrap'
import { convertDateInDMY, eTypeName } from 'shared/utils'
import { FormattedMessage } from 'react-intl'
import ToolTip from 'shared/components/tooltip'

function TagItemRowRequested({ tag, index, selectedTag, onDelete, onSelect }) {
  return (
    <tr key={tag?._id}>
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
      <td>{tag?.sName}</td>
      <td>{eTypeName(tag?.eType)}</td>
      <td>{tag?.oSeo?.sSlug || '-'}</td>
      <td>{convertDateInDMY(tag?.dCreated)}</td>
      <td>{tag?.oSubAdmin?.sFName || '-'}</td>
      <td>
        {tag?.eStatus === 'a' ? (
          <Badge bg="success">
            <FormattedMessage id="approve" />
          </Badge>
        ) : tag?.eStatus === 'dec' ? (
          <Badge bg="danger">
            <FormattedMessage id="decline" />
          </Badge>
        ) : (
          <Badge bg="warning">
            <FormattedMessage id="pending" />
          </Badge>
        )}
      </td>
      <td>
        <ToolTip toolTipMessage={<FormattedMessage id="delete"/>}>
          <Button variant="link" className="square icon-btn" onClick={() => onDelete(tag?._id)}>
            <i className="icon-delete d-block" />
          </Button>
        </ToolTip>
      </td>
    </tr>
  )
}
TagItemRowRequested.propTypes = {
  tag: PropTypes.object,
  index: PropTypes.number,
  selectedTag: PropTypes.array,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func
}
export default TagItemRowRequested
