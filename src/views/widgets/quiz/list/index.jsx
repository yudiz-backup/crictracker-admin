import React, { useContext, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useMutation, useQuery } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { useHistory } from 'react-router'
import { confirmAlert } from 'react-confirm-alert'

import { LIST_QUIZ } from 'graph-ql/quiz/query'
import DataTable from 'shared/components/data-table'
import { ToastrContext } from 'shared/components/toastr'
import TopBar from 'shared/components/top-bar'
import { allRoutes } from 'shared/constants/AllRoutes'
import { appendParams, parseParams, setSortType } from 'shared/utils'
import QuizItemRow from 'shared/components/quiz/row'
import CustomAlert from 'shared/components/alert'
import { TOAST_TYPE } from 'shared/constants'
import { DELETE_QUIZ } from 'graph-ql/quiz/mutation'

function QuizList({ userPermission }) {
  const history = useHistory()
  const params = parseParams(location.search)
  const { dispatch } = useContext(ToastrContext)
  const [quizList, setQuizList] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState([])
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const totalRecord = useRef(0)
  const columns = useRef(getColumns(params))
  const tabs = useRef([
    { name: <FormattedMessage id="draft" />, active: getActiveTabName(location.search) === 'draft', internalName: 'draft' },
    { name: <FormattedMessage id="published" />, active: getActiveTabName(location.search) === 'published', internalName: 'published' },
    { name: <FormattedMessage id="deleted" />, active: getActiveTabName(location.search) === 'deleted', internalName: 'deleted' }
  ])
  const bulkActionDropDown = [{ label: 'Delete All', value: 'd', isAllowedTo: 'DELETE_QUIZ' }]
  const bulkActionPermission = bulkActionDropDown.map((e) => e.isAllowedTo)
  const actionColumnPermission = ['EDIT_QUIZ', 'DELETE_QUIZ']

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteAllItem' })
  }

  const { loading, refetch } = useQuery(LIST_QUIZ, {
    variables: { input: requestParams },
    onCompleted: handleApiResponse
  })

  const [bulkDeleteAction] = useMutation(DELETE_QUIZ, {
    onCompleted: (data) => {
      if (data && data.deleteQuiz) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.deleteQuiz.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  function handleApiResponse(data) {
    if (data && data.listQuiz) {
      totalRecord.current = data.listQuiz.nTotal
      setSelectedQuiz(
        data.listQuiz.aQuiz.map((item) => {
          return {
            _id: item._id,
            value: false
          }
        })
      )
      setQuizList(data.listQuiz.aQuiz)
    }
  }

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params
    return {
      aStatus: data.aStatus || ['dr'],
      nLimit: Number(data.nLimit) || 10,
      nSkip: Number(data.nSkip) || 1,
      sSearch: data.sSearch || '',
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1
    }
  }

  function changeTab(name) {
    tabs.current = tabs.current.map((e) => {
      return { ...e, active: e.internalName === name }
    })
  }

  function handleTabChange(name) {
    changeTab(name)
    if (name === 'draft') {
      setRequestParams({ ...requestParams, aStatus: ['dr'], nSkip: 1 })
      appendParams({ aStatus: ['dr'], nSkip: 1 })
    } else if (name === 'published') {
      setRequestParams({ ...requestParams, aStatus: ['pub'], nSkip: 1 })
      appendParams({ aStatus: ['pub'], nSkip: 1 })
    } else if (name === 'deleted') {
      setRequestParams({ ...requestParams, aStatus: ['d'], nSkip: 1 })
      appendParams({ aStatus: ['d'], nSkip: 1 })
    }
  }

  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'addQuiz':
        history.push(allRoutes.addQuiz)
        break
      case 'download':
        console.log('Download')
        break
      default:
        break
    }
  }

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    if (data?.aStatus?.length) {
      if (data.aStatus.toString() === 'dr') {
        return 'draft'
      } else if (data.aStatus.toString() === 'pub') {
        return 'published'
      } else if (data.aStatus.toString() === 'd') {
        return 'deleted'
      }
    } else {
      return 'draft'
    }
  }

  async function handleHeaderEvent(name, value) {
    switch (name) {
      case 'bulkAction': {
        const selected = selectedQuiz.map((a) => ({ ...a }))
        const obj = {
          aPollIds: selected.filter((item) => item.value && delete item.value),
          eStatus: value
        }
        if (obj.eStatus === 'd') {
          const { data } = await bulkDeleteAction({
            variables: {
              input: {
                aId: obj.aPollIds.map((id) => {
                  return id._id
                })
              }
            }
          })
          if (data && data.deleteQuiz) {
            handleBulkResponse(
              selected.filter((item) => item.value === undefined && item).map((e) => e._id),
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

  function handleCheckbox({ target }) {
    if (target.name === 'selectAll') {
      setSelectedQuiz(
        selectedQuiz.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else {
      if (target.checked) {
        setSelectedQuiz(
          selectedQuiz.map((item) => {
            if (item._id === target.name) item.value = true
            return item
          })
        )
      } else {
        setSelectedQuiz(
          selectedQuiz.map((item) => {
            if (item._id === target.name) item.value = false
            return item
          })
        )
      }
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
            const { data } = await bulkDeleteAction({ variables: { input: { aId: [id] } } })
            if (data && data.deleteQuiz) handleBulkResponse([id], 'd')
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
      if (requestParams?.nLimit / 2 >= quizList?.length || requestParams?.nLimit / 2 <= aIds?.length) {
        handleMultipleDelete()
      } else {
        setQuizList(quizList?.filter((item) => !aIds.includes(item._id)))
      }
    }
    setSelectedQuiz(
      selectedQuiz.map((item) => {
        return {
          ...item,
          value: false
        }
      })
    )
  }

  function handleSort(field) {
    const data = setSortType(columns.current, field.internalName)
    columns.current = data
    setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
    appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
  }

  function getColumns(p) {
    const data = p
    const clm = [
      { name: <FormattedMessage id="id" />, internalName: '_id', type: 0 },
      { name: <FormattedMessage id="title" />, internalName: 'sTitle', type: 0 },
      { name: <FormattedMessage id="totalVotes" />, internalName: 'totalVotes', type: 0 }
    ]
    return clm.map((e) => {
      if (data?.sSortBy === e.internalName) return { ...e, type: Number(data.nOrder) || 0 }
      return e
    })
  }

  async function handleMultipleDelete() {
    if (quizList?.length === 0) {
      const lastPage = Math.ceil(totalRecord / requestParams?.nLimit)
      handlePageEvent(lastPage - 1)
    } else {
      const { data } = await refetch()
      handleApiResponse(data)
    }
  }

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      columns.current = getColumns(params.current)
      setRequestParams(getRequestParams(e.search))
      changeTab(getActiveTabName(e.search))
    })
  }, [history])

  return (
    <>
      <TopBar
        buttons={[
          {
            text: <FormattedMessage id="addQuiz" />,
            icon: 'icon-add',
            type: 'primary',
            clickEventName: 'addQuiz',
            isAllowedTo: 'CREATE_QUIZ'
          }
        ]}
        btnEvent={handleBtnEvent}
      />
      <DataTable
        className="user-list"
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
        sortEvent={handleSort}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        selectAllValue={selectedQuiz}
        tabs={tabs.current}
        tabEvent={handleTabChange}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
        actionColumn={!!userPermission.filter((p) => actionColumnPermission.includes(p)).length}
      >
        {quizList.map((item, i) => (
          <QuizItemRow
            key={item?._id + i}
            index={i}
            item={item}
            selectedItem={selectedQuiz}
            bulkPermission={bulkActionPermission}
            actionPermission={actionColumnPermission}
            onDelete={handleDelete}
            onSelect={handleCheckbox}
          />
        ))}
      </DataTable>
    </>
  )
}
QuizList.propTypes = {
  userPermission: PropTypes.array
}
export default QuizList
