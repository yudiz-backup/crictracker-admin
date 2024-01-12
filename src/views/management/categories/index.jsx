import React, { useContext, useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router'
import { useQuery, useMutation } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import CategorySimpleParentItemRow from 'shared/components/category-simple-parent-item-row'
import CategoryApiSeriesItemRow from 'shared/components/category-api-series-item-row'
import TopBar from 'shared/components/top-bar'
import DataTable from 'shared/components/data-table'
import CustomAlert from 'shared/components/alert'
import { allRoutes } from 'shared/constants/AllRoutes'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { setSortType, parseParams, appendParams } from 'shared/utils'
import { GET_CATEGORY_LIST, DELETE_CATEGORY, STATUS_CATEGORY, BULK_OPERATION, GET_CATEGORY_COUNT } from 'graph-ql/management/category'
function Categories({ userPermission }) {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const { dispatch } = useContext(ToastrContext)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [categoryList, setCategoryList] = useState([])
  const [selectedCategory, setSelectedCategory] = useState([])
  const totalRecord = useRef(0)
  const [tabs, setTabs] = useState([
    { name: <FormattedMessage id="simple" />, internalName: 'simple', active: true, isAllowedTo: 'LIST_CATEGORY' },
    { name: <FormattedMessage id="apiSeries" />, internalName: 'apiSeries', active: false, isAllowedTo: 'LIST_CATEGORY' },
    { name: <FormattedMessage id="parent" />, internalName: 'parent', active: false, isAllowedTo: 'LIST_CATEGORY' }
  ])
  const selectedTab = useRef('simple')
  const columns = useRef(getActionColumns(selectedTab.current))
  const bulkActionDropDown = [
    { label: 'Delete All', value: 'd', isAllowedTo: 'DELETE_CATEGORY' },
    { label: 'Active  All', value: 'a', isAllowedTo: 'CHANGE_STATUS_CATEGORY' },
    { label: 'Deactivate All', value: 'i', isAllowedTo: 'CHANGE_STATUS_CATEGORY' }
  ]
  const bulkActionPermission = bulkActionDropDown.map((e) => e.isAllowedTo)

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteAllItem' })
  }
  const { categoryCountLoading } = useQuery(GET_CATEGORY_COUNT, {
    onCompleted: (data) => {
      if (data && data?.getCategoryCount) {
        setTabs(
          tabs.map((e) => {
            if (e.internalName === 'apiSeries') {
              return { ...e, count: data?.getCategoryCount?.nAS > 0 ? data?.getCategoryCount?.nAS : '0' }
            }
            if (e.internalName === 'parent') {
              return { ...e, count: data?.getCategoryCount?.nP > 0 ? data.getCategoryCount?.nP : '0' }
            }
            if (e.internalName === 'simple') {
              return { ...e, count: data?.getCategoryCount?.nS > 0 ? data.getCategoryCount?.nS : '0' }
            } else {
              return { ...e }
            }
          })
        )
      }
    }
  })
  const { loading, refetch } = useQuery(GET_CATEGORY_LIST, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      handleApiResponse(data)
    }
  })

  const [delAction, { loading: delLoading }] = useMutation(DELETE_CATEGORY, {
    onCompleted: (data) => {
      if (data && data.deleteCategory) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.deleteCategory.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  const [statusAction, { loading: statusLoading }] = useMutation(STATUS_CATEGORY, {
    onCompleted: (data) => {
      if (data && data.updateCategoryStatus) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.updateCategoryStatus.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  const [bulkAction, { loading: bulkLoading }] = useMutation(BULK_OPERATION, {
    onCompleted: (data) => {
      if (data && data.bulkCategoryUpdate) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkCategoryUpdate.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  useEffect(() => {
    params.current?.aType && changeTab(getActiveTabName())
  }, [])

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      setRequestParams(getRequestParams(e.search))
      changeTab(getActiveTabName(e.search))
    })
  }, [history])

  function handleApiResponse(data) {
    if (data && data?.getCategory.aResults) {
      setSelectedCategory(
        data.getCategory.aResults.map((item) => {
          return {
            _id: item._id,
            value: false
          }
        })
      )
      totalRecord.current = data.getCategory.nTotal
      setCategoryList(data.getCategory.aResults)
    }
  }

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      aType: data?.aType || ['s'],
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || ''
    }
  }

  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'newCategory':
        history.push(allRoutes.addCategory)
        break
      case 'download':
        console.log('Download')
        break
      default:
        break
    }
  }

  function getActionColumns(name) {
    const data = params.current
    if (name === 'simple' || name === 'parent') {
      const clm = [
        { name: <FormattedMessage id="name" />, internalName: 'sName', type: 0 },
        { name: <FormattedMessage id="slug" />, internalName: 'sSlug', type: 0 },
        { name: <FormattedMessage id="parent" />, internalName: 'oParentCategory.sName', type: 0 },
        { name: <FormattedMessage id="createdBy" />, internalName: 'oSubAdmin.sFName', type: 0 },
        { name: <FormattedMessage id="count" />, internalName: 'nCount', type: 0 }
      ]
      return clm.map((e) => {
        if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
        return e
      })
    } else if (name === 'apiSeries') {
      const clm = [
        { name: <FormattedMessage id="name" />, internalName: 'sName', type: 0 },
        { name: <FormattedMessage id="slug" />, internalName: 'sSlug', type: 0 },
        { name: <FormattedMessage id="series" />, internalName: 'oSeries.sTitle', type: 0 },
        { name: <FormattedMessage id="parent" />, internalName: 'oParentCategory.sName', type: 0 },
        { name: <FormattedMessage id="createdBy" />, internalName: 'oSubAdmin.sFName', type: 0 },
        { name: <FormattedMessage id="count" />, internalName: 'nCount', type: 0 }
      ]
      return clm.map((e) => {
        if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
        return e
      })
    }
  }

  function handleTabChange(name) {
    if (name === 'simple') {
      setRequestParams({ ...requestParams, aType: ['s'], nSkip: 1 })
      appendParams({ aType: ['s'], nSkip: 1 })
    } else if (name === 'apiSeries') {
      setRequestParams({ ...requestParams, aType: ['as'], nSkip: 1 })
      appendParams({ aType: ['as'], nSkip: 1 })
    } else if (name === 'parent') {
      setRequestParams({ ...requestParams, aType: ['pct'], nSkip: 1 })
      appendParams({ aType: ['pct'], nSkip: 1 })
    }
    changeTab(name)
  }

  function changeTab(name) {
    selectedTab.current = name
    columns.current = getActionColumns(name)
    setTabs(
      tabs.map((e) => {
        return { ...e, active: e.internalName === name }
      })
    )
  }

  function handleBulkResponse(aIds, eType) {
    if (eType === 'd') {
      if (requestParams?.nLimit / 2 >= categoryList?.length || requestParams?.nLimit / 2 <= aIds?.length) {
        handleMultipleDelete()
      } else {
        setCategoryList(categoryList.filter((item) => !aIds.includes(item._id)))
      }
    } else if (['a', 'i'].includes(eType)) {
      setCategoryList(
        categoryList.map((item) => {
          if (aIds.includes(item._id)) return { ...item, eStatus: eType }
          return item
        })
      )
    }
    setSelectedCategory(
      selectedCategory.map((item) => {
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
            const { data } = await delAction({ variables: { input: { _id: id } } })
            if (data && data.deleteCategory) handleBulkResponse([id], 'd')
            changeCount('delete', 1, selectedTab.current)
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }

  async function handleHeaderEvent(name, value) {
    switch (name) {
      case 'bulkAction': {
        const category = selectedCategory.map((a) => ({ ...a }))
        const obj = {
          bulkIds: category.filter((item) => item.value && delete item.value),
          eStatus: value
        }
        if (obj.eStatus === 'd') {
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
            handleBulkResponse(
              category.filter((item) => item.value === undefined && item).map((e) => e._id),
              value
            )
            changeCount('delete', obj.bulkIds.length, selectedTab.current)
          }
        } else if (['a', 'i'].includes(obj.eStatus)) {
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
            handleBulkResponse(
              category.filter((item) => item.value === undefined && item).map((e) => e._id),
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
      default:
        break
    }
  }

  function handleSort(field) {
    if (
      field.internalName !== 'sSlug' &&
      field.internalName !== 'oSubAdmin.sFName' &&
      field.internalName !== 'oSeries.sTitle' &&
      field.internalName !== 'oParentCategory.sName'
    ) {
      setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      const data = setSortType(columns.current, field.internalName)
      columns.current = data
    }
  }

  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }

  function handleCheckbox({ target }) {
    if (target.name === 'selectAll') {
      setSelectedCategory(
        selectedCategory.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else {
      if (target.checked) {
        setSelectedCategory(
          selectedCategory.map((item) => {
            if (item._id === target.name) item.value = true
            return item
          })
        )
      } else {
        setSelectedCategory(
          selectedCategory.map((item) => {
            if (item._id === target.name) item.value = false
            return item
          })
        )
      }
    }
  }

  async function handleStatusChange({ target }) {
    const { data } = await statusAction({ variables: { input: { _id: target.name, eStatus: target.checked ? 'a' : 'i' } } })
    if (data?.updateCategoryStatus) handleBulkResponse([target.name], target.checked ? 'i' : 'a')
  }

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    if (data?.aType) {
      if (data.aType.toString() === 's') {
        return 'simple'
      } else if (data.aType.toString() === 'as') {
        return 'apiSeries'
      } else if (data.aType.toString() === 'pct') {
        return 'parent'
      }
    } else {
      return 'simple'
    }
  }
  function changeCount(action, digit, tabName) {
    setTabs(
      tabs.map((e) => {
        if (action === 'delete') {
          if (e.internalName === tabName) {
            return { ...e, count: e.count - digit }
          }
        }
        return e
      })
    )
  }
  async function handleMultipleDelete() {
    if (categoryList?.length === 0) {
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
          { text: 'New Category', icon: 'icon-add', type: 'primary', clickEventName: 'newCategory', isAllowedTo: 'CREATE_CATEGORY' },
          { text: 'Download', icon: 'icon-download', type: 'outline-secondary', clickEventName: 'download', isAllowedTo: 'CREATE_CATEGORY' }
        ]}
        btnEvent={handleBtnEvent}
      />
      <DataTable
        className="category-list"
        columns={columns.current}
        bulkAction={bulkActionDropDown}
        sortEvent={handleSort}
        totalRecord={totalRecord.current}
        isLoading={loading || delLoading || statusLoading || bulkLoading || categoryCountLoading}
        header={{
          left: {
            bulkAction: !!userPermission.filter((p) => bulkActionPermission.includes(p)).length,
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
        selectAllValue={selectedCategory}
        tabs={tabs}
        tabEvent={handleTabChange}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
        actionColumn
      >
        {categoryList.map((category, index) => {
          if (selectedTab.current === 'apiSeries') {
            return (
              <CategoryApiSeriesItemRow
                key={category._id}
                index={index}
                category={category}
                selectedCategory={selectedCategory}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onSelect={handleCheckbox}
                bulkPermission={bulkActionPermission}
              />
            )
          } else {
            return (
              <CategorySimpleParentItemRow
                key={category._id}
                index={index}
                category={category}
                selectedCategory={selectedCategory}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onSelect={handleCheckbox}
                bulkPermission={bulkActionPermission}
              />
            )
          }
        })}
      </DataTable>
    </>
  )
}
Categories.propTypes = {
  userPermission: PropTypes.array
}
export default Categories
