import React, { useContext, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useMutation, useQuery } from '@apollo/client'
import { confirmAlert } from 'react-confirm-alert'
import { FormattedMessage, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'

import { GET_FEEDBACKS_LIST, BULK_OPERATION } from 'graph-ql/help/feedbacks'
import CustomAlert from 'shared/components/alert'
import FeedbackItemRow from 'shared/components/feedback-item-row'
import DataTable from 'shared/components/data-table'
import { ToastrContext } from 'shared/components/toastr'
import { setSortType, parseParams, appendParams } from 'shared/utils'
import { TOAST_TYPE } from 'shared/constants'
import Drawer from 'shared/components/drawer'
import FeedbackContactFilter from 'shared/components/feedback-contact-filter'

function Feedbacks({ userPermission }) {
  const history = useHistory()
  const { dispatch } = useContext(ToastrContext)
  const params = useRef(parseParams(location.search))
  const [selectedFeedback, setSelectedFeedback] = useState([])
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const totalRecord = useRef(0)
  const [feedbackList, setFeedbackList] = useState([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const columns = useRef([
    { name: <FormattedMessage id="name" />, internalName: 'sName', type: 0 },
    { name: <FormattedMessage id="email" />, internalName: 'sEmail', type: 0 },
    { name: <FormattedMessage id="typeOfQuery" />, internalName: 'eQueryType', type: 0 },
    { name: <FormattedMessage id="subject" />, internalName: 'sSubject', type: 0 }
  ])
  const [tabs, setTabs] = useState([
    { name: <FormattedMessage id="editorialFeedback" />, internalName: 'editorialFeedback', active: true },
    { name: <FormattedMessage id="siteFeedback" />, internalName: 'siteFeedback', active: false },
    { name: <FormattedMessage id="appFeedback" />, internalName: 'appFeedback', active: false }
  ])
  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }
  const bulkActionDropDown = [{ label: 'Delete All', value: 'd', isAllowedTo: 'DELETE_FEEDBACK' }]
  const bulkActionPermission = bulkActionDropDown.map((e) => e.isAllowedTo)

  const { loading, refetch } = useQuery(GET_FEEDBACKS_LIST, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      if (data && data?.getFeedbacks?.aResults) {
        setSelectedFeedback(
          data.getFeedbacks.aResults.map((item) => {
            return {
              _id: item._id,
              value: false
            }
          })
        )
        totalRecord.current = data.getFeedbacks.nTotal
        setFeedbackList(data?.getFeedbacks?.aResults)
      }
    }
  })

  const [bulkAction, { loading: bulkLoading }] = useMutation(BULK_OPERATION, {
    onCompleted: (data) => {
      if (data && data.bulkFeedbackDelete) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkFeedbackDelete.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
        refetch()
      }
    }
  })

  useEffect(() => {
    const data = setSortType(columns.current, requestParams.sSortBy)
    columns.current = data
  }, [requestParams])

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      setRequestParams(getRequestParams(e.search))
      changeTab(getActiveTabName(e.search))
    })
  }, [history])

  useEffect(() => {
    params.current?.eQueryType?.length && changeTab(getActiveTabName())
    checkTab()
  }, [])

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || '',
      eQueryType: data.eQueryType || 'e',
      aState: data.aState || ['r', 'ur']
    }
  }

  function handleDelete(id) {
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.confirmationMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            const { data } = await bulkAction({ variables: { input: { aId: id } } })
            if (data && data.bulkFeedbackDelete) handleBulkResponse(id, 'd')
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }

  function handleBulkResponse(aIds, eType) {
    if (eType === 'd') {
      setFeedbackList(feedbackList.filter((item) => !aIds.includes(item._id)))
    } else if (['a', 'i'].includes(eType)) {
      setFeedbackList(
        feedbackList.map((item) => {
          if (aIds.includes(item._id)) return { ...item, eStatus: eType }
          return item
        })
      )
    }
    setSelectedFeedback(
      selectedFeedback.map((item) => {
        return {
          ...item,
          value: false
        }
      })
    )
  }

  async function handleHeaderEvent(name, value) {
    switch (name) {
      case 'bulkAction': {
        const feedback = selectedFeedback.map((a) => ({ ...a }))
        const obj = {
          aId: feedback.filter((item) => item.value && delete item.value),
          eStatus: value
        }
        if (obj.eStatus === 'd') {
          const { data } = await bulkAction({
            variables: {
              input: {
                aId: obj.aId.map((id) => {
                  return id._id
                })
              }
            }
          })
          if (data) {
            handleBulkResponse(
              feedback.filter((item) => item.value === undefined && item).map((e) => e._id),
              value
            )
          }
        } else if (['a', 'i'].includes(obj.eStatus)) {
          const { data } = await bulkAction({
            variables: {
              input: {
                bulkIds: obj.bulkIds.map((id) => {
                  return id._id
                })
              }
            }
          })
          if (data) {
            handleBulkResponse(
              feedback.filter((item) => item.value === undefined && item).map((e) => e._id),
              value
            )
          }
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
      case 'filter':
        setIsFilterOpen(value)
        break
      default:
        break
    }
  }

  function handleCheckbox({ target }) {
    if (target.name === 'selectAll') {
      setSelectedFeedback(
        selectedFeedback.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else {
      if (target.checked) {
        setSelectedFeedback(
          selectedFeedback.map((item) => {
            if (item._id === target.name) item.value = true
            return item
          })
        )
      } else {
        setSelectedFeedback(
          selectedFeedback.map((item) => {
            if (item._id === target.name) item.value = false
            return item
          })
        )
      }
    }
  }

  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }

  function handleSort(field) {
    if (field.internalName !== 'sSlug') {
      setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
    }
  }

  function handleTabChange(name) {
    if (name === 'editorialFeedback') {
      setRequestParams({ ...requestParams, eQueryType: 'e', nSkip: 1 })
      appendParams({ eQueryType: 'e', nSkip: 1 })
    } else if (name === 'siteFeedback') {
      setRequestParams({ ...requestParams, eQueryType: 's', nSkip: 1 })
      appendParams({ eQueryType: 's', nSkip: 1 })
    } else if (name === 'appFeedback') {
      setRequestParams({ ...requestParams, eQueryType: 'a', nSkip: 1 })
      appendParams({ eQueryType: 'a', nSkip: 1 })
    }
    changeTab(name)
  }

  function changeTab(name) {
    setTabs(
      tabs.map((e) => {
        return { ...e, active: e.internalName === name }
      })
    )
  }

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    if (data?.eQueryType?.length) {
      if (data.eQueryType.toString() === 'e') {
        return 'editorialFeedback'
      } else if (data.eQueryType.toString() === 's') {
        return 'siteFeedback'
      } else if (data.eQueryType.toString() === 'a') {
        return 'appFeedback'
      } else {
        return checkTagParam().activeTabName
      }
    }
  }

  function checkTab() {
    checkTagParam().activeTabName !== 'editorialFeedback' && changeTab(checkTagParam().activeTabName)
  }

  function checkTagParam() {
    if (requestParams.eQueryType === 'e') {
      return {
        params: 'e',
        activeTabName: 'editorialFeedback'
      }
    } else if (requestParams.eQueryType === 's') {
      return { params: 's', activeTabName: 'siteFeedback' }
    } else if (requestParams.eQueryType === 'a') {
      return { params: 'a', activeTabName: 'appFeedback' }
    }
  }

  function handleFilterChange({ data }) {
    if (data.aState.length !== 0) {
      setRequestParams({ ...requestParams, nSkip: 1, aState: data.aState })
      appendParams({ nSkip: 1, aState: data.aState })
    } else {
      setRequestParams({ ...requestParams, nSkip: 1, aState: ['r', 'ur'] })
      appendParams({ nSkip: 1, aState: [] })
    }
    setIsFilterOpen(!isFilterOpen)
  }

  return (
    <>
      <DataTable
        bulkAction={bulkActionDropDown}
        columns={columns.current}
        sortEvent={handleSort}
        tabs={tabs}
        tabEvent={handleTabChange}
        totalRecord={totalRecord.current}
        isLoading={loading || bulkLoading}
        header={{
          left: {
            bulkAction: !!userPermission.filter((p) => bulkActionPermission.includes(p)).length,
            rows: true
          },
          right: {
            search: true,
            filter: true
          }
        }}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        selectAllEvent={handleCheckbox}
        pageChangeEvent={handlePageEvent}
        selectAllValue={selectedFeedback}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
        actionColumn
      >
        {feedbackList?.map((feedback, index) => {
          return (
            <FeedbackItemRow
              key={feedback._id}
              index={index}
              feedback={feedback}
              selectedFeedback={selectedFeedback}
              onDelete={handleDelete}
              onSelect={handleCheckbox}
              bulkPermission={bulkActionPermission}
            />
          )
        })}
        <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(!isFilterOpen)} title={useIntl().formatMessage({ id: 'filterStatus' })}>
          <FeedbackContactFilter filterChange={handleFilterChange} />
        </Drawer>
      </DataTable>
    </>
  )
}

Feedbacks.propTypes = {
  userPermission: PropTypes.array
}
export default Feedbacks
