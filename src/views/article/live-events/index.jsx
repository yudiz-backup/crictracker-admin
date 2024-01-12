import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useMutation, useQuery } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'
import { useHistory } from 'react-router-dom'

import LiveEventsItemRow from 'shared/components/live-event/live-events-item-row'
import CustomAlert from 'shared/components/alert'
import DataTable from 'shared/components/data-table'
import TopBar from 'shared/components/top-bar'
import { appendParams, parseParams, setSortType } from 'shared/utils'
import { GET_LIVE_EVENTS } from 'graph-ql/live-events/query'
import { DELETE_LIVE_EVENT } from 'graph-ql/live-events/mutations'
import { allRoutes } from 'shared/constants/AllRoutes'

function LiveEvents({ userPermission }) {
  const params = useRef(parseParams(location.search))
  const history = useHistory()
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [eventsList, setEventsList] = useState([])
  const totalRecord = useRef(0)
  const [selectedEvents, setSelectedEvents] = useState([])
  const [columns, setColumns] = useState([
    { name: <FormattedMessage id="eventId" />, internalName: 'sEventId', type: 0 },
    { name: <FormattedMessage id="eventTitle" />, internalName: 'sEventName', type: 0 },
    { name: <FormattedMessage id="createdAt" />, internalName: 'dCreated', type: 0 }
  ])
  const bulkActionDropDown = [
    { label: 'Delete All', value: 'd', isAllowedTo: 'DELETE_LIVEEVENT' }
  ]
  const actionColumnPermission = ['DELETE_LIVEEVENT', 'MANAGE_LIVEEVENTCONTENT']
  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    deleteMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }

  const bulkActionPermission = bulkActionDropDown.map((e) => e.isAllowedTo)

  const { loading } = useQuery(GET_LIVE_EVENTS, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      if (data && data?.listLiveBlogEvents) {
        totalRecord.current = data.listLiveBlogEvents.nTotal
        setSelectedEvents(
          data.listLiveBlogEvents.aResults.map((item) => {
            return {
              _id: item?._id,
              value: false
            }
          })
        )
        setEventsList(data?.listLiveBlogEvents?.aResults)
      }
    }
  })

  function handleBulkResponse(aIds, eType) {
    if (eType === 'd') {
      setEventsList(eventsList.filter((item) => !aIds.includes(item._id)))
      setSelectedEvents(selectedEvents.filter((item) => !aIds.includes(item._id)))
    } else {
      setEventsList(
        eventsList.map((item) => {
          if (aIds.includes(item._id)) return { ...item, eStatus: eType }
          return item
        })
      )
    }
    setSelectedEvents(
      selectedEvents.map((item) => {
        return {
          ...item,
          value: false
        }
      })
    )
  }

  async function handleHeaderEvent(name, value) {
    switch (name) {
      case 'bulkAction':
        if (value === 'd') {
          const job = selectedEvents.map((a) => ({ ...a }))
          const obj = {
            aId: job.filter((item) => item.value && delete item.value),
            eStatus: value
          }
          const { data } = await deleteEvent({
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
              job.filter((item) => item.value === undefined && item).map((e) => e._id),
              value
            )
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
        break
      default:
        break
    }
  }

  const [deleteEvent] = useMutation(DELETE_LIVE_EVENT, {
    onCompleted: (data) => {
      if (data && data?.bulkDeleteLiveBlogEvent) {
        setEventsList(data?.bulkDeleteLiveBlogEvent?.aResults)
      }
    }
  })

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    const commonParams = {
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || '',
      eDesignation: data?.eDesignationFilter
    }
    return commonParams
  }

  function handleChange() {
    // setShow(!show)
    history.push(allRoutes.addEvent)
  }

  function handleSort(field) {
    setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
    appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
    const data = setSortType(columns, field.internalName)
    setColumns(data)
  }

  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }

  function handleCheckbox({ target }) {
    if (target.name === 'selectAll') {
      setSelectedEvents(
        eventsList.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else {
      if (target.checked) {
        setSelectedEvents(
          eventsList.map((item) => {
            if (item._id === target.name) item.value = true
            return item
          })
        )
      } else {
        setSelectedEvents(
          eventsList.map((item) => {
            if (item._id === target.name) item.value = false
            return item
          })
        )
      }
    }
  }

  function handleAction(id) {
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.deleteMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            const { data } = await deleteEvent({ variables: { input: { aId: [id] } } })
            if (data && data.bulkJobUpdate) handleBulkResponse([id], 'd')
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
      <TopBar
        buttons={[
          {
            text: <FormattedMessage id="createNewEvent" />,
            icon: 'icon-add',
            type: 'primary',
            clickEventName: 'newLiveEvent',
            isAllowedTo: 'ADD_LIVEEVENT'
          }
        ]}
        btnEvent={handleChange}
      />
      <DataTable
        className="live-events-list"
        bulkAction={bulkActionDropDown}
        columns={columns}
        sortEvent={handleSort}
        header={{
          left: {
            bulkAction: true,
            rows: true
          },
          right: {
            search: true,
            filter: false
          }
        }}
        totalRecord={totalRecord.current}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        isLoading={loading}
        pageChangeEvent={handlePageEvent}
        pagination={{ currentPage: requestParams?.nSkip, pageSize: requestParams?.nLimit }}
        selectAllEvent={handleCheckbox}
        selectAllValue={selectedEvents}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p))?.length}
        actionColumn={!!userPermission.filter((p) => actionColumnPermission.includes(p))?.length}
      >
        {eventsList?.map((event, index) => {
          return (
            <LiveEventsItemRow
              key={index}
              index={index}
              event={event}
              actionPermission={actionColumnPermission}
              bulkPermission={bulkActionPermission}
              selectedEvents={selectedEvents}
              onSelect={handleCheckbox}
              onDelete={handleAction}
            />
          )
        })}
      </DataTable>
    </>
  )
}

LiveEvents.propTypes = {
  userPermission: PropTypes.array
}

export default LiveEvents
