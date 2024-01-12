import { useMutation, useQuery } from '@apollo/client'
import { ADD_CURRENT_SERIES, UPDATE_SUPER_PRIORITY } from 'graph-ql/settings/current-series/mutation'
import { LIST_CURRENT_ONGOING_SERIES, LIST_CURRENT_SERIES } from 'graph-ql/settings/current-series/query'
import React, { useContext, useRef, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useFieldArray, useForm } from 'react-hook-form'
import { FormattedMessage } from 'react-intl'

import CurrentSeriesItemRow from 'shared/components/current-series-item-row'
import Loading from 'shared/components/loading'
import { ToastrContext } from 'shared/components/toastr'
import { PRIORITY, TOAST_TYPE } from 'shared/constants'
import { debounce } from 'shared/utils'

function CurrentSeries() {
  const { dispatch } = useContext(ToastrContext)
  const seriesKey = { nPriority: '', iSeriesId: '' }
  const [allSeries, setAllSeries] = useState([])
  const [payload, setPayload] = useState({
    nSkip: 1,
    nLimit: 10,
    sSearch: ''
  })
  const isBottomReached = useRef(false)
  const total = useRef(0)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ defaultValues: { oInput: getDefaultValue() } })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'oInput'
  })

  const { loading } = useQuery(LIST_CURRENT_SERIES, {
    variables: { input: { nSkip: 1, nLimit: 5, sSearch: '' } },
    onCompleted: (data) => {
      if (data && data?.listCurrentSeries?.aResults?.length) {
        reset({ oInput: getDefaultValue(data?.listCurrentSeries?.aResults) })
      }
    }
  })

  const { loading: onGoingSeriesLoading } = useQuery(LIST_CURRENT_ONGOING_SERIES, {
    variables: {
      input: payload
    },
    onCompleted: (data) => {
      if (data && data?.listCurrentOngoingSeries?.aResults) {
        if (isBottomReached.current) {
          setAllSeries([...allSeries, ...data.listCurrentOngoingSeries.aResults])
        } else {
          setAllSeries(data.listCurrentOngoingSeries.aResults)
        }
        total.current = data.listCurrentOngoingSeries.nTotal
        isBottomReached.current = false
      }
    }
  })

  const [addCurrentSeries, { loading: addLoading }] = useMutation(ADD_CURRENT_SERIES, {
    onCompleted: (data) => {
      if (data && data.addCurrentSeries) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.addCurrentSeries.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  const [updateSuperPriority, { loading: updateLoading }] = useMutation(UPDATE_SUPER_PRIORITY, {
    onCompleted: (data) => {
      if (data && data.updateSuperPrioritySeriesStatus) {
        dispatch({ type: 'SHOW_TOAST', payload: { message: data.updateSuperPrioritySeriesStatus.sMessage, type: TOAST_TYPE.Success } })
      }
      const nId = data?.updateSuperPrioritySeriesStatus?.oData?._id
      const updatedFields = fields.map((field) => {
        if (field?.iSeriesId?.id === nId) {
          return {
            ...field,
            iSeriesId: {
              ...field.iSeriesId,
              bIsSuperPriority: !field.iSeriesId.bIsSuperPriority
            }
          }
        }
        return field
      })
      if (updatedFields && nId) {
        reset({ oInput: updatedFields })
      }
    }
  })

  function getDefaultValue(data) {
    if (data) {
      return data.map((i) => {
        return {
          nPriority: PRIORITY.filter((e) => e.value === i.nPriority)[0],
          iSeriesId: {
            ...i,
            sTitle: i.oSeries.sTitle,
            _id: i.iSeriesId,
            id: i._id
          }
        }
      })
    } else {
      return [seriesKey]
    }
  }

  const optimizedSearch = debounce((txt, { action, prevInputValue }) => {
    if (action === 'input-change') {
      if (txt) setPayload({ ...payload, sSearch: txt, nSkip: 1 })
    }
    if (action === 'set-value') {
      prevInputValue && setPayload({ ...payload, sSearch: '', nSkip: 1 })
    }
    if (action === 'menu-close') {
      prevInputValue && setPayload({ ...payload, sSearch: '', nSkip: 1 })
    }
  })

  function handleScroll() {
    if (total.current > allSeries?.length) {
      setPayload({ ...payload, nSkip: payload.nSkip + 1 })
      isBottomReached.current = true
    }
  }

  function onSuperPriorityChange({ target }) {
    if (target.name) {
      updateSuperPriority({ variables: { input: { _id: target.name, bIsSuperPriority: target.checked && true } } })
    }
  }

  function onSubmit({ oInput }) {
    const data = oInput
      .map((item) => {
        if (item?.iSeriesId || item.nPriority) {
          return { iSeriesId: item?.iSeriesId?._id, nPriority: item.nPriority?.value }
        } else {
          return false
        }
      })
      .filter((item) => item)
    addCurrentSeries({ variables: { input: { oInput: data } } })
  }

  return (
    <div className="current-series-list position-relative">
      <div className="d-flex align-items-center current-series">
        <div className="series-selector">
          <label>
            <FormattedMessage id="series" />
          </label>
        </div>
        <div className="priority-selector">
          <label>
            <FormattedMessage id="priority" />
          </label>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
          <CurrentSeriesItemRow
            key={field.id}
            control={control}
            index={index}
            allSeries={allSeries}
            errors={errors}
            fields={fields}
            onSuperPriorityChange={onSuperPriorityChange}
            optimizedSearch={optimizedSearch}
            field={field}
            handleScroll={handleScroll}
            handleDelete={(i) => remove(i)}
            addMore={() => append(seriesKey)}
          />
        ))}
        <Button variant="primary" type="submit" disabled={addLoading} className="mt-3">
          <FormattedMessage id="update" /> {addLoading && <Spinner animation="border" size="sm" />}
        </Button>
      </form>
      {(onGoingSeriesLoading || loading || updateLoading) && <Loading />}
    </div>
  )
}
export default CurrentSeries
