import React, { useState, useRef, useEffect, useContext } from 'react'
import { useHistory } from 'react-router'
import { useQuery, useMutation } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import TopBar from 'shared/components/top-bar'
import { parseParams, appendParams, setSortType } from 'shared/utils'
import FantasyTipsItemRow from 'shared/components/fantasy-tips-item-row'
import DataTable from 'shared/components/data-table'
import { FETCH_FANTASY_TIPS_MATCHES } from 'graph-ql/fantasy-tips/query'
import { FANTASY_TIPS_STATUS, DELETE_FANTASY_ARTICLE, CHANGE_FANTASY_ARTICLE_STATUS, FANTASY_TIPS_PRIORITY } from 'graph-ql/fantasy-tips/mutation'
import { ToastrContext } from 'shared/components/toastr'
import FantasyTipsInfo from 'shared/components/fantasy-tips-add-edit-components/fantasy-tips-info'
import { TOAST_TYPE } from 'shared/constants'
import CustomAlert from 'shared/components/alert'
import FantasyPlatFormAdd from 'shared/components/fantasy-tips-add-edit-components/fantasy-platform-add'
import { GET_COUNTS } from 'graph-ql/management/player'
import Drawer from 'shared/components/drawer'
import FantasyTipsFilters from 'shared/components/fantasy-tips-filters'
import FetchMatchesFromApi from 'shared/components/fetch-matches-from-api'

const FantasyTipsList = () => {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const { dispatch } = useContext(ToastrContext)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [fantasyTipsList, setFantasyTips] = useState([])
  const totalRecord = useRef(0)
  const [selectedTab, setSelectedTab] = useState('upcomingMatches')
  const [columns, setColumns] = useState(getActionColumns(selectedTab))
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [modalShow, setModalShow] = useState(false)
  const [tabs, setTabs] = useState([
    { name: `${useIntl().formatMessage({ id: 'upcomingMatches' })}`, internalName: 'upcomingMatches', active: true },
    { name: `${useIntl().formatMessage({ id: 'completedMatches' })}`, internalName: 'completedMatches', active: false },
    { name: `${useIntl().formatMessage({ id: 'trash' })}`, internalName: 'trash', active: false }
  ])
  const [addCopyData, setAddCopyData] = useState({})
  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }

  const { countLoading } = useQuery(GET_COUNTS, {
    variables: { input: { eType: 'fa' } },
    onCompleted: (data) => {
      if (data && data?.getCount) {
        setTabs(
          tabs.map((e) => {
            if (e.internalName === 'upcomingMatches') {
              return { ...e, count: data?.getCount?.nUM > 0 ? data?.getCount?.nUM : '0' }
            }
            if (e.internalName === 'completedMatches') {
              return { ...e, count: data?.getCount?.nCM > 0 ? data.getCount?.nCM : '0' }
            }
            if (e.internalName === 'trash') {
              return { ...e, count: data?.getCount?.nT > 0 ? data.getCount?.nT : '0' }
            } else {
              return { ...e }
            }
          })
        )
      }
    }
  })
  const { loading, refetch } = useQuery(FETCH_FANTASY_TIPS_MATCHES, {
    variables: {
      input: requestParams
    },
    onCompleted: (data) => {
      if (data && data?.listFantasyMatch) {
        totalRecord.current = data?.listFantasyMatch?.nTotal
        setFantasyTips(data?.listFantasyMatch?.aResults)
      }
    }
  })

  const [deleteArticle] = useMutation(DELETE_FANTASY_ARTICLE, {
    onCompleted: (data) => {
      if (data && data.deleteFantasyArticle) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.deleteFantasyArticle.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
      }
    }
  })

  const [changeStatus] = useMutation(CHANGE_FANTASY_ARTICLE_STATUS, {
    onCompleted: (data) => {
      if (data && data.updateFantasyArticleStatus) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.updateFantasyArticleStatus.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
      }
    }
  })

  const [priorityAction, { loading: priorityLoading }] = useMutation(FANTASY_TIPS_PRIORITY, {
    onCompleted: (data) => {
      if (data && data.updateMatchPriority) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.updateMatchPriority.sMessage, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
      }
    }
  })

  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'fetchMatchesFromApi':
        setModalShow(true)
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
    if (name === 'upcomingMatches' || name === 'completedMatches' || name === 'trash') {
      const clm = [
        { name: <FormattedMessage id="matchInfo" />, internalName: 'matchInfo', type: 0 },
        { name: <FormattedMessage id="details" />, internalName: 'details', type: 0 }
      ]
      return clm.map((e) => {
        if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
        return e
      })
    }
  }

  function handleTabChange(name) {
    if (name === 'upcomingMatches') {
      setRequestParams({ ...requestParams, aStatus: ['scheduled', 'live'], eType: 'm', nSkip: 1, nOrder: 1 })
      appendParams({ aStatus: ['scheduled', 'live'], eType: 'm', nSkip: 1, nOrder: 1 })
    } else if (name === 'completedMatches') {
      setRequestParams({ ...requestParams, aStatus: ['completed'], eType: 'm', nSkip: 1, nOrder: -1 })
      appendParams({ aStatus: ['completed'], eType: 'm', nSkip: 1, nOrder: -1 })
    } else if (name === 'trash') {
      setRequestParams({ ...requestParams, aStatus: ['scheduled', 'live', 'completed', 'cancelled'], eType: 't', nSkip: 1, nOrder: -1 })
      appendParams({ aStatus: ['scheduled', 'live', 'completed', 'cancelled'], eType: 't', nSkip: 1, nOrder: -1 })
    }
    changeTab(name)
  }

  function changeTab(name) {
    setSelectedTab(name)
    setTabs(
      tabs.map((e) => {
        return { ...e, active: e.internalName === name }
      })
    )
  }

  function handleHeaderEvent(name, value) {
    switch (name) {
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

  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    const DateFilter = data.aDate ? data.aDate.split('-') : []
    return {
      aFilter: data?.aFilter,
      aStatus: data.aStatus || ['scheduled', 'live'],
      nLimit: Number(data.nLimit) || 10,
      nOrder: Number(data.nOrder) || 1,
      nSkip: Number(data.nSkip) || 1,
      sSearch: data.sSearch || '',
      sSortBy: data.sSortBy || 'dStartDate',
      eType: data.eType || 'm',
      aDate: DateFilter.length ? [new Date(DateFilter[0]), new Date(DateFilter[1])] : []
    }
  }

  function handleSort(field) {
    if (field.internalName === 'matchInfo') {
      setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      const data = setSortType(columns, field.internalName)
      setColumns(data)
    }
  }

  async function handleStatusChange({ target }) {
    const { data } = await statusAction({ variables: { input: { iMatchId: target.name, bStatus: target.checked && true } } })
    if (data?.updateFantasyTipsStatus) {
      setFantasyTips(
        fantasyTipsList.map((e) => {
          if (e._id === target.name) {
            return { ...e, bFantasyTips: !e.bFantasyTips }
          } else {
            return e
          }
        })
      )
    }
  }

  const [statusAction, { loading: statusLoading }] = useMutation(FANTASY_TIPS_STATUS, {
    onCompleted: (data) => {
      if (data && data.updateFantasyTipsStatus) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.updateFantasyTipsStatus.sMessage, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
      }
    }
  })

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    if (data?.aStatus?.length) {
      if (data.aStatus.toString() === 'scheduled,live') {
        return 'upcomingMatches'
      } else if (data.aStatus.toString() === 'completed') {
        return 'completedMatches'
      } else if (data.aStatus.toString() === 'scheduled,live,completed,cancelled') {
        return 'trash'
      }
    }
  }

  function handleDelete(_id) {
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.confirmationMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            const data = await deleteArticle({ variables: { input: { _id } } })
            if (data?.data?.deleteFantasyArticle) {
              setFantasyTips(
                fantasyTipsList.map((a) => {
                  return {
                    ...a,
                    aFantasyTips: a.aFantasyTips.filter((p) => p._id !== _id)
                  }
                })
              )
            }
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }

  useEffect(() => {
    params.current?.aStatus?.length && changeTab(getActiveTabName())
  }, [])

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      setRequestParams(getRequestParams(e.search))
      changeTab(getActiveTabName(e.search))
    })
  }, [history])

  function handleFilterChange(e) {
    let startDate, endDate
    if (e.data.aDate) {
      const publishDate = e?.data?.aDate?.split('-')
      startDate = new Date(publishDate[0])
      endDate = new Date(publishDate[1])
    }
    setRequestParams({
      ...requestParams,
      aFilter: e.data.aFilter,
      aDate: e.data.aDate ? [startDate, endDate] : [],
      nSkip: 1
    })
    appendParams({
      aFilter: e.data.aFilter ? e.data.aFilter : [],
      aDate: e.data.aDate,
      nSkip: 1
    })
    setIsFilterOpen(!isFilterOpen)
  }

  async function changeStatusHandler(value) {
    const { data } = await changeStatus({ variables: { input: value } })
    if (data?.updateFantasyArticleStatus) {
      setFantasyTips(
        fantasyTipsList.map((e) => {
          return {
            ...e,
            aFantasyTips: e.aFantasyTips.map((p) => {
              if (p._id === value._id) {
                return { ...p, eState: value.eState }
              } else {
                return p
              }
            })
          }
        })
      )
    }
  }
  async function handlePriorityChange(_id, eFetchPriority) {
    const { data } = await priorityAction({ variables: { input: { _id, eFetchPriority } } })

    if (data?.updateMatchPriority) {
      setFantasyTips(
        fantasyTipsList.map((e) => {
          if (e._id === _id) {
            return { ...e, eFetchPriority }
          } else {
            return e
          }
        })
      )
    }
  }

  return (
    <>
      {modalShow && <FetchMatchesFromApi setModalShow={setModalShow} refetch={refetch} />}
      <TopBar
        buttons={[
          {
            text: useIntl().formatMessage({ id: 'fetchMatchesFromApi' }),
            icon: 'icon-refresh',
            type: 'primary',
            clickEventName: 'fetchMatchesFromApi',
            isAllowedTo: 'CREATE_ARTICLE'
          },
          {
            text: useIntl().formatMessage({ id: 'download' }),
            icon: 'icon-download',
            type: 'outline-secondary',
            clickEventName: 'download',
            isAllowedTo: 'CREATE_ARTICLE'
          }
        ]}
        btnEvent={handleBtnEvent}
      />
      <DataTable
        className="fantasy-tips-list"
        columns={columns}
        sortEvent={handleSort}
        totalRecord={totalRecord.current}
        isLoading={loading || statusLoading || priorityLoading || countLoading}
        header={{
          left: {
            rows: true
          },
          right: {
            search: true,
            filter: true,
            component: true
          }
        }}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        pageChangeEvent={handlePageEvent}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        tabs={tabs}
        tabEvent={handleTabChange}
        component={<FantasyTipsInfo />}
      >
        {fantasyTipsList?.map((fantasy, index) => {
          return (
            <FantasyTipsItemRow
              key={fantasy._id}
              fantasy={fantasy}
              index={index}
              selectedTab={selectedTab}
              onPriorityChange={handlePriorityChange}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              handleAddCopy={setAddCopyData}
              handleChangeStatus={changeStatusHandler}
            />
          )
        })}
      </DataTable>
      <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(!isFilterOpen)} title={useIntl().formatMessage({ id: 'filter' })}>
        <FantasyTipsFilters filterChange={handleFilterChange} defaultValue={requestParams} />
      </Drawer>
      <FantasyPlatFormAdd data={addCopyData} />
    </>
  )
}

export default FantasyTipsList
