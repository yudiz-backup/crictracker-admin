import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import { eStatus, formatAMPM } from 'shared/utils'
import { Dropdown } from 'react-bootstrap'

function SingleUserComment({ comment, onChangeStatus }) {
  const [action, setAction] = useState(['Approve', 'Pending', 'Reject', 'Move to Spam', 'Move to Trash', 'Delete'])

  useEffect(() => {
    if (comment.eStatus === 'all') {
      setAction(['Approve', 'Pending', 'Reject', 'Move to Spam', 'Move to Trash', 'Delete'])
    } else if (comment.eStatus === 'a') {
      setAction(['Pending', 'Reject', 'Move to Spam', 'Move to Trash', 'Delete'])
    } else if (comment.eStatus === 'r') {
      setAction(['Approve', 'Pending', 'Move to Spam', 'Move to Trash', 'Delete'])
    } else if (comment.eStatus === 's') {
      setAction(['Approve', 'Pending', 'Reject', 'Move to Trash', 'Delete'])
    } else if (comment.eStatus === 't') {
      setAction(['Approve', 'Pending', 'Reject', 'Move to Spam', 'Delete'])
    }
  }, [comment.eStatus])
  return (
    <>
      <div className="add-border mt-4">
        <div className="d-flex justify-content-between mt-3">
          <div>
            <h6>
              {comment?.oCreatedBy?.sFullName || '-'} ({eStatus(comment?.eStatus)})
              {comment?.eStatus === 'sp' && <span className="count-circle mx-1">{comment?.nReportCount}</span>}
            </h6>
            <p className="date">{formatAMPM(comment?.dCreated)}</p>
          </div>
          {comment?.eStatus === 'p' && (
            <div>
              <i
                className="icon-check approved"
                onClick={() => {
                  onChangeStatus('Approve', comment._id)
                }}
              />
              <i
                className="icon-close decline"
                onClick={() => {
                  onChangeStatus('Reject', comment._id)
                }}
              />
            </div>
          )}
          {comment?.eStatus !== 'p' && (
            <Dropdown>
              <Dropdown.Toggle variant="link" className="actionButton">
                <i className="icon-dots-verticle d-block" />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {action.map((item) => (
                  <Dropdown.Item
                    key={item}
                    onClick={() => {
                      onChangeStatus(item, comment?._id)
                    }}
                  >
                    {item}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
        <p className="para">{comment?.sContent}</p>
      </div>
    </>
  )
}

SingleUserComment.propTypes = {
  comment: PropTypes.object,
  onChangeStatus: PropTypes.func
}

export default SingleUserComment
