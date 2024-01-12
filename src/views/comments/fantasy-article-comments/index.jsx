import React, { useState, useEffect, useContext, useRef } from 'react'
import { useHistory, useLocation } from 'react-router'
import { Accordion } from 'react-bootstrap'
import { useQuery, useMutation, useLazyQuery } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import DataTable from 'shared/components/data-table'
import CommentItemRow from 'shared/components/comment-item-row'
import { GET_FANTASY_COMMENTS, GET_FANTASY_ARTICLE_COMMENTS } from 'graph-ql/comments/query'
import { setSortType, parseParams, appendParams, eStatus, getCommentEnum, getCompleteCommentName } from 'shared/utils'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { STATUS_FANTASY_COMMENT, BULK_FANTASY_ARTICLE_COMMENT } from 'graph-ql/comments/mutation'
import CustomAlert from 'shared/components/alert'

function FantasyArticleComments() {
  const history = useHistory()
  const { dispatch } = useContext(ToastrContext)
  const params = parseParams(useLocation().search)
  const commentCount = useRef()
  const totalRecord = useRef(0)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [openTab, setOpenTab] = useState('all')
  const [commentList, setCommentList] = useState([])
  const [selectedComment, setSelectedComment] = useState([])
  const [columns, setColumns] = useState([
    { name: <FormattedMessage id="comment" />, internalName: 'sContent', type: 0 },
    { name: <FormattedMessage id="article" />, internalName: 'article', type: 0 },
    { name: <FormattedMessage id="reportCount" />, internalName: 'nReportCount', type: 0 },
    { name: <FormattedMessage id="commentFrom" />, internalName: 'commentFrom', type: 0 }
  ])
  const [tabs, setTabs] = useState([
    { name: <FormattedMessage id="all" />, internalName: 'all', active: true },
    { name: <FormattedMessage id="pending" />, internalName: 'pending', active: false },
    { name: <FormattedMessage id="approved" />, internalName: 'approved', active: false },
    { name: <FormattedMessage id="spam" />, internalName: 'spam', active: false },
    { name: <FormattedMessage id="rejected" />, internalName: 'rejected', active: false },
    { name: <FormattedMessage id="trash" />, internalName: 'trash', active: false }
  ])
  const [bulkActionDropDown, setBulkActionDropDown] = useState([{ label: <FormattedMessage id="deleteAll" />, value: 'd' }])
  const { loading, refetch } = useQuery(GET_FANTASY_COMMENTS, {
    variables: {
      input: requestParams
    },
    onCompleted: (data) => {
      if (data && data?.listFantasyComments.aResults) {
        setSelectedComment(
          data.listFantasyComments.aResults.map((item) => {
            return {
              _id: item._id,
              value: false
            }
          })
        )
        totalRecord.current = data.listFantasyComments.nTotal
        setCommentList(data.listFantasyComments.aResults)
      }
    }
  })

  const [getCommentCount, { commentCountLoading }] = useLazyQuery(GET_FANTASY_ARTICLE_COMMENTS, {
    onCompleted: (data) => {
      if (data && data?.getFantasyCommentCounts) {
        commentCount.current = { ...data.getFantasyCommentCounts }
        setTabs(
          tabs.map((e) => {
            if (e.internalName === 'all') {
              return { ...e, count: commentCount.current.nAll }
            } else if (e.internalName === 'approved') {
              return { ...e, count: commentCount.current.nApproved }
            } else if (e.internalName === 'pending') {
              return { ...e, count: commentCount.current.nPending }
            } else if (e.internalName === 'spam') {
              return { ...e, count: commentCount.current.nSpam }
            } else if (e.internalName === 'rejected') {
              return { ...e, count: commentCount.current.nRejected }
            } else {
              return { ...e, count: commentCount.current.nTrash }
            }
          })
        )
      }
    }
  })

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }

  function handleTabChange(name) {
    if (name === 'all') {
      setRequestParams({ ...requestParams, eStatus: 'all', nSkip: 1 })
      appendParams({ eStatus: 'all', nSkip: 1 })
    } else if (name === 'approved') {
      setRequestParams({ ...requestParams, eStatus: 'a', nSkip: 1 })
      appendParams({ eStatus: 'a', nSkip: 1 })
    } else if (name === 'pending') {
      setRequestParams({ ...requestParams, eStatus: 'p', nSkip: 1 })
      appendParams({ eStatus: 'p', nSkip: 1 })
    } else if (name === 'rejected') {
      setRequestParams({ ...requestParams, eStatus: 'r', nSkip: 1 })
      appendParams({ eStatus: 'r', nSkip: 1 })
    } else if (name === 'spam') {
      setRequestParams({ ...requestParams, eStatus: 'sp', nSkip: 1 })
      appendParams({ eStatus: 'sp', nSkip: 1 })
    } else if (name === 'trash') {
      setRequestParams({ ...requestParams, eStatus: 't', nSkip: 1 })
      appendParams({ eStatus: 't', nSkip: 1 })
    }
    changeTab(name)
  }

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params
    return {
      eStatus: data.eStatus || 'all',
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || ''
    }
  }

  async function handleHeaderEvent(name, value) {
    switch (name) {
      case 'bulkAction': {
        const comment = selectedComment.map((a) => ({ ...a }))
        const obj = {
          bulkIds: comment.filter((item) => item.value && delete item.value),
          eStatus: value
        }
        const { data } = await bulkAction({
          variables: {
            input: {
              aId: obj.bulkIds.map((id) => {
                return id._id
              }),
              eStatus: obj.eStatus
            }
          }
        })
        if (data) {
          value === 'd' ? getCommentCount() : changeCalculationCount(eStatus(value).toLowerCase(), openTab, obj.bulkIds.length)
          handleBulkResponse(
            comment.filter((item) => item.value === undefined && item).map((e) => e._id),
            value
          )
        }
        break
      }
      case 'rows':
        setRequestParams({ ...requestParams, nLimit: Number(value), nSkip: 1 })
        appendParams({ nLimit: value, nSkip: 1 })
        break
      case 'search':
        setRequestParams({ ...requestParams, sSearch: value, nSkip: 1 })
        appendParams({ sSearch: value, nSkip: 1 })
        break
      default:
        break
    }
  }

  function changeTab(name) {
    if (name === 'all') {
      setRequestParams({ ...requestParams, eStatus: 'all' })
      setBulkActionDropDown([{ label: <FormattedMessage id="deleteAll" />, value: 'd' }])
      setOpenTab('all')
    } else if (name === 'pending') {
      setRequestParams({ ...requestParams, eStatus: 'p' })
      setBulkActionDropDown([
        { label: <FormattedMessage id="deleteAll" />, value: 'd', isAllowedTo: 'PENDING_COMMENT' },
        { label: <FormattedMessage id="approveAll" />, value: 'a', isAllowedTo: 'PENDING_COMMENT' },
        { label: <FormattedMessage id="rejectAll" />, value: 'r', isAllowedTo: 'PENDING_COMMENT' },
        { label: <FormattedMessage id="spamAll" />, value: 'sp', isAllowedTo: 'PENDING_COMMENT' },
        { label: <FormattedMessage id="trashAll" />, value: 't', isAllowedTo: 'PENDING_COMMENT' }
      ])
      setOpenTab('pending')
    } else if (name === 'approved') {
      setRequestParams({ ...requestParams, eStatus: 'a' })
      setBulkActionDropDown([
        { label: <FormattedMessage id="deleteAll" />, value: 'd', isAllowedTo: 'APPROVE_COMMENT' },
        { label: <FormattedMessage id="rejectAll" />, value: 'r', isAllowedTo: 'APPROVE_COMMENT' },
        { label: <FormattedMessage id="pendingAll" />, value: 'p', isAllowedTo: 'APPROVE_COMMENT' },
        { label: <FormattedMessage id="spamAll" />, value: 'sp', isAllowedTo: 'APPROVE_COMMENT' },
        { label: <FormattedMessage id="trashAll" />, value: 't', isAllowedTo: 'APPROVE_COMMENT' }
      ])
      setOpenTab('approved')
    } else if (name === 'spam') {
      setRequestParams({ ...requestParams, eStatus: 'sp' })
      setBulkActionDropDown([
        { label: <FormattedMessage id="deleteAll" />, value: 'd', isAllowedTo: 'SPAM_COMMENT' },
        { label: <FormattedMessage id="approveAll" />, value: 'a', isAllowedTo: 'SPAM_COMMENT' },
        { label: <FormattedMessage id="rejectAll" />, value: 'r', isAllowedTo: 'SPAM_COMMENT' },
        { label: <FormattedMessage id="pendingAll" />, value: 'p', isAllowedTo: 'SPAM_COMMENT' },
        { label: <FormattedMessage id="trashAll" />, value: 't', isAllowedTo: 'SPAM_COMMENT' }
      ])
      setOpenTab('spam')
    } else if (name === 'rejected') {
      setRequestParams({ ...requestParams, eStatus: 'r' })
      setBulkActionDropDown([
        { label: <FormattedMessage id="deleteAll" />, value: 'd', isAllowedTo: 'REJECT_COMMENT' },
        { label: <FormattedMessage id="approveAll" />, value: 'a', isAllowedTo: 'REJECT_COMMENT' },
        { label: <FormattedMessage id="pendingAll" />, value: 'p', isAllowedTo: 'REJECT_COMMENT' },
        { label: <FormattedMessage id="spamAll" />, value: 'sp', isAllowedTo: 'REJECT_COMMENT' },
        { label: <FormattedMessage id="trashAll" />, value: 't', isAllowedTo: 'REJECT_COMMENT' }
      ])
      setOpenTab('rejected')
    } else if (name === 'trash') {
      setRequestParams({ ...requestParams, eStatus: 't' })
      setBulkActionDropDown([
        { label: <FormattedMessage id="deleteAll" />, value: 'd', isAllowedTo: 'TRASH_COMMENT' },
        { label: <FormattedMessage id="approveAll" />, value: 'a', isAllowedTo: 'TRASH_COMMENT' },
        { label: <FormattedMessage id="rejectAll" />, value: 'r', isAllowedTo: 'TRASH_COMMENT' },
        { label: <FormattedMessage id="pendingAll" />, value: 'p', isAllowedTo: 'TRASH_COMMENT' },
        { label: <FormattedMessage id="spamAll" />, value: 'sp', isAllowedTo: 'TRASH_COMMENT' }
      ])
      setOpenTab('trash')
    }
    setTabs(
      tabs.map((e) => {
        return { ...e, active: e.internalName === name }
      })
    )
  }

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params
    if (data?.eStatus?.length) {
      if (data.eStatus === 'all') {
        return 'all'
      } else if (data.eStatus === 'p') {
        return 'pending'
      } else if (data.eStatus === 'a') {
        return 'approved'
      } else if (data.eStatus === 'r') {
        return 'rejected'
      } else if (data.eStatus === 'sp') {
        return 'spam'
      } else if (data.eStatus === 't') {
        return 'trash'
      }
    } else {
      return 'all'
    }
  }

  function handleSort(field) {
    if (field.internalName !== 'nReportCount') {
      setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
    }
  }

  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }

  function changeCalculationCount(actionName, tabName, digit) {
    setTabs(
      tabs.map((e) => {
        if (actionName === 'delete' && e.internalName === 'all') {
          e.count -= digit
        }
        if (e.internalName !== 'all') {
          if (e.internalName === tabName) {
            return {
              ...e,
              count: e.count - digit
            }
          }
        }
        if (e.internalName === actionName) {
          return {
            ...e,
            count: e.count + digit
          }
        }
        return e
      })
    )
  }

  async function onChangeStatus(item, id, comment) {
    const checkTab = eStatus(comment).toLowerCase()
    if (item === 'Delete') {
      confirmAlert({
        title: labels.confirmationTitle,
        message: labels.confirmationMessage,
        customUI: CustomAlert,
        buttons: [
          {
            label: labels.yes,
            onClick: async () => {
              const { data: changeData } = await statusAction({ variables: { input: { _id: id, eStatus: 'd' } } })
              if (changeData) handleBulkResponse([id], 'd')
              changeCalculationCount('delete', checkTab, 1)
            }
          },
          {
            label: labels.no
          }
        ]
      })
    } else {
      const { data: changeData } = await statusAction({ variables: { input: { _id: id, eStatus: getCommentEnum(item) } } })
      if (changeData) handleBulkResponse([id], getCommentEnum(item))
      changeCalculationCount(getCompleteCommentName(item), checkTab, 1)
    }
  }

  const [statusAction, { loading: statusLoading }] = useMutation(STATUS_FANTASY_COMMENT, {
    onCompleted: (data) => {
      if (data && data.updateFantasyCommentStatus) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.updateFantasyCommentStatus.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  const [bulkAction, { loading: bulkStatusLoading }] = useMutation(BULK_FANTASY_ARTICLE_COMMENT, {
    onCompleted: (data) => {
      if (data && data.bulkFantasyCommentUpdate) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkFantasyCommentUpdate.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
        refetch()
      }
    }
  })

  function handleBulkResponse(aIds, eStatus) {
    if (openTab === 'all') {
      if (eStatus === 'd') {
        setCommentList(commentList.filter((item) => !aIds.includes(item._id)))
      } else {
        setCommentList(commentList.map((item) => (!aIds.includes(item._id) ? item : { ...item, eStatus })))
      }
    } else {
      setCommentList(commentList.filter((item) => !aIds.includes(item._id)))
    }

    setSelectedComment(
      selectedComment.map((item) => {
        return {
          ...item,
          value: false
        }
      })
    )
  }

  function handleCheckbox({ target }) {
    if (target.name === 'selectAll') {
      setSelectedComment(
        selectedComment.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else {
      if (target.checked) {
        setSelectedComment(
          selectedComment.map((item) => {
            if (item._id === target.name) item.value = true
            return item
          })
        )
      } else {
        setSelectedComment(
          selectedComment.map((item) => {
            if (item._id === target.name) item.value = false
            return item
          })
        )
      }
    }
  }

  useEffect(() => {
    params?.eStatus?.length && changeTab(getActiveTabName())
  }, [])

  useEffect(() => {
    const data = setSortType(columns, requestParams.sSortBy)
    setColumns(data)
  }, [requestParams])

  useEffect(() => {
    return history.listen((e) => {
      setRequestParams(getRequestParams(e.search))
      changeTab(getActiveTabName(e.search))
    })
  }, [history])

  useEffect(() => {
    getCommentCount()
  }, [])

  return (
    <>
      <Accordion>
        <DataTable
          className="list-comment"
          columns={columns}
          sortEvent={handleSort}
          totalRecord={totalRecord.current}
          isLoading={loading || statusLoading || bulkStatusLoading || commentCountLoading}
          header={{
            left: {
              bulkAction: true,
              rows: true
            },
            right: {
              search: true
            }
          }}
          headerEvent={(name, value) => handleHeaderEvent(name, value)}
          selectAllEvent={handleCheckbox}
          pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
          pageChangeEvent={handlePageEvent}
          selectAllValue={selectedComment}
          tabs={tabs}
          tabEvent={handleTabChange}
          checkbox
          bulkAction={bulkActionDropDown}
        >
          {commentList.map((comment, index) => {
            return (
              <CommentItemRow
                key={comment._id}
                index={index}
                comment={comment}
                selectedComment={selectedComment}
                onSelect={handleCheckbox}
                onChangeStatus={onChangeStatus}
              />
            )
          })}
        </DataTable>
      </Accordion>
    </>
  )
}

export default FantasyArticleComments
