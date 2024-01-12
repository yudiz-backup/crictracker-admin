import React, { useState, useContext, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import { useMutation, useLazyQuery } from '@apollo/client'
import Select from 'react-select'
import { Controller, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import SingleUserComment from '../single-user-comment'
import Drawer from '../drawer'
import { GET_COMMENTS, GET_FANTASY_COMMENTS } from 'graph-ql/comments/query'
import { STATUS_COMMENT, STATUS_FANTASY_COMMENT } from 'graph-ql/comments/mutation'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE, COMMENT_STATUS } from 'shared/constants'
import { getCommentEnum, bottomReached } from 'shared/utils'

function UserComment({ commentCount, type }) {
  const { id } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const [isOpen, setIsOpen] = useState(false)
  const { control } = useForm({})
  const totalRecord = useRef(0)
  const isBottomReached = useRef(false)
  const [commentList, setCommentList] = useState([])
  const [requestParams, setRequestParams] = useState({
    eStatus: 'all',
    iArticleId: id,
    nSkip: 1,
    nLimit: 10,
    sSortBy: 'dCreated',
    nOrder: -1
  })

  const [getComment, { loading }] = useLazyQuery(GET_COMMENTS, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      if (data && data?.listComments.aResults) {
        if (isBottomReached.current) setCommentList([...commentList, ...data.listComments.aResults])
        else setCommentList(data.listComments.aResults)
        totalRecord.current = data.listComments.nTotal
        isBottomReached.current = false
      }
    }
  })

  const [getFantasyComment, { loading: fLoading }] = useLazyQuery(GET_FANTASY_COMMENTS, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      if (data && data?.listFantasyComments.aResults) {
        if (isBottomReached.current) setCommentList([...commentList, ...data.listFantasyComments.aResults])
        else setCommentList(data.listFantasyComments.aResults)
        totalRecord.current = data.listFantasyComments.nTotal
        isBottomReached.current = false
      }
    }
  })

  useEffect(() => {
    if (isOpen) {
      type === 'ar' ? getComment() : getFantasyComment()
    }
  }, [isOpen])

  function handleBulkResponse(aIds, eStatus) {
    if (requestParams.eStatus === 'all') {
      if (eStatus === 'd') {
        setCommentList(commentList.filter((item) => !aIds.includes(item._id)))
      } else {
        setCommentList(commentList.map((item) => (!aIds.includes(item._id) ? item : { ...item, eStatus })))
      }
    } else {
      setCommentList(commentList.filter((item) => !aIds.includes(item._id)))
    }
  }

  async function onChangeStatus(item, id) {
    if (type === 'ar') {
      const { data: changeData } = await statusAction({ variables: { input: { _id: id, eStatus: getCommentEnum(item) } } })
      if (changeData) handleBulkResponse([id], getCommentEnum(item))
    } else {
      const { data: changeData } = await fantasyStatusAction({ variables: { input: { _id: id, eStatus: getCommentEnum(item) } } })
      if (changeData) handleBulkResponse([id], getCommentEnum(item))
    }
  }

  const [statusAction] = useMutation(STATUS_COMMENT, {
    onCompleted: (data) => {
      if (data && data.updateCommentStatus) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.updateCommentStatus.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  const [fantasyStatusAction] = useMutation(STATUS_FANTASY_COMMENT, {
    onCompleted: (data) => {
      if (data && data.updateFantasyCommentStatus) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.updateFantasyCommentStatus.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  function handleScroll(e) {
    if (bottomReached(e) && !isBottomReached.current && commentList.length < totalRecord.current) {
      isBottomReached.current = true
      setRequestParams({ ...requestParams, nSkip: requestParams.nSkip + 1 })
    }
  }
  return (
    <>
      <div className="view-comment" onClick={() => setIsOpen(!isOpen)}>
        <FormattedMessage id="viewUserComments" /> <span className="count-circle">{commentCount}</span>
      </div>
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(!isOpen)} title={<FormattedMessage id="userComments" />}>
        <div className="user-comments" onScroll={handleScroll}>
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="view" />
            </Form.Label>
            <Controller
              name="sType"
              control={control}
              render={({ field: { onChange, value, ref } }) => (
                <Select
                  ref={ref}
                  value={COMMENT_STATUS.filter((x) => x.value === value)[0]}
                  options={COMMENT_STATUS}
                  getOptionLabel={(option) => option.sType}
                  getOptionValue={(option) => option._id}
                  className="react-select"
                  classNamePrefix="select"
                  isSearchable={false}
                  onChange={(e) => {
                    onChange(e.sType)
                    setRequestParams({ ...requestParams, eStatus: e._id, nSkip: 1 })
                  }}
                  isLoading={loading || fLoading}
                />
              )}
            />
          </Form.Group>
          {commentList?.map((comment) => {
            return <SingleUserComment key={comment._id} comment={comment} onChangeStatus={onChangeStatus} />
          })}
          {!commentList.length && (
            <div className="add-border mt-4 pt-2 text-center">
              <p>
                <FormattedMessage id="noComment" />
              </p>
            </div>
          )}
        </div>
      </Drawer>
    </>
  )
}
UserComment.propTypes = {
  commentCount: PropTypes.number,
  type: PropTypes.string
}
export default UserComment
