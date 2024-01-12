import React, { useState, useEffect, useContext, useRef } from 'react'
import PropTypes from 'prop-types'
import { confirmAlert } from 'react-confirm-alert'
import { useMutation, useQuery } from '@apollo/client'
import { useHistory } from 'react-router'
import { FormattedMessage, useIntl } from 'react-intl'

import TagItemRowActive from 'shared/components/tag-item-row-activeTags'
import TagItemRowRequestes from 'shared/components/tag-item-row-requests'
import TagItemRowRequested from 'shared/components/tag-item-row-requested'
import TopBar from 'shared/components/top-bar'
import DataTable from 'shared/components/data-table'
import CustomAlert from 'shared/components/alert'
import { allRoutes } from 'shared/constants/AllRoutes'
import { DELETE_TAG, STATUS_TAG, BULK_OPERATION } from 'graph-ql/management/tag/mutation'
import { GET_TAG_LIST, GET_TAGS_COUNT } from 'graph-ql/management/tag/query'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { setSortType, parseParams, appendParams, checkTag } from 'shared/utils'

function Tags({ userPermission }) {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const { dispatch } = useContext(ToastrContext)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [tagList, setTagList] = useState()
  const [totalRecord, setTotalRecord] = useState(0)
  const [selectedTag, setSelectedTag] = useState([])
  const [tabs, setTabs] = useState([
    { name: <FormattedMessage id="activeTags" />, internalName: 'activeTags', active: true, isAllowedTo: 'LIST_ACTIVE_TAG' },
    { name: <FormattedMessage id="requests" />, internalName: 'Requests', active: false, isAllowedTo: 'LIST_REQUESTS_TAG' },
    { name: <FormattedMessage id="requested" />, internalName: 'Requested', active: false }
  ])
  const [selectedTab, setSelectedTab] = useState('activeTags')
  const [columns, setColumns] = useState(getActionColumns(selectedTab))
  const actionPermission = useRef([])
  const [bulkActionDropDown, setBulkActionDropDown] = useState(getBulkActionItem(selectedTab))
  const bulkActionPermission = useRef([])
  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }
  const { loading, refetch } = useQuery(GET_TAG_LIST, {
    variables: {
      input: {
        aStatusFiltersInput: requestParams.aStatusFiltersInput,
        getTagsPaginationInput: {
          aType: ['gt'],
          nLimit: requestParams.nLimit,
          nOrder: requestParams.nOrder,
          sSearch: requestParams.sSearch,
          sSortBy: requestParams.sSortBy,
          nSkip: requestParams.nSkip
        }
      }
    },
    onCompleted: (data) => {
      handleApiResponse(data)
    }
  })

  const { tagCountLoading } = useQuery(GET_TAGS_COUNT, {
    onCompleted: (data) => {
      if (data && data?.getTagCounts) {
        setTabs(
          tabs.map((e) => {
            if (e.internalName === 'Requests') {
              return { ...e, count: data?.getTagCounts?.nRequest > 0 ? data?.getTagCounts?.nRequest : '0' }
            }
            if (e.internalName === 'activeTags') {
              return { ...e, count: data?.getTagCounts?.nActiveTag > 0 ? data.getTagCounts?.nActiveTag : '0' }
            }
            if (e.internalName === 'Requested') {
              return { ...e, count: data?.getTagCounts?.nRequestedTag > 0 ? data.getTagCounts?.nRequestedTag : '0' }
            } else {
              return { ...e }
            }
          })
        )
      }
    }
  })

  function handleApiResponse(data) {
    if (data && data?.getTags?.aResults) {
      setSelectedTag(
        data.getTags.aResults.map((item) => {
          return {
            _id: item._id,
            value: false
          }
        })
      )
      setTagList(data.getTags.aResults)
      setTotalRecord(data.getTags.nTotal)
    }
  }

  function checkPermission() {
    checkPermissionAndGetParam().activeTabName !== 'activeTags' && changeTab(checkPermissionAndGetParam().activeTabName)
  }

  function handleTabChange(name) {
    if (name === 'Requests') {
      setRequestParams({ ...requestParams, aStatusFiltersInput: ['r'], nSkip: 1 })
      appendParams({ aStatusFiltersInput: ['r'], nSkip: 1 })
    } else if (name === 'activeTags') {
      setRequestParams({ ...requestParams, aStatusFiltersInput: ['a', 'i'], nSkip: 1 })
      appendParams({ aStatusFiltersInput: ['a', 'i'], nSkip: 1 })
    } else if (name === 'Requested') {
      setRequestParams({ ...requestParams, aStatusFiltersInput: ['r', 'dec', 'a'], nSkip: 1 })
      appendParams({ aStatusFiltersInput: ['r', 'dec', 'a'], nSkip: 1 })
    }
    changeTab(name)
  }
  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      aStatusFiltersInput: data.aStatusFiltersInput || checkPermissionAndGetParam().params,
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || ''
    }
  }

  function changeTab(name) {
    setSelectedTab(name)
    setBulkActionDropDown(getBulkActionItem(name))
    setColumns(getActionColumns(name))
    setTabs(
      tabs.map((e) => {
        return { ...e, active: e.internalName === name }
      })
    )
  }

  function getBulkActionItem(name) {
    if (name === 'Requests') {
      actionPermission.current = ['APPROVE_REJECT_REQUESTS_TAG', 'DELETE_REQUESTS_TAG']
      return [{ label: <FormattedMessage id="deleteAll" />, value: 'd', isAllowedTo: 'DELETE_REQUESTS_TAG' }]
    } else if (name === 'activeTags') {
      actionPermission.current = ['CHANGE_STATUS_ACTIVE_TAG', 'EDIT_ACTIVE_TAG', 'DELETE_ACTIVE_TAG']
      return [
        { label: <FormattedMessage id="deleteAll" />, value: 'd', isAllowedTo: 'DELETE_ACTIVE_TAG' },
        { label: <FormattedMessage id="activeAll" />, value: 'a', isAllowedTo: 'CHANGE_STATUS_ACTIVE_TAG' },
        { label: <FormattedMessage id="deactivateAll" />, value: 'i', isAllowedTo: 'CHANGE_STATUS_ACTIVE_TAG' }
      ]
    } else if (name === 'Requested') {
      actionPermission.current = []
      return [{ label: 'Delete All', value: 'd' }]
    }
  }

  function getActionColumns(name) {
    const data = params.current
    if (name === 'Requests') {
      const clm = [
        { name: <FormattedMessage id="name" />, internalName: 'sName', type: 0 },
        { name: <FormattedMessage id="type" />, internalName: 'eType', type: 0 },
        { name: <FormattedMessage id="slug" />, internalName: 'sSlug', type: 0 },
        { name: <FormattedMessage id="dateReceived" />, internalName: 'dCreated', type: 0 },
        { name: <FormattedMessage id="requestForm" />, internalName: 'sSubmittedBy', type: 0 }
      ]
      return clm.map((e) => {
        if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
        return e
      })
    } else if (name === 'activeTags') {
      const clm = [
        { name: <FormattedMessage id="name" />, internalName: 'sName', type: 0 },
        { name: <FormattedMessage id="type" />, internalName: 'eType', type: 0 },
        { name: <FormattedMessage id="slug" />, internalName: 'sSlug', type: 0 },
        { name: <FormattedMessage id="count" />, internalName: 'nCount', type: 0 },
        { name: <FormattedMessage id="createBy" />, internalName: 'sSubmittedBy', type: 0 }
      ]
      return clm.map((e) => {
        if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
        return e
      })
    } else if (name === 'Requested') {
      const clm = [
        { name: <FormattedMessage id="name" />, internalName: 'sName', type: 0 },
        { name: <FormattedMessage id="type" />, internalName: 'eType', type: 0 },
        { name: <FormattedMessage id="slug" />, internalName: 'sSlug', type: 0 },
        { name: <FormattedMessage id="dateReceived" />, internalName: 'dCreated', type: 0 },
        { name: <FormattedMessage id="requestForm" />, internalName: 'sSubmittedBy', type: 0 },
        { name: <FormattedMessage id="status" />, internalName: 'eStatus', type: 0 }
      ]
      return clm.map((e) => {
        if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
        return e
      })
    }
  }

  function checkPermissionAndGetParam() {
    if (!userPermission.includes('LIST_ACTIVE_TAG') && userPermission.includes('LIST_REQUESTS_TAG')) {
      return {
        params: ['r'],
        activeTabName: 'Requests'
      }
    } else if (!userPermission.includes('LIST_ACTIVE_TAG') && !userPermission.includes('LIST_REQUESTS_TAG')) {
      return {
        params: ['r', 'dec', 'a'],
        activeTabName: 'Requested'
      }
    } else {
      return {
        params: ['a', 'i'],
        activeTabName: 'activeTags'
      }
    }
  }

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    if (data?.aStatusFiltersInput?.length) {
      if (data.aStatusFiltersInput.toString() === 'r') {
        return 'Requests'
      } else if (data.aStatusFiltersInput.toString() === 'a,i') {
        return 'activeTags'
      } else if (data.aStatusFiltersInput.toString() === 'r,dec,a') {
        return 'Requested'
      }
    } else {
      return checkPermissionAndGetParam().activeTabName
    }
  }

  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'newTag':
        history.push(allRoutes.addTag)
        break
      case 'download':
        console.log('Download')
        break
      default:
        break
    }
  }

  const [delAction, { loading: delLoading }] = useMutation(DELETE_TAG, {
    onCompleted: (data) => {
      if (data && data.deleteTag) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.deleteTag.sMessage, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
      }
    }
  })

  function handleBulkResponse(aIds, eType) {
    if (eType === 'd') {
      if (requestParams?.nLimit / 2 >= tagList?.length || requestParams?.nLimit / 2 <= aIds?.length) {
        handleMultipleDelete()
      } else {
        setTagList(tagList.filter((item) => !aIds.includes(item._id)))
      }
    } else if (['a', 'i'].includes(eType)) {
      setTagList(
        tagList.map((item) => {
          if (aIds.includes(item._id)) return { ...item, eStatus: eType }
          return item
        })
      )
    } else if (eType === 'dec') {
      setTagList(tagList.filter((item) => !aIds.includes(item._id)))
    } else if (eType === 'approved') {
      setTagList(tagList.filter((item) => !aIds.includes(item._id)))
    }

    setSelectedTag(
      selectedTag.map((item) => {
        return {
          ...item,
          value: false
        }
      })
    )
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
            const { data } = await delAction({ variables: { input: { _id: id, eType: checkTag(selectedTab) } } })
            if (data && data.deleteTag) handleBulkResponse([id], 'd')
            changeCount('delete', 1, selectedTab)
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }

  const [bulkAction, { loading: bulkLoading }] = useMutation(BULK_OPERATION, {
    onCompleted: (data) => {
      if (data && data.bulkTagUpdate) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkTagUpdate.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })
  const [statusAction, { loading: statusLoading }] = useMutation(STATUS_TAG, {
    onCompleted: (data) => {
      if (data && data.updateTagStatus) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.updateTagStatus.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })
  useEffect(() => {
    params.current?.aStatusFiltersInput?.length && changeTab(getActiveTabName())
    checkPermission()
  }, [])

  useEffect(() => {
    bulkActionPermission.current = bulkActionDropDown.map((e) => e.isAllowedTo)
  }, [bulkActionDropDown])

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      setRequestParams(getRequestParams(e.search))
      changeTab(getActiveTabName(e.search))
    })
  }, [history])

  function handleCheckbox({ target }) {
    if (target.name === 'selectAll') {
      setSelectedTag(
        selectedTag.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else {
      if (target.checked) {
        setSelectedTag(
          selectedTag.map((item) => {
            if (item._id === target.name) item.value = true
            return item
          })
        )
      } else {
        setSelectedTag(
          selectedTag.map((item) => {
            if (item._id === target.name) item.value = false
            return item
          })
        )
      }
    }
  }
  function changeCount(action, digit, tabName) {
    setTabs(
      tabs.map((e) => {
        if (action === 'delete') {
          if (e.internalName === tabName) {
            return { ...e, count: e.count - digit }
          }
          if (tabName !== 'Requests' && e.internalName !== 'Requests' && e.internalName !== tabName) {
            return { ...e, count: e.count - digit }
          }
        }
        if (action === 'approve') {
          if (e.internalName === 'Requests') {
            return { ...e, count: e.count - digit }
          }
          if (e.internalName === 'activeTags') {
            return { ...e, count: e.count + digit }
          }
        }
        if (action === 'decline') {
          if (e.internalName === 'Requests') {
            return { ...e, count: e.count - digit }
          }
        }
        return e
      })
    )
  }

  async function handleHeaderEvent(name, value) {
    switch (name) {
      case 'bulkAction': {
        const tag = selectedTag.map((a) => ({ ...a }))
        const obj = {
          bulkIds: tag.filter((item) => item.value && delete item.value),
          eStatus: value
        }
        const { data } = await bulkAction({
          variables: {
            input: {
              aId: obj.bulkIds.map((id) => {
                return id._id
              }),
              eStatus: obj.eStatus,
              eType: checkTag(selectedTab)
            }
          }
        })
        if (data) {
          if (value === 'd') {
            handleBulkResponse(
              tag.filter((item) => item.value === undefined && item).map((e) => e._id),
              value
            )
            changeCount('delete', obj.bulkIds.length, selectedTab)
          }
          handleBulkResponse(
            tag.filter((item) => item.value === undefined && item).map((e) => e._id),
            value
          )
        }
        break
      }
      case 'rows':
        setRequestParams({ ...requestParams, nLimit: Number(value) })
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

  async function onIsApprove(target, type) {
    if (type === 'approved') {
      const { data } = await statusAction({ variables: { input: { _id: target, eStatus: 'ap' } } })
      if (data?.updateTagStatus) handleBulkResponse([target], 'approved')
      changeCount('approve', 1)
    } else {
      const { data } = await statusAction({ variables: { input: { _id: target, eStatus: 'dec' } } })
      if (data?.updateTagStatus) handleBulkResponse([target], 'dec')
      changeCount('decline', 1)
    }
  }

  async function handleStatusChange({ target }) {
    const { data } = await statusAction({ variables: { input: { _id: target.name, eStatus: target.checked ? 'a' : 'i' } } })
    if (data?.updateTagStatus) handleBulkResponse([target.name], target.checked ? 'i' : 'a')
  }

  function handleSort(field) {
    if (field.internalName !== 'sSlug') {
      setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      const data = setSortType(columns, field.internalName)
      setColumns(data)
    }
  }
  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }

  async function handleMultipleDelete() {
    if (tagList?.length === 0) {
      const lastPage = Math.ceil(totalRecord / requestParams?.nLimit)
      handlePageEvent(lastPage - 1)
    } else {
      const { data } = await refetch()
      handleApiResponse(data)
    }
  }

  return (
    <>
      <TopBar
        buttons={[
          {
            text: <FormattedMessage id="newTag" />,
            icon: 'icon-add',
            type: 'primary',
            clickEventName: 'newTag',
            isAllowedTo: 'CREATE_TAG'
          },
          {
            text: <FormattedMessage id="download" />,
            icon: 'icon-download',
            type: 'outline-secondary',
            clickEventName: 'download',
            isAllowedTo: 'CREATE_TAG'
          }
        ]}
        btnEvent={handleBtnEvent}
      />
      <DataTable
        className={selectedTab === 'activeTags' && 'tags-list'}
        columns={columns}
        bulkAction={bulkActionDropDown}
        sortEvent={handleSort}
        totalRecord={totalRecord}
        isLoading={loading || delLoading || statusLoading || bulkLoading || tagCountLoading}
        header={{
          left: {
            bulkAction:
              selectedTab === 'Requested' ? true : !!userPermission.filter((p) => bulkActionPermission.current.includes(p)).length,
            rows: true
          },
          right: {
            search: true
          }
        }}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        selectAllEvent={handleCheckbox}
        pageChangeEvent={handlePageEvent}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        selectAllValue={selectedTag}
        tabs={tabs}
        tabEvent={handleTabChange}
        checkbox={selectedTab === 'Requested' ? true : !!userPermission.filter((p) => bulkActionPermission.current.includes(p)).length}
        actionColumn={selectedTab === 'Requested' ? true : !!userPermission.filter((p) => actionPermission.current.includes(p)).length}
      >
        {tagList?.map((tag, index) => {
          if (selectedTab === 'activeTags') {
            return (
              <TagItemRowActive
                key={tag?._id}
                index={index}
                tag={tag}
                selectedTag={selectedTag}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onSelect={handleCheckbox}
                bulkPermission={bulkActionPermission.current}
                actionPermission={actionPermission.current}
              />
            )
          } else if (selectedTab === 'Requests') {
            return (
              <TagItemRowRequestes
                key={tag._id}
                index={index}
                tag={tag}
                selectedTag={selectedTag}
                onDelete={handleDelete}
                onSelect={handleCheckbox}
                onIsApprove={onIsApprove}
                bulkPermission={bulkActionPermission.current}
                actionPermission={actionPermission.current}
              />
            )
          } else {
            return (
              <TagItemRowRequested
                key={tag._id}
                index={index}
                tag={tag}
                selectedTag={selectedTag}
                onDelete={handleDelete}
                onSelect={handleCheckbox}
              />
            )
          }
        })}
      </DataTable>
    </>
  )
}
Tags.propTypes = {
  userPermission: PropTypes.array
}
export default Tags
