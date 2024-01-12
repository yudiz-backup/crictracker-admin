import React, { useContext, useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router'
import { useQuery, useMutation, useLazyQuery, useApolloClient } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import TagMigrationAssignedTagsItemRow from 'shared/components/tag-migration-item-row/assignedTag'
import TagMigrationTeamItemRow from 'shared/components/tag-migration-item-row/TeamTag'
import TagMigrationPlayerItemRow from 'shared/components/tag-migration-item-row/PlayerTag'
import TagMigrationVenueItemRow from 'shared/components/tag-migration-item-row/VenueTag'
import TagMigrationSimpleItemRow from 'shared/components/tag-migration-item-row/SimpleTag'
import TagMigrationFilters from 'shared/components/tag-migration-filters'
import DataTable from 'shared/components/data-table'
import CustomAlert from 'shared/components/alert'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { setSortType, parseParams, appendParams, debounce } from 'shared/utils'
import { LIST_MIGRATION_TAGS_DOCS, GET_MIGRATION_TAGS, GET_MIGRATION_TAGS_COUNT } from 'graph-ql/settings/tag-migration-management/query'
import {
  BULK_OPERATION,
  UPDATE_MIGRATION_TAG,
  UPDATE_MIGRATION_TAG_TYPE,
  MERGE_TAG,
  CLEAR_SUGGESTED_PLAYER
} from 'graph-ql/settings/tag-migration-management/mutation'
import Drawer from 'shared/components/drawer'
function TagMigrationManagement({ userPermission }) {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const { dispatch } = useContext(ToastrContext)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [tagList, setTagList] = useState([])
  const [selectedTag, setSelectedTag] = useState([])
  const totalRecord = useRef(0)
  const totalRecordDocs = useRef(0)
  const [docsData, setDocsData] = useState()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const loadingTag = useRef()
  const [selectedDoc, setSelectedDoc] = useState()
  const client = useApolloClient()
  const [tabs, setTabs] = useState([
    { name: <FormattedMessage id="pendingSimpleTags" />, internalName: 'simple', active: true, isAllowedTo: 'LIST_CATEGORY' },
    { name: <FormattedMessage id="pendingPlayerTags" />, internalName: 'player', active: false, isAllowedTo: 'LIST_CATEGORY' },
    { name: <FormattedMessage id="pendingTeamTags" />, internalName: 'team', active: false, isAllowedTo: 'LIST_CATEGORY' },
    { name: <FormattedMessage id="pendingVenueTags" />, internalName: 'venue', active: false, isAllowedTo: 'LIST_CATEGORY' },
    { name: <FormattedMessage id="assignedTags" />, internalName: 'assignedTags', active: false, isAllowedTo: 'LIST_CATEGORY' }
  ])
  const selectedTab = useRef('simple')
  const columns = useRef(getActionColumns(selectedTab.current))
  const bulkActionDropDown = [{ label: 'Delete All', value: 'd', isAllowedTo: 'LIST_CATEGORY' }]
  const bulkActionPermission = bulkActionDropDown.map((e) => e.isAllowedTo)
  const isBottomReached = useRef(false)
  const [requestParamsDocs, setRequestParamsDocs] = useState({ nSkip: 1, nLimit: 10 })
  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' }),
    confirmationMergeMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToMergeThisTag' }),
    confirmationRemoveMessage: useIntl().formatMessage({ id: 'removeDefaultData' })
  }
  const { loading: countLoading } = useQuery(GET_MIGRATION_TAGS_COUNT, {
    variables: { input: { eType: 'm' } },
    onCompleted: (data) => {
      if (data && data?.getMigrationCounts) {
        setTabs(
          tabs.map((e) => {
            if (e.internalName === 'simple') {
              return { ...e, count: data?.getMigrationCounts?.nS > 0 ? data?.getMigrationCounts?.nS : '0' }
            }
            if (e.internalName === 'player') {
              return { ...e, count: data?.getMigrationCounts?.nP > 0 ? data.getMigrationCounts?.nP : '0' }
            }
            if (e.internalName === 'team') {
              return { ...e, count: data?.getMigrationCounts?.nT > 0 ? data.getMigrationCounts?.nT : '0' }
            }
            if (e.internalName === 'venue') {
              return { ...e, count: data?.getMigrationCounts?.nV > 0 ? data.getMigrationCounts?.nV : '0' }
            }
            if (e.internalName === 'assignedTags') {
              return { ...e, count: data?.getMigrationCounts?.nA > 0 ? data.getMigrationCounts?.nA : '0' }
            } else {
              return { ...e }
            }
          })
        )
      }
    }
  })
  const { loading, refetch } = useQuery(GET_MIGRATION_TAGS, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      if (data && data?.getMigrationTags.aResults) {
        totalRecord.current = data.getMigrationTags.nTotal
        setSelectedTag(
          data.getMigrationTags.aResults.map((item) => {
            return {
              _id: item._id,
              value: false
            }
          })
        )
        setTagList(data.getMigrationTags.aResults)
      }
    }
  })

  const [getTagDocs, { loading: loadingDocs }] = useLazyQuery(LIST_MIGRATION_TAGS_DOCS, {
    onCompleted: (data) => {
      if (data && data?.getMigrationTagDocs) {
        totalRecordDocs.current = data.getMigrationTagDocs.nCount

        if (data.getMigrationTagDocs.oPlayerTag) {
          if (isBottomReached.current) {
            setDocsData([...docsData, ...data.getMigrationTagDocs.oPlayerTag])
          } else {
            setDocsData(data.getMigrationTagDocs.oPlayerTag)
          }
        }
        if (data.getMigrationTagDocs.oSimpleTag) {
          if (isBottomReached.current) {
            setDocsData([...docsData, ...data.getMigrationTagDocs.oSimpleTag])
          } else {
            setDocsData(data.getMigrationTagDocs.oSimpleTag)
          }
        }
        if (data.getMigrationTagDocs.oTeamTag) {
          if (isBottomReached.current) {
            setDocsData([...docsData, ...data.getMigrationTagDocs.oTeamTag])
          } else {
            setDocsData(data.getMigrationTagDocs.oTeamTag)
          }
        }
        if (data.getMigrationTagDocs.oVenueTag) {
          if (isBottomReached.current) {
            setDocsData([...docsData, ...data.getMigrationTagDocs.oVenueTag])
          } else {
            setDocsData(data.getMigrationTagDocs.oVenueTag)
          }
        }
        isBottomReached.current = false
      }
    }
  })
  const [updateTagType] = useMutation(UPDATE_MIGRATION_TAG_TYPE, {
    onCompleted: (data) => {
      if (data && data.updateMigrationTagType) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.updateMigrationTagType.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  const [tagMerge, { loading: tagMergeLoading }] = useMutation(MERGE_TAG, {
    onCompleted: (data) => {
      if (data && data.mergeTag) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.mergeTag.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })
  const [updateTagDoc] = useMutation(UPDATE_MIGRATION_TAG, {
    onCompleted: (data) => {
      if (data && data.updateMigrationTag) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.updateMigrationTag.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  const [bulkAction, { loading: bulkLoading }] = useMutation(BULK_OPERATION, {
    onCompleted: (data) => {
      if (data && data.bulkMigrationTagUpdate) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkMigrationTagUpdate.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
        refetch()
      }
    }
  })

  const [removeList, { loading: removeLoading }] = useMutation(CLEAR_SUGGESTED_PLAYER, {
    onCompleted: (data) => {
      if (data && data.clearList) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.clearList.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  useEffect(() => {
    if (params.current?.eType || params.current?.bIsAssigned?.toString() === 'true') {
      changeTab(getActiveTabName())
    }
  }, [])

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      setRequestParams(getRequestParams(e.search))
      changeTab(getActiveTabName(e.search))
    })
  }, [history])

  useEffect(() => {
    if (selectedDoc && requestParamsDocs) {
      getTagDocs({ variables: { input: { _id: selectedDoc, ...requestParamsDocs } } })
    }
  }, [selectedDoc, requestParamsDocs])

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    const getTagType = data.bIsAssigned && data.bIsAssigned.toString() === 'true' && !data.eType ? null : data.eType || 'simple'
    return {
      eType: getTagType,
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || '',
      bIsAssigned: data?.bIsAssigned === 'true' && true
    }
  }

  function getActionColumns(name) {
    const data = params.current
    if (name === 'simple') {
      const clm = [
        { name: <FormattedMessage id="oldTag" />, internalName: 'sName', type: 0 },
        { name: <FormattedMessage id="changeTagType" />, internalName: 'changeTagType', type: 0 }
      ]
      return clm.map((e) => {
        if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
        return e
      })
    } else if (name === 'player') {
      const clm = [
        { name: <FormattedMessage id="oldTag" />, internalName: 'sName', type: 0 },
        { name: <FormattedMessage id="choosePlayer" />, internalName: 'chooseTag', type: 0 },
        { name: <FormattedMessage id="changeTagType" />, internalName: 'changeTagType', type: 0 }
      ]
      return clm.map((e) => {
        if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
        return e
      })
    } else if (name === 'team') {
      const clm = [
        { name: <FormattedMessage id="oldTag" />, internalName: 'sName', type: 0 },
        { name: <FormattedMessage id="chooseTeam" />, internalName: 'chooseTag', type: 0 },
        { name: <FormattedMessage id="changeTagType" />, internalName: 'changeTagType', type: 0 }
      ]
      return clm.map((e) => {
        if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
        return e
      })
    } else if (name === 'venue') {
      const clm = [
        { name: <FormattedMessage id="oldTag" />, internalName: 'sName', type: 0 },
        { name: <FormattedMessage id="chooseVenue" />, internalName: 'chooseTag', type: 0 },
        { name: <FormattedMessage id="changeTagType" />, internalName: 'changeTagType', type: 0 }
      ]
      return clm.map((e) => {
        if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
        return e
      })
    } else if (name === 'assignedTags') {
      const clm = [
        { name: <FormattedMessage id="oldTag" />, internalName: 'sName', type: 0 },
        { name: <FormattedMessage id="tagType" />, internalName: 'eType', type: 0 },
        { name: <FormattedMessage id="assignTag" />, internalName: 'sAssignedName', type: 0 }
      ]
      return clm.map((e) => {
        if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
        return e
      })
    }
  }

  function handleTabChange(name) {
    if (name === 'simple' || name === 'player' || name === 'team' || name === 'venue') {
      setRequestParams({ ...requestParams, eType: name, nSkip: 1, bIsAssigned: false })
      appendParams({ eType: name, nSkip: 1, bIsAssigned: false })
    } else if (name === 'assignedTags') {
      setRequestParams({ ...requestParams, bIsAssigned: true, nSkip: 1, eType: null })
      appendParams({ bIsAssigned: true, nSkip: 1, eType: '' })
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
      setTagList(tagList.filter((item) => !aIds.includes(item._id)))
      changeCount('delete', aIds.length, selectedTab.current)
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
            const { data } = await bulkAction({ variables: { input: { aId: [id] } } })
            if (data && data.bulkMigrationTagUpdate) handleBulkResponse([id], 'd')
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
        const tag = selectedTag.map((a) => ({ ...a }))
        const obj = {
          bulkIds: tag.filter((item) => item.value && delete item.value),
          eStatus: value
        }
        if (obj.eStatus === 'd') {
          const { data } = await bulkAction({
            variables: {
              input: {
                aId: obj.bulkIds.map((id) => {
                  return id._id
                })
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

  function handleSort(field) {
    if (field.internalName !== 'chooseTag' && field.internalName !== 'changeTagType' && field.internalName !== 'eType') {
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

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    if (data?.bIsAssigned?.toString() === 'true') {
      return 'assignedTags'
    } else if (data?.eType) {
      return data?.eType?.toString()
    } else {
      return 'simple'
    }
  }

  function handleChooseTag(e) {
    setSelectedDoc(e)
    loadingTag.current = e
  }

  async function onChangeTagDoc(e, id) {
    const { data } = await updateTagDoc({ variables: { input: { _id: id, iId: e._id } } })
    if (data && data.updateMigrationTag) {
      setTagList(tagList.filter((item) => item._id !== id))
      changeCount('changeType', 1, selectedTab.current)
    }
  }
  async function onChangeTagType(e, termId, tagId) {
    const { data } = await updateTagType({ variables: { input: { eType: e.value, iTermId: termId } } })
    if (data && data.updateMigrationTagType) {
      setTagList(tagList.filter((item) => item._id !== tagId))
      changeCount('changeType', 1, selectedTab.current, e.value)
    }
  }
  function changeCount(action, digit, tabName, changedTagType) {
    setTabs(
      tabs.map((e) => {
        if (!changedTagType && action !== 'delete') {
          if (e.internalName === tabName && tabName !== 'assignedTags') {
            return { ...e, count: e.count - digit }
          }
          if (tabName === 'assignedTags' && e.internalName !== tabName) {
            return { ...e, count: e.count + digit }
          }
        }
        if (changedTagType && action !== 'delete') {
          if (e.internalName === changedTagType && e.internalName !== tabName) {
            return { ...e, count: e.count + digit }
          }
          if (e.internalName === tabName) {
            return { ...e, count: e.count - digit }
          }
        }
        if (action === 'delete') {
          if (e.internalName === tabName) {
            return { ...e, count: e.count - digit }
          }
        }
        return e
      })
    )
  }
  function handleFilterChange(e) {
    if (e) {
      setRequestParams({ ...requestParams, nSkip: 1, eType: e })
      appendParams({ eType: e, nSkip: 1 })
    } else {
      setRequestParams({ ...requestParams, nSkip: 1, eType: null })
      appendParams({ eType: '', nSkip: 1 })
    }
    setIsFilterOpen(!isFilterOpen)
  }
  function handleScroll() {
    if (totalRecordDocs.current > requestParamsDocs.nSkip * 10) {
      setRequestParamsDocs({ ...requestParamsDocs, nSkip: requestParamsDocs.nSkip + 1 })
      isBottomReached.current = true
    }
  }
  const optimizedSearch = debounce((txt, { action, prevInputValue }) => {
    if (action === 'input-change') {
      if (txt) setRequestParamsDocs({ ...requestParamsDocs, sSearch: txt, nSkip: 1 })
    }
    if (action === 'set-value') {
      prevInputValue && setRequestParamsDocs({ ...requestParamsDocs, sSearch: '', nSkip: 1 })
    }
    if (action === 'menu-close') {
      prevInputValue && setRequestParamsDocs({ ...requestParamsDocs, sSearch: '', nSkip: 1 })
    }
  })
  function onMenuClose() {
    setRequestParamsDocs({ nSkip: 1, nLimit: 10, sSearch: '' })
  }
  async function onTagMerge(e) {
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.confirmationMergeMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            const { data } = await tagMerge({ variables: { input: { _id: e } } })
            if (data && data.mergeTag) {
              setTagList(tagList.filter((item) => item?._id !== e))
              changeCount('delete', 1, selectedTab.current)
            }
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }
  function handleClear(id) {
    const normalizedId = client.cache.identify({ _id: id, __typename: 'getMigrationTagDocs' })
    console.log(normalizedId)
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.confirmationRemoveMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            removeList({ variables: { input: { _id: id } } })
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
        className="tag-migration-list"
        columns={columns.current}
        bulkAction={bulkActionDropDown}
        sortEvent={handleSort}
        totalRecord={totalRecord.current}
        isLoading={loading || bulkLoading || countLoading || tagMergeLoading || removeLoading}
        header={{
          left: {
            bulkAction: !!userPermission.filter((p) => bulkActionPermission.includes(p)).length,
            rows: true
          },
          right: {
            search: true,
            filter: selectedTab.current === 'assignedTags'
          }
        }}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        selectAllEvent={handleCheckbox}
        pageChangeEvent={handlePageEvent}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        selectAllValue={selectedTag}
        tabs={tabs}
        tabEvent={handleTabChange}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
        actionColumn
      >
        {tagList.map((tag, index) => {
          if (selectedTab.current === 'assignedTags') {
            return (
              <TagMigrationAssignedTagsItemRow
                key={tag._id}
                index={index}
                tag={tag}
                selectedTag={selectedTag}
                onDelete={handleDelete}
                onSelect={handleCheckbox}
                bulkPermission={bulkActionPermission}
                onChangeTagType={onChangeTagType}
                onTagMerge={onTagMerge}
              />
            )
          } else if (selectedTab.current === 'simple') {
            return (
              <TagMigrationSimpleItemRow
                key={tag._id}
                index={index}
                tag={tag}
                selectedTag={selectedTag}
                onDelete={handleDelete}
                onSelect={handleCheckbox}
                bulkPermission={bulkActionPermission}
                handleChooseTag={handleChooseTag}
                docsData={docsData}
                onChangeTagDoc={onChangeTagDoc}
                onChangeTagType={onChangeTagType}
                isLoading={loadingDocs && loadingTag.current === tag._id}
                onTagMerge={onTagMerge}
              />
            )
          } else if (selectedTab.current === 'player') {
            return (
              <TagMigrationPlayerItemRow
                key={tag._id}
                index={index}
                tag={tag}
                selectedTag={selectedTag}
                onDelete={handleDelete}
                onSelect={handleCheckbox}
                bulkPermission={bulkActionPermission}
                handleChooseTag={handleChooseTag}
                docsData={docsData}
                onChangeTagDoc={onChangeTagDoc}
                onChangeTagType={onChangeTagType}
                isLoading={loadingDocs && loadingTag.current === tag._id}
                handleScroll={handleScroll}
                optimizedSearch={optimizedSearch}
                onMenuClose={onMenuClose}
                onTagMerge={onTagMerge}
                onClear={handleClear}
              />
            )
          } else if (selectedTab.current === 'team') {
            return (
              <TagMigrationTeamItemRow
                key={tag._id}
                index={index}
                tag={tag}
                selectedTag={selectedTag}
                onDelete={handleDelete}
                onSelect={handleCheckbox}
                bulkPermission={bulkActionPermission}
                handleChooseTag={handleChooseTag}
                docsData={docsData}
                onChangeTagDoc={onChangeTagDoc}
                onChangeTagType={onChangeTagType}
                isLoading={loadingDocs && loadingTag.current === tag._id}
                handleScroll={handleScroll}
                optimizedSearch={optimizedSearch}
                onMenuClose={onMenuClose}
                onTagMerge={onTagMerge}
                onClear={handleClear}
              />
            )
          } else {
            return (
              <TagMigrationVenueItemRow
                key={tag._id}
                index={index}
                tag={tag}
                selectedTag={selectedTag}
                onDelete={handleDelete}
                onSelect={handleCheckbox}
                bulkPermission={bulkActionPermission}
                handleChooseTag={handleChooseTag}
                docsData={docsData}
                onChangeTagDoc={onChangeTagDoc}
                onChangeTagType={onChangeTagType}
                isLoading={loadingDocs && loadingTag.current === tag._id}
                handleScroll={handleScroll}
                optimizedSearch={optimizedSearch}
                onMenuClose={onMenuClose}
                onTagMerge={onTagMerge}
                onClear={handleClear}
              />
            )
          }
        })}
      </DataTable>
      <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(!isFilterOpen)} title={useIntl().formatMessage({ id: 'filterTag' })}>
        <TagMigrationFilters filterChange={handleFilterChange} defaultValue={requestParams} />
      </Drawer>
    </>
  )
}
TagMigrationManagement.propTypes = {
  userPermission: PropTypes.array
}
export default TagMigrationManagement
