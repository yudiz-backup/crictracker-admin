import React, { useState, useEffect, useRef, useContext } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router'
import { useMutation, useQuery } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import TopBar from 'shared/components/top-bar'
import DataTable from 'shared/components/data-table'
import { allRoutes } from 'shared/constants/AllRoutes'
import { parseParams, appendParams } from 'shared/utils'
import PollItemRow from 'shared/components/poll-item-row'
import { DELETE_POLLS, GET_ALL_POLL } from 'graph-ql/widgets/poll/query'
import CustomAlert from 'shared/components/alert'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'

function GlobalPoll({ userPermission }) {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [pollList, setPollList] = useState([])
  const [selectedPoll, setSelectedPoll] = useState([])
  const totalRecord = useRef(0)
  const selectedTab = useRef('scheduled')
  const columns = useRef(getActionColumns())
  const { dispatch } = useContext(ToastrContext)

  const [tabs, setTabs] = useState([
    { name: <FormattedMessage id="scheduled" />, internalName: 'scheduled', active: true },
    { name: <FormattedMessage id="published" />, internalName: 'published', active: false },
    { name: <FormattedMessage id="expired" />, internalName: 'expired', active: false },
    { name: <FormattedMessage id="matchesPoll" />, internalName: 'matchesPoll', active: false }
  ])
  const bulkActionDropDown = [{ label: 'Delete All', value: 'd', isAllowedTo: 'DELETE_POLL' }]
  const bulkActionPermission = bulkActionDropDown.map((e) => e.isAllowedTo)
  const actionColumnPermission = ['EDIT_POLL', 'DELETE_POLL']

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteAllItem' })
  }

  const { loading, refetch } = useQuery(GET_ALL_POLL, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      handleApiResponse(data)
    }
  })

  function handleApiResponse(data) {
    if (data && data?.listPoll) {
      setSelectedPoll(
        data.listPoll.aPolls.map((item) => {
          return {
            _id: item._id,
            value: false
          }
        })
      )
      totalRecord.current = data?.listPoll?.nTotal
      setPollList(data?.listPoll?.aPolls)
    }
  }

  const [bulkDeleteAction] = useMutation(DELETE_POLLS, {
    onCompleted: (data) => {
      if (data && data.bulkDeletePoll) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkDeletePoll.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  useEffect(() => {
    params.current?.aStatus && changeTab(getActiveTabName())
  }, [])

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      setRequestParams(getRequestParams(e.search))
      changeTab(getActiveTabName(e.search))
    })
  }, [history])

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      aStatus: data?.aStatus || ['s'],
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSearch: data.sSearch || '',
      aPollType: data.aPollType || ['ad']
    }
  }

  function handleBtnEvent(eventName) {
    // if (eventName === 'newPoll') history.push(allRoutes.addPoll)
    if (eventName === 'newPoll') history.push(allRoutes.newpoll)
  }

  function getActionColumns() {
    const data = params.current
    const clm = [
      { name: <FormattedMessage id="pollId" />, internalName: 'sPollId', type: 0 },
      { name: <FormattedMessage id="title" />, internalName: 'sTitle', type: 0 },
      { name: <FormattedMessage id="totalVotes" />, internalName: 'nTotalVote', type: 0 }
    ]
    return clm.map((e) => {
      if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
      return e
    })
  }

  function handleTabChange(name) {
    if (name === 'scheduled') {
      setRequestParams({ ...requestParams, aStatus: ['s'], nSkip: 1, aPollType: ['ad'] })
      appendParams({ aStatus: ['s'], nSkip: 1, aPollType: ['ad'] })
    } else if (name === 'published') {
      setRequestParams({ ...requestParams, aStatus: ['pub'], nSkip: 1, aPollType: ['ad'] })
      appendParams({ aStatus: ['pub'], nSkip: 1, aPollType: ['ad'] })
    } else if (name === 'expired') {
      setRequestParams({ ...requestParams, aStatus: ['ex'], nSkip: 1, aPollType: ['ad'] })
      appendParams({ aStatus: ['ex'], nSkip: 1, aPollType: ['ad'] })
    } else if (name === 'matchesPoll') {
      setRequestParams({ ...requestParams, aStatus: ['pub', 's', 'ex'], nSkip: 1, aPollType: ['ma'] })
      appendParams({ aStatus: ['pub', 's', 'ex'], nSkip: 1, aPollType: ['ma'] })
    }
    changeTab(name)
  }

  function changeTab(name) {
    console.log({ name })
    selectedTab.current = name
    setTabs(
      tabs.map((e) => {
        return { ...e, active: e.internalName === name }
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
            const { data } = await bulkDeleteAction({ variables: { input: { aPollIds: [id] } } })
            if (data && data.bulkDeletePoll) handleBulkResponse([id], 'd')
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }

  function handleBulkResponse(aPollIds, eType) {
    if (eType === 'd') {
      if (requestParams?.nLimit / 2 >= pollList?.length || requestParams?.nLimit / 2 <= aPollIds?.length) {
        handleMultipleDelete()
      } else {
        setPollList(pollList?.filter((item) => !aPollIds.includes(item._id)))
      }
    }
    setSelectedPoll(
      selectedPoll.map((item) => {
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
        const poll = selectedPoll.map((a) => ({ ...a }))
        const obj = {
          aPollIds: poll.filter((item) => item.value && delete item.value),
          eStatus: value
        }
        if (obj.eStatus === 'd') {
          const { data } = await bulkDeleteAction({
            variables: {
              input: {
                aPollIds: obj.aPollIds.map((id) => {
                  return id._id
                })
              }
            }
          })
          if (data && data.bulkDeletePoll) {
            handleBulkResponse(
              poll.filter((item) => item.value === undefined && item).map((e) => e._id),
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

  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    if (data?.aStatus) {
      if (data.aStatus.toString() === 's') {
        return 'scheduled'
      } else if (data.aStatus.toString() === 'pub') {
        return 'published'
      } else if (data.aStatus.toString() === 'ex') {
        return 'expired'
      } else if (data.aStatus.toString() === 'pub,s,ex') {
        return 'matchesPoll'
      }
    } else {
      return 'scheduled'
    }
  }

  function handleCheckbox({ target }) {
    if (target.name === 'selectAll') {
      setSelectedPoll(
        selectedPoll.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else {
      if (target.checked) {
        setSelectedPoll(
          selectedPoll.map((item) => {
            if (item._id === target.name) item.value = true
            return item
          })
        )
      } else {
        setSelectedPoll(
          selectedPoll.map((item) => {
            if (item._id === target.name) item.value = false
            return item
          })
        )
      }
    }
  }

  async function handleMultipleDelete() {
    if (pollList?.length === 0) {
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
        buttons={[{ text: 'New Poll', icon: 'icon-add', type: 'primary', clickEventName: 'newPoll', isAllowedTo: 'CREATE_POLL' }]}
        btnEvent={handleBtnEvent}
      />
      <DataTable
        className="poll-list"
        columns={columns.current}
        bulkAction={bulkActionDropDown}
        totalRecord={totalRecord.current}
        isLoading={loading}
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
        selectAllValue={selectedPoll}
        tabs={tabs}
        tabEvent={handleTabChange}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
        actionColumn={!!userPermission.filter((p) => actionColumnPermission.includes(p)).length}
      >
        {pollList?.map((poll, index) => {
          return (
            <PollItemRow
              key={poll._id}
              index={index}
              poll={poll}
              selectedPoll={selectedPoll}
              onDelete={handleDelete}
              onSelect={handleCheckbox}
              bulkPermission={bulkActionPermission}
              selectedTab={selectedTab.current}
              actionPermission={actionColumnPermission}
            />
          )
        })}
      </DataTable>
    </>
  )
}
GlobalPoll.propTypes = {
  userPermission: PropTypes.array
}
export default GlobalPoll
