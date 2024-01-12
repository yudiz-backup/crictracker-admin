import React, { useState, useEffect, useContext, useRef } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import Drawer from 'shared/components/drawer'
import DataTable from 'shared/components/data-table'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { setSortType, parseParams, appendParams, getQueryVariable } from 'shared/utils'
import PlayerTeamFilters from 'shared/components/player-team-filters'
import TeamTagItemRow from 'shared/components/team-tag-item-row'
import { GET_TEAM_TAGS } from 'graph-ql/management/team'
import { DELETE_TAG, STATUS_TAG } from 'graph-ql/management/tag/mutation'
import { BULK_OPERATION_PLAYERS, BULK_STATUS_UPDATE, GET_COUNTS } from 'graph-ql/management/player'
import { GET_TAG_LIST } from 'graph-ql/management/tag/query'
import CustomAlert from 'shared/components/alert'
import PlayerTeamApprovedTagItemRow from 'shared/components/player-team-approved-tag-item-row'

function Teams({ userPermission }) {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const { dispatch } = useContext(ToastrContext)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [tagList, setTagList] = useState([])
  const [totalRecord, setTotalRecord] = useState(0)
  const tabNameParam = getQueryVariable('tabName')

  const [selectedTag, setSelectedTag] = useState([])
  const [tabs, setTabs] = useState([
    { name: <FormattedMessage id="allTeams" />, internalName: 'allTags', active: true, isAllowedTo: 'LIST_TEAM_TAGS' },
    { name: <FormattedMessage id="pendingTags" />, internalName: 'pendingTags', active: false, isAllowedTo: 'LIST_TEAM_TAGS' },
    { name: <FormattedMessage id="approvedTags" />, internalName: 'approvedTags', active: false, isAllowedTo: 'LIST_TEAM_TAGS' },
    { name: <FormattedMessage id="rejectedTags" />, internalName: 'rejectedTags', active: false, isAllowedTo: 'LIST_TEAM_TAGS' }
  ])
  const [selectedTab, setSelectedTab] = useState('allTags')
  const [columns, setColumns] = useState(getActionColumns(selectedTab))

  const [isFilterOpen, setIsFilterOpen] = useState(false)
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
  const [getTeamTags, { loading }] = useLazyQuery(GET_TEAM_TAGS, {
    onCompleted: (data) => {
      if (data && data?.listTeamTags?.aResults) {
        setSelectedTag(
          data.listTeamTags.aResults.map((item) => {
            return {
              _id: item._id,
              value: false
            }
          })
        )
        setTagList(data.listTeamTags.aResults)
        setTotalRecord(data.listTeamTags.nTotal)
      }
    }
  })
  const [getTagList, { loading: tagLoading }] = useLazyQuery(GET_TAG_LIST, {
    onCompleted: (data) => {
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
  })
  const [bulkAction, { loading: bulkLoading }] = useMutation(BULK_OPERATION_PLAYERS, {
    onCompleted: (data) => {
      if (data && data.bulkUpdateOtherTag) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkUpdateOtherTag.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })
  const [bulkStatusChange, { loading: bulkStatusLoading }] = useMutation(BULK_STATUS_UPDATE, {
    onCompleted: (data) => {
      if (data && data.bulkEnableStatus) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkEnableStatus.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })
  const [statusAction, { loading: statusLoading }] = useMutation(STATUS_TAG, {
    onCompleted: (data) => {
      if (data && data.updateTagStatus) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.updateTagStatus.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
      }
    }
  })
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
  const { countLoading } = useQuery(GET_COUNTS, {
    variables: { input: { eType: 't' } },
    onCompleted: (data) => {
      if (data && data?.getCount) {
        setTabs(
          tabs.map((e) => {
            if (e.internalName === 'allTags') {
              return { ...e, count: data?.getCount?.nAll > 0 ? data?.getCount?.nAll : '0' }
            }
            if (e.internalName === 'approvedTags') {
              return { ...e, count: data?.getCount?.nAp > 0 ? data.getCount?.nAp : '0' }
            }
            if (e.internalName === 'pendingTags') {
              return { ...e, count: data?.getCount?.nP > 0 ? data.getCount?.nP : '0' }
            }
            if (e.internalName === 'rejectedTags') {
              return { ...e, count: data?.getCount?.nR > 0 ? data.getCount?.nR : '0' }
            } else {
              return { ...e }
            }
          })
        )
      }
    }
  })

  useEffect(() => {
    params.current?.tabName && changeTab(getActiveTabName())
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
  useEffect(() => {
    if (tabNameParam) {
      if (tabNameParam === 'approvedTags') {
        getTagList({
          variables: {
            input: {
              aStatusFiltersInput: requestParams.aStatusFiltersInput,
              getTagsPaginationInput: {
                aType: ['t'],
                nLimit: requestParams.nLimit,
                nOrder: requestParams.nOrder,
                sSearch: requestParams.sSearch,
                sSortBy: requestParams.sSortBy,
                nSkip: requestParams.nSkip
              }
            }
          }
        })
      } else {
        getTeamTags({
          variables: {
            input: {
              aCountryFilter: requestParams.aCountryFilter,
              aStatus: requestParams.aStatus,
              eType: requestParams.eType,
              nLimit: requestParams.nLimit,
              nOrder: requestParams.nOrder,
              nSkip: requestParams.nSkip,
              sSearch: requestParams.sSearch,
              sSortBy: requestParams.sSortBy
            }
          }
        })
      }
    } else {
      if (selectedTab && selectedTab === 'approvedTags') {
        getTagList({
          variables: {
            input: {
              aStatusFiltersInput: requestParams.aStatusFiltersInput,
              getTagsPaginationInput: {
                aType: ['t'],
                nLimit: requestParams.nLimit,
                nOrder: requestParams.nOrder,
                sSearch: requestParams.sSearch,
                sSortBy: requestParams.sSortBy,
                nSkip: requestParams.nSkip
              }
            }
          }
        })
      } else {
        getTeamTags({
          variables: {
            input: {
              aCountryFilter: requestParams.aCountryFilter,
              aStatus: requestParams.aStatus,
              eType: requestParams.eType,
              nLimit: requestParams.nLimit,
              nOrder: requestParams.nOrder,
              nSkip: requestParams.nSkip,
              sSearch: requestParams.sSearch,
              sSortBy: requestParams.sSortBy
            }
          }
        })
      }
    }
  }, [selectedTab, requestParams])

  function getActionColumns(name) {
    const data = params.current
    if (name === 'approvedTags') {
      const clm = [
        { name: <FormattedMessage id="name" />, internalName: 'sName', type: 0 },
        { name: <FormattedMessage id="slug" />, internalName: 'sSlug', type: 0 },
        { name: <FormattedMessage id="count" />, internalName: 'nCount', type: 0 },
        { name: <FormattedMessage id="createBy" />, internalName: 'sSubmittedBy', type: 0 }
      ]
      return clm.map((e) => {
        if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
        return e
      })
    } else {
      const clm = [
        { name: <FormattedMessage id="name" />, internalName: 'sTitle', type: 0 },
        { name: <FormattedMessage id="slug" />, internalName: 'sSlug', type: 0 },
        { name: <FormattedMessage id="country" />, internalName: 'sCountryFull', type: 0 }
      ]
      return clm.map((e) => {
        if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
        return e
      })
    }
  }
  function changeCount(action, digit, tabName) {
    setTabs(
      tabs.map((e) => {
        if (action === 'approved') {
          if (e.internalName === 'approvedTags') {
            return { ...e, count: e.count + digit }
          }
          if (e.internalName === tabName) {
            return { ...e, count: e.count - digit }
          }
        }
        if (action === 'decline') {
          if (e.internalName === 'rejectedTags') {
            return { ...e, count: e.count + digit }
          }
          if (e.internalName === tabName) {
            return { ...e, count: e.count - digit }
          }
        }
        return e
      })
    )
  }
  function handleTabChange(name) {
    if (name === 'allTags') {
      setRequestParams({ ...requestParams, aStatus: ['a', 'p', 'r'], nSkip: 1, eType: 'g', nLimit: 10, sSortBy: 'dCreated' })
      appendParams({ aStatus: ['a', 'p', 'r'], nSkip: 1, eType: 'g', tabName: name, nLimit: 10 })
    } else if (name === 'pendingTags') {
      setRequestParams({ ...requestParams, aStatus: ['p'], nSkip: 1, eType: 't', nLimit: 10, sSortBy: 'dCreated' })
      appendParams({ aStatus: ['p'], nSkip: 1, eType: 't', tabName: name, nLimit: 10, sSortBy: 'dCreated' })
    } else if (name === 'approvedTags') {
      setRequestParams({ ...requestParams, aStatus: ['a'], nSkip: 1, eType: 't', nLimit: 10, sSortBy: 'dCreated' })
      appendParams({ aStatus: ['a'], nSkip: 1, eType: 't', tabName: name, nLimit: 10, sSortBy: 'dCreated' })
    } else if (name === 'rejectedTags') {
      setRequestParams({ ...requestParams, aStatus: ['r'], nSkip: 1, eType: 't', nLimit: 10, sSortBy: 'dCreated' })
      appendParams({ aStatus: ['r'], nSkip: 1, eType: 't', tabName: name, nLimit: 10, sSortBy: 'dCreated' })
    }
    changeTab(name)
  }
  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      aStatus: data.aStatus || ['a', 'p', 'r'],
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || '',
      aCountryFilter: data?.aCountryFilterValue,
      eType: data?.eType || 'g',
      aStatusFiltersInput: ['a', 'i']
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
    if (name === 'pendingTags') {
      actionPermission.current = ['UPDATE_TEAM_TAG_STATUS']
      return [
        { label: <FormattedMessage id="approveAll" />, value: 'a', isAllowedTo: 'UPDATE_TEAM_TAG_STATUS' },
        { label: <FormattedMessage id="rejectAll" />, value: 'r', isAllowedTo: 'UPDATE_TEAM_TAG_STATUS' }
      ]
    } else if (name === 'allTags') {
      actionPermission.current = ['UPDATE_TEAM_TAG_STATUS']
      return [
        { label: <FormattedMessage id="activeAll" />, value: 'enableTeam', isAllowedTo: 'UPDATE_TEAM_TAG_STATUS' },
        { label: <FormattedMessage id="deactivateAll" />, value: 'disableTeam', isAllowedTo: 'UPDATE_TEAM_TAG_STATUS' }
      ]
    } else if (name === 'approvedTags') {
      actionPermission.current = ['UPDATE_TEAM_TAG_STATUS']
      return [{ label: <FormattedMessage id="rejectAll" />, value: 'r', isAllowedTo: 'UPDATE_TEAM_TAG_STATUS' }]
    } else if (name === 'rejectedTags') {
      actionPermission.current = ['UPDATE_TEAM_TAG_STATUS']
      return [{ label: <FormattedMessage id="approveAll" />, value: 'a', isAllowedTo: 'UPDATE_TEAM_TAG_STATUS' }]
    }
  }

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    if (data?.tabName) return data.tabName.toString()
    else return 'allTags'
  }
  function handleBulkResponse(aIds, eType) {
    if (selectedTab === 'allTags') {
      if (eType === 'enableTeam') {
        setTagList(
          tagList.map((item) => {
            if (aIds.includes(item._id)) return { ...item, bTagEnabled: false }
            return item
          })
        )
      } else if (eType === 'disableTeam') {
        setTagList(
          tagList.map((item) => {
            if (aIds.includes(item._id)) return { ...item, bTagEnabled: true }
            return item
          })
        )
      }
    } else if (['a', 'i'].includes(eType)) {
      setTagList(
        tagList.map((item) => {
          if (aIds.includes(item._id)) return { ...item, eStatus: eType }
          return item
        })
      )
    } else if (eType === 'd') {
      setTagList(tagList.filter((item) => !aIds.includes(item._id)))
    } else {
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

  async function handleHeaderEvent(name, value) {
    switch (name) {
      case 'bulkAction':
        {
          const tag = selectedTag.map((a) => ({ ...a }))
          const obj = {
            aId: tag.filter((item) => item.value && delete item.value),
            eStatus: value
          }
          if (selectedTab === 'allTags') {
            const { data } = await bulkStatusChange({
              variables: {
                input: {
                  aId: obj.aId.map((id) => {
                    return id._id
                  }),
                  eType: 't',
                  bStatus: value === 'enableTeam'
                }
              }
            })
            if (data) {
              handleBulkResponse(
                tag.filter((item) => item.value === undefined && item).map((e) => e._id),
                value === 'enableTeam' ? 'disableTeam' : 'enableTeam'
              )
            }
          } else {
            const { data } = await bulkAction({
              variables: {
                input: {
                  aId: obj.aId.map((id) => {
                    return id._id
                  }),
                  eStatus: obj.eStatus,
                  eType: 't'
                }
              }
            })
            if (data) {
              handleBulkResponse(
                tag.filter((item) => item.value === undefined && item).map((e) => e._id),
                value
              )
            }
          }
        }
        break
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
  function handleFilterChange(e) {
    if (e?.data?.aCountryFilters?.sISO) {
      setRequestParams({ ...requestParams, nSkip: 1, aCountryFilter: e.data.aCountryFilters.sISO })
      appendParams({
        aCountryFilterLabel: e.data.aCountryFilters.sTitle,
        aCountryFilterValue: e.data.aCountryFilters.sISO,
        nSkip: 1
      })
    } else {
      setRequestParams({ ...requestParams, nSkip: 1, aCountryFilter: [] })
      appendParams({
        aCountryFilterLabel: '',
        aCountryFilterValue: '',
        nSkip: 1
      })
    }
    setIsFilterOpen(!isFilterOpen)
  }

  async function onIsApprove(target, type) {
    if (type === 'approved') {
      const { data: approveData } = await bulkAction({ variables: { input: { aId: [target], eStatus: 'a', eType: 't' } } })
      if (approveData && approveData.bulkUpdateOtherTag) handleBulkResponse([target], 'approved')
      changeCount('approved', [target].length, selectedTab)
    } else {
      const { data } = await bulkAction({ variables: { input: { aId: [target], eStatus: 'r', eType: 't' } } })
      if (data && data.bulkUpdateOtherTag) handleBulkResponse([target], 'dec')
      changeCount('decline', [target].length, selectedTab)
    }
  }

  function handleSort(field) {
    if (field.internalName !== 'sSlug') {
      setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      const data = setSortType(columns, requestParams.sSortBy)
      setColumns(data)
    }
  }
  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }
  async function handleStatusChange({ target }) {
    const { data } = await bulkStatusChange({ variables: { input: { aId: [target.name], eType: 't', bStatus: target.checked } } })
    if (data && data.bulkEnableStatus) handleBulkResponse([target.name], target.checked ? 'enableTeam' : 'disableTeam')
  }
  async function handleApprovedTagStatusChange({ target }) {
    const { data } = await statusAction({ variables: { input: { _id: target.name, eStatus: target.checked ? 'a' : 'i' } } })
    if (data?.updateTagStatus) handleBulkResponse([target.name], target.checked ? 'i' : 'a')
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
            const { data } = await delAction({ variables: { input: { _id: id, eType: 'a' } } })
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
  return (
    <>
      <DataTable
        className="team-list"
        columns={columns}
        bulkAction={bulkActionDropDown}
        sortEvent={handleSort}
        totalRecord={totalRecord}
        isLoading={loading || bulkLoading || bulkStatusLoading || countLoading || tagLoading || statusLoading || delLoading}
        header={{
          left: {
            bulkAction: selectedTab !== 'approvedTags' && !!userPermission.filter((p) => bulkActionPermission.current.includes(p)).length,
            rows: true
          },
          right: {
            search: true,
            filter: selectedTab !== 'approvedTags' && true
          }
        }}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        pageChangeEvent={handlePageEvent}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        selectAllValue={selectedTag}
        selectAllEvent={handleCheckbox}
        tabs={tabs}
        tabEvent={handleTabChange}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.current.includes(p)).length}
        actionColumn={!!userPermission.filter((p) => actionPermission.current.includes(p)).length}
      >
        {tagList.map((tag, index) => {
          if (selectedTab === 'approvedTags') {
            return (
              <PlayerTeamApprovedTagItemRow
                key={tag._id}
                index={index}
                tag={tag}
                selectedTab={selectedTab}
                selectedTag={selectedTag}
                onSelect={handleCheckbox}
                onIsApprove={onIsApprove}
                bulkPermission={bulkActionPermission.current}
                actionPermission={actionPermission.current}
                onStatusChange={handleApprovedTagStatusChange}
                onDelete={handleDelete}
              />
            )
          } else {
            return (
              <TeamTagItemRow
                key={tag._id}
                index={index}
                tag={tag}
                selectedTag={selectedTag}
                selectedTab={selectedTab}
                onSelect={handleCheckbox}
                onIsApprove={onIsApprove}
                bulkPermission={bulkActionPermission.current}
                actionPermission={actionPermission.current}
                onStatusChange={handleStatusChange}
              />
            )
          }
        })}
      </DataTable>
      <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(!isFilterOpen)} title={useIntl().formatMessage({ id: 'filterTeam' })}>
        <PlayerTeamFilters filterChange={handleFilterChange} type={useIntl().formatMessage({ id: 'team' })} defaultValue={requestParams} />
      </Drawer>
    </>
  )
}
Teams.propTypes = {
  userPermission: PropTypes.array
}
export default Teams
