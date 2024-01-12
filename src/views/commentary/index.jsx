import { useMutation, useQuery } from '@apollo/client'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'

import { FETCH_FANTASY_TIPS_MATCHES } from 'graph-ql/fantasy-tips/query'
import MatchListRow from 'shared/components/commentary/matchListRow'
import DataTable from 'shared/components/data-table'
import Drawer from 'shared/components/drawer'
import FantasyTipsFilters from 'shared/components/fantasy-tips-filters'
import FetchMatchesFromApi from 'shared/components/fetch-matches-from-api'
import TopBar from 'shared/components/top-bar'
import { appendParams, parseParams, setSortType } from 'shared/utils'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { CHANGE_COMMENTARY_STATUS } from 'graph-ql/commentary/mutation'

function Commentary() {
  const history = useHistory()
  const { dispatch } = useContext(ToastrContext)
  const params = useRef(parseParams(location.search))
  const totalRecord = useRef(0)
  const [matchList, setMatchList] = useState([])
  const [modalShow, setModalShow] = useState(false)
  const [selectedTab, setSelectedTab] = useState('liveMatches')
  const [columns, setColumns] = useState(getActionColumns(selectedTab))
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [tabs, setTabs] = useState([
    { name: `${useIntl().formatMessage({ id: 'liveMatches' })}`, internalName: 'liveMatches', active: true },
    { name: `${useIntl().formatMessage({ id: 'upcomingMatches' })}`, internalName: 'upcomingMatches', active: false },
    { name: `${useIntl().formatMessage({ id: 'completedMatches' })}`, internalName: 'completedMatches', active: false }
  ])

  const { loading, refetch } = useQuery(FETCH_FANTASY_TIPS_MATCHES, {
    variables: {
      input: requestParams
    },
    onCompleted: (data) => {
      if (data && data?.listFantasyMatch) {
        totalRecord.current = data?.listFantasyMatch?.nTotal
        setMatchList(data?.listFantasyMatch?.aResults)
      }
    }
  })

  const [updateCommentaryStatus] = useMutation(CHANGE_COMMENTARY_STATUS, {
    onCompleted: (data) => {
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: data?.updateMatchCommentaryStatus?.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
      })
    }
  })

  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'fetchMatchesFromApi':
        setModalShow(true)
        break
      default:
        break
    }
  }

  function getActionColumns(name) {
    const data = params.current
    if (name === 'upcomingMatches' || name === 'completedMatches' || name === 'liveMatches') {
      const clm = [
        { name: <FormattedMessage id="matchInfo" />, internalName: 'matchInfo', type: 0 },
        { name: <FormattedMessage id="commentary" />, internalName: 'details', type: 0 }
      ]
      return clm.map((e) => {
        if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
        return e
      })
    }
  }

  function handleTabChange(name) {
    if (name === 'liveMatches') {
      setRequestParams({ ...requestParams, aStatus: ['live'], eType: 'm', nSkip: 1, nOrder: 1 })
      appendParams({ aStatus: ['live'], eType: 'm', nSkip: 1, nOrder: 1 })
    } else if (name === 'completedMatches') {
      setRequestParams({ ...requestParams, aStatus: ['completed'], eType: 'm', nSkip: 1, nOrder: -1 })
      appendParams({ aStatus: ['completed'], eType: 'm', nSkip: 1, nOrder: -1 })
    } else if (name === 'upcomingMatches') {
      setRequestParams({ ...requestParams, aStatus: ['scheduled'], eType: 'm', nSkip: 1, nOrder: -1 })
      appendParams({ aStatus: ['scheduled'], eType: 'm', nSkip: 1, nOrder: -1 })
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

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    const DateFilter = data.aDate ? data.aDate.split('-') : []
    return {
      aFilter: data?.aFilter,
      aStatus: data.aStatus || ['live'],
      nLimit: Number(data.nLimit) || 10,
      nOrder: Number(data.nOrder) || 1,
      nSkip: Number(data.nSkip) || 1,
      sSearch: data.sSearch || '',
      sSortBy: data.sSortBy || 'dStartDate',
      eType: data.eType || 'm',
      aDate: DateFilter.length ? [new Date(DateFilter[0]), new Date(DateFilter[1])] : []
    }
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

  function handleSort(field) {
    if (field.internalName === 'matchInfo') {
      setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      const data = setSortType(columns, field.internalName)
      setColumns(data)
    }
  }

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    if (data?.aStatus?.length) {
      if (data.aStatus.toString() === 'scheduled') {
        return 'upcomingMatches'
      } else if (data.aStatus.toString() === 'completed') {
        return 'completedMatches'
      } else if (data.aStatus.toString() === 'live') {
        return 'liveMatches'
      }
    }
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

  function onStatusChange(id, flag) {
    updateCommentaryStatus({ variables: { input: { iMatchId: id, bIsCommentary: !flag } } })
    setMatchList(
      matchList.map((match) => {
        if (id === match._id) {
          return { ...match, bIsCommentary: !flag }
        } else {
          return match
        }
      })
    )
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
          }
        ]}
        btnEvent={handleBtnEvent}
      />
      <DataTable
        className="fantasy-tips-list"
        columns={columns}
        sortEvent={handleSort}
        totalRecord={totalRecord.current}
        isLoading={loading}
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
      >
        {matchList?.map((match, index) => {
          return <MatchListRow key={match._id} match={match} index={index} onStatusChange={onStatusChange} />
        })}
      </DataTable>
      <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(!isFilterOpen)} title={useIntl().formatMessage({ id: 'filter' })}>
        <FantasyTipsFilters filterChange={handleFilterChange} defaultValue={requestParams} />
      </Drawer>
    </>
  )
}

export default Commentary
