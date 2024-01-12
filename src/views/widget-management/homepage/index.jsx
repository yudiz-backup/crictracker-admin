import React, { useContext, useRef, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { DragDropContext } from 'react-beautiful-dnd'
import { Row, Spinner } from 'react-bootstrap'
import { useIntl } from 'react-intl'

import { EDIT_HOME_WIDGETS, GET_HOME_WIDGETS } from 'graph-ql/widgets/poll/query'
import WidgetColumns from 'shared/components/widget-columns'
import TopBar from 'shared/components/top-bar'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'

function HomePageWidgetManagement() {
  const { dispatch } = useContext(ToastrContext)
  const selectedPoll = useRef()
  const initialColumns = {
    Left: {
      id: 'Left',
      list: []
    },
    All: {
      id: 'All',
      list: [
        {
          _id: 'cricSpecial',
          eType: 'cricSpecial',
          mValue: {
            sTitle: 'Cric Special'
          }
        },
        {
          _id: 'ranking',
          eType: 'ranking',
          mValue: {
            sTitle: 'Ranking'
          }
        },
        {
          _id: 'trendingNews',
          eType: 'trendingNews',
          mValue: {
            sTitle: 'Trending News'
          }
        },
        {
          _id: 'currentSeries',
          eType: 'currentSeries',
          mValue: {
            sTitle: 'Current Series'
          }
        },
        {
          _id: 'topTeams',
          eType: 'topTeams',
          mValue: {
            sTitle: 'Top Teams'
          }
        }
      ]
    },
    Right: {
      id: 'Right',
      list: []
    }
  }
  const [columns, setColumns] = useState(initialColumns)

  useQuery(GET_HOME_WIDGETS, {
    onCompleted: (data) => {
      selectedPoll.current = {
        poll: data?.getHomeWidgets?.filter((ele) => ele.eType === 'poll'),
        quiz: data?.getHomeWidgets?.filter((ele) => ele.eType === 'quiz')
      }
      const rightPanel = data?.getHomeWidgets?.filter((ele) => ele.sPosition === 'r')?.sort((a, b) => a.nPriority - b.nPriority)
      const leftPanel = data?.getHomeWidgets?.filter((ele) => ele.sPosition === 'l')?.sort((a, b) => a.nPriority - b.nPriority)
      initialColumns.Right.list = rightPanel
      initialColumns.Left.list = leftPanel
      initialColumns.All.list = initialColumns.All.list?.filter((e) => !data?.getHomeWidgets?.find((ele) => ele?.eType === e?._id))
      setColumns(initialColumns)
    }
  })

  const [updateWidgetsPriority, { loading }] = useMutation(EDIT_HOME_WIDGETS, {
    onCompleted: (data) => {
      if (data && data.updateHomeWidgets) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.updateHomeWidgets, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  function onDragEnd({ source, destination }) {
    if (destination === undefined || destination === null) return null
    if (source.droppableId === destination.droppableId && destination.index === source.index) return null

    const start = columns[source.droppableId]
    const end = columns[destination.droppableId]

    if (start === end) {
      const newList = start.list.filter((_, idx) => idx !== source.index)

      // Then insert the item at the right location
      newList.splice(destination.index, 0, start.list[source.index])

      // Then create a new copy of the column object
      const newCol = {
        id: start.id,
        list: newList
      }

      // Update the state
      setColumns((state) => ({ ...state, [newCol.id]: newCol }))
    } else {
      // Filter the start list like before
      const newStartList = start.list.filter((_, idx) => idx !== source.index)

      // Create a new start column
      const newStartCol = {
        id: start.id,
        list: newStartList
      }

      // Make a new end list array
      const newEndList = end.list

      // Insert the item into the end list
      newEndList.splice(destination.index, 0, start.list[source.index])

      // Create a new end column
      const newEndCol = {
        id: end.id,
        list: newEndList
      }

      // Update the state
      setColumns((state) => ({
        ...state,
        [newStartCol.id]: newStartCol,
        [newEndCol.id]: newEndCol
      }))
    }
  }

  function onSubmit() {
    const leftSideBar = columns.Left.list?.map((item, i) => {
      return {
        eType: item?.eType,
        mValue: {
          // _id: item?.eType === 'poll' ? item?.mValue?._id || item?._id : null,
          _id: item?.mValue?._id || item?._id,
          // sTitle: item?.mValue?.sTitle || item?.sType === 'ma' ? item?.sMatchPollTitle : item?.sTitle
          sTitle: item?.sMatchPollTitle || item?.sTitle || item?.mValue?.sTitle
        },
        sPosition: 'l',
        nPriority: i + 1
      }
    })
    const rightSideBar = columns.Right.list?.map((item, i) => {
      return {
        eType: item?.eType,
        mValue: {
          // _id: item?.eType === 'poll' ? item?.mValue?._id || item?._id : null,
          _id: item?.mValue?._id || item?._id,
          sTitle: item?.mValue?.sTitle || item?.sTitle
        },
        sPosition: 'r',
        nPriority: i + 1
      }
    })
    updateWidgetsPriority({ variables: { input: [...leftSideBar, ...rightSideBar] } })
  }

  function handlePollChanges(_, { action, option, removedValue, removedValues }, eType) {
    if (action === 'select-option') {
      option.eType = eType
      setColumns({ ...columns, All: { ...columns.All, list: [...columns.All.list, option] } })
    } else if (action === 'remove-value') {
      setColumns((c) => {
        return {
          Left: { ...c.Left, list: c.Left.list.filter((i) => i?._id !== removedValue?._id) },
          All: { ...c.All, list: c.All.list.filter((i) => i?._id !== removedValue?._id) },
          Right: { ...c.Right, list: c.Right.list.filter((i) => i?._id !== removedValue?._id) }
        }
      })
    } else if (action === 'clear') {
      const id = []
      removedValues?.forEach((e) => id.push(e?._id))
      setColumns((c) => {
        return {
          Left: { ...c.Left, list: c.Left.list.filter((i) => !id?.includes(i?._id)) },
          All: { ...c.All, list: c.All.list.filter((i) => !id?.includes(i?._id)) },
          Right: { ...c.Right, list: c.Right.list.filter((i) => !id?.includes(i?._id)) }
        }
      })
    }
  }

  function handleRemove(i, p) {
    const c = { ...columns }
    c[p].list = c[p]?.list?.filter((e) => e?._id !== i?._id)
    c.All.list.push(i)
    setColumns(c)
  }

  return (
    <>
      <TopBar
        buttons={[
          {
            text: (
              <>
                {loading && <Spinner animation="border" className="me-2" size="sm" />}
                {useIntl().formatMessage({ id: 'update' })}
              </>
            ),
            type: 'primary',
            clickEventName: 'update',
            isAllowedTo: 'EDIT_HOME_WIDGETS'
          }
        ]}
        btnEvent={onSubmit}
      />
      <DragDropContext onDragEnd={onDragEnd}>
        <Row>
          {Object.values(columns).map((col) => (
            <WidgetColumns
              col={col}
              key={col.id}
              selectedPoll={selectedPoll.current}
              handleChange={handlePollChanges}
              onRemove={handleRemove}
            />
          ))}
        </Row>
      </DragDropContext>
    </>
  )
}
export default HomePageWidgetManagement
