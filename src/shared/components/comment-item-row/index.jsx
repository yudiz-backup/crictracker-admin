import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Badge, Form, Dropdown } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'

import { eStatus, colorBadge, convertDate } from 'shared/utils'
import ToolTip from 'shared/components/tooltip'
import { URL_PREFIX } from 'shared/constants'

function CommentItemRow({ comment, index, selectedComment, onSelect, onChangeStatus }) {
  const [action, setAction] = useState([{ value: 'Approve', i18Key: 'approve' }, { value: 'Pending', i18Key: 'pending' }, { value: 'Reject', i18Key: 'reject' }, { value: 'Move to Spam', i18Key: 'moveToSpam' }, { value: 'Move to Trash', i18Key: 'moveToTrash' }])
  const [isDropDown, setIsDropDown] = useState(false)

  useEffect(() => {
    if (comment.eStatus === 'all') {
      setAction([{ value: 'Approve', i18Key: 'approve' }, { value: 'Reject', i18Key: 'reject' }, { value: 'Pending', i18Key: 'pending' }, { value: 'Move to Spam', i18Key: 'moveToSpam' }, { value: 'Move to Trash', i18Key: 'moveToTrash' }, { value: 'Delete', i18Key: 'delete' }])
    } else if (comment.eStatus === 'a') {
      setAction([{ value: 'Reject', i18Key: 'reject' }, { value: 'Pending', i18Key: 'pending' }, { value: 'Move to Spam', i18Key: 'moveToSpam' }, { value: 'Move to Trash', i18Key: 'moveToTrash' }, { value: 'Delete', i18Key: 'delete' }])
    } else if (comment.eStatus === 'p') {
      setAction([{ value: 'Approve', i18Key: 'approve' }, { value: 'Reject', i18Key: 'reject' }, { value: 'Move to Spam', i18Key: 'moveToSpam' }, { value: 'Move to Trash', i18Key: 'moveToTrash' }, { value: 'Delete', i18Key: 'delete' }])
    } else if (comment.eStatus === 'sp') {
      setAction([{ value: 'Approve', i18Key: 'approve' }, { value: 'Pending', i18Key: 'pending' }, { value: 'Reject', i18Key: 'reject' }, { value: 'Move to Trash', i18Key: 'moveToTrash' }, { value: 'Delete', i18Key: 'delete' }])
    } else if (comment.eStatus === 't') {
      setAction([{ value: 'Approve', i18Key: 'approve' }, { value: 'Pending', i18Key: 'pending' }, { value: 'Reject', i18Key: 'reject' }, { value: 'Move to Spam', i18Key: 'moveToSpam' }, { value: 'Delete', i18Key: 'delete' }])
    } else if (comment.eStatus === 'r') {
      setAction([{ value: 'Approve', i18Key: 'approve' }, { value: 'Pending', i18Key: 'pending' }, { value: 'Move to Spam', i18Key: 'moveToSpam' }, { value: 'Move to Trash', i18Key: 'moveToTrash' }, { value: 'Delete', i18Key: 'delete' }])
    }
  }, [comment])

  function getStatus() {
    if (eStatus(comment.eStatus) === 'Spam') {
      return `(${comment.nReportCount})` + ' ' + eStatus(comment.eStatus)
    } else {
      return eStatus(comment.eStatus)
    }
  }
  return (
    <>
      <tr>
        <td>
          <Form.Check
            type="checkbox"
            id={selectedComment[index]?._id}
            name={selectedComment[index]?._id}
            checked={selectedComment[index]?.value}
            className="form-check m-0"
            onChange={onSelect}
            label="&nbsp;"
          />
        </td>
        <td>
          <div className="icons">
            <Badge bg={colorBadge(comment.eStatus)}>{getStatus()}</Badge>
          </div>
          <p className="title">{comment.sContent}</p>
          <p className="date">
            <span>
              <FormattedMessage id="d" />
            </span>
            {convertDate(comment.dCreated)}{' '}
            <span>
              <FormattedMessage id="lm" />
            </span>
            {convertDate(comment.dUpdated)}
          </p>
        </td>
        <td>
          <a className="link" href={`${URL_PREFIX}${comment?.oArticleSeo?.sSlug || comment?.oArticle?.oSeo?.sSlug}/`} target="_blank" rel="noreferrer">
            <p className="cat">{comment?.oArticle?.sTitle || '-'}</p>
          </a>
        </td>
        <td>{comment?.nReportCount}</td>
        <td>
          <p>{comment?.oCreatedBy?.sUsername}</p>
        </td>
        <td>
          <Dropdown show={isDropDown} onMouseEnter={() => setIsDropDown(true)} onMouseLeave={() => setIsDropDown(false)}>
            <Dropdown.Toggle variant="link" className="actionButton border-0">
              <i className="icon-dots-verticle d-block" />
            </Dropdown.Toggle>
            <Dropdown.Menu className='border-0'>
              {action.map((item) => (
                <ToolTip toolTipMessage={<FormattedMessage id={item?.i18Key} />} key={item?.i18Key} position="left">
                  <Dropdown.Item
                    onClick={() => {
                      onChangeStatus(item, comment._id, comment.eStatus)
                    }}
                  >
                    {item?.value}
                  </Dropdown.Item>
                </ToolTip>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </td>
      </tr>
    </>
  )
}
CommentItemRow.propTypes = {
  comment: PropTypes.object,
  index: PropTypes.number,
  selectedComment: PropTypes.array,
  onSelect: PropTypes.func,
  onChangeStatus: PropTypes.func
}
export default CommentItemRow
