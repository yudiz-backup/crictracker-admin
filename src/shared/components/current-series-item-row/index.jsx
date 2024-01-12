import React, { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import Select from 'react-select'
import { Controller, useWatch } from 'react-hook-form'
import PropTypes from 'prop-types'

import { FormattedMessage } from 'react-intl'
import { PRIORITY } from 'shared/constants'
import PermissionProvider from '../permission-provider'
import { validationErrors } from 'shared/constants/ValidationErrors'
import ToolTip from '../tooltip'

function CurrentSeriesItemRow({ index, control, optimizedSearch, handleScroll, handleDelete, errors, allSeries, addMore, fields, onSuperPriorityChange, field }) {
  const [validation, setValidation] = useState({})
  const oInput = useWatch({
    control,
    name: 'oInput'
  })

  useEffect(() => {
    if (oInput[index] && index !== 0) {
      setValidation({
        iSeriesId: oInput[index]?.nPriority?.value ? validationErrors.required : false,
        nPriority: oInput[index]?.iSeriesId?._id ? validationErrors.required : false
      })
    } else {
      setValidation({ iSeriesId: validationErrors.required, nPriority: validationErrors.required })
    }
  }, [oInput])

  const selectedPriorities = oInput?.map((item) => item?.nPriority?.value)
  const selectedSeries = oInput?.map((item) => item?.iSeriesId?._id)

  const trueStatusCount = fields.filter(field => field?.iSeriesId?.bIsSuperPriority === true).length

  return (
    <>
      <div className="d-flex align-items-baseline current-series">

        <div md={4} lg={4} className="series-selector">
          <Controller
            name={`oInput[${index}].iSeriesId`}
            control={control}
            rules={{ required: validation?.iSeriesId }}
            render={({ field: { onChange, value = '', ref } }) => (
              <Select
                ref={ref}
                value={value}
                options={allSeries}
                getOptionLabel={(option) => option?.sTitle}
                getOptionValue={(option) => option?._id}
                isOptionDisabled={(option) => selectedSeries.includes(option?._id)}
                className={`react-select ${errors?.oInput && errors?.oInput[index] && errors?.oInput[index].iSeriesId && 'error'}`}
                classNamePrefix="select"
                isSearchable
                onInputChange={(value, action) => optimizedSearch(value, action)}
                onMenuScrollToBottom={handleScroll}
                onChange={(e) => {
                  onChange(e)
                }}
              />
            )}
          />
          {errors && errors.oInput && errors.oInput[index] && errors.oInput[index].iSeriesId && (
            <Form.Control.Feedback type="invalid">{errors.oInput[index].iSeriesId.message}</Form.Control.Feedback>
          )}
        </div>

        <div className="priority-selector">
          <Controller
            name={`oInput[${index}].nPriority`}
            control={control}
            rules={{ required: validation?.nPriority }}
            render={({ field: { onChange, value = '', ref } }) => (
              <Select
                ref={ref}
                value={value}
                isOptionDisabled={(option) => selectedPriorities.includes(option.value)}
                options={PRIORITY}
                classNamePrefix="select"
                className={`react-select ${errors?.oInput && errors?.oInput[index] && errors?.oInput[index].nPriority && 'error'}`}
                isSearchable={false}
                onChange={(e) => {
                  onChange(e)
                }}
              />
            )}
          />
          {errors && errors.oInput && errors.oInput[index] && errors.oInput[index].nPriority && (
            <Form.Control.Feedback type="invalid">{errors.oInput[index].nPriority.message}</Form.Control.Feedback>
          )}
        </div>

        <PermissionProvider isAllowedTo="DELETE_CURRENT_SERIES">
          {fields?.length < 5 && (
            <Button variant="outline-secondary" size="md" className="me-2" onClick={() => addMore(index)}>
              <i className="icon-add d-block" />
            </Button>
          )}
          {fields?.length > 1 && (
            <Button variant="outline-secondary" size="md" onClick={() => handleDelete(index)}>
              <i className="icon-close d-block" />
            </Button>
          )}
        </PermissionProvider>

        <div>
          <div md={4} lg={4}>
            <ToolTip toolTipMessage={<FormattedMessage id="SuperPriority" />} >
              <Form.Check
                type="switch"
                name={field?.iSeriesId?.id}
                disabled={(!field?.iSeriesId?.bIsSuperPriority && trueStatusCount === 2) || !field?.iSeriesId?.id}
                className="series-toggle d-inline-block mx-4"
                checked={field?.iSeriesId?.bIsSuperPriority}
                onChange={onSuperPriorityChange}
              />
            </ToolTip>
          </div>
        </div>

      </div>
    </>
  )
}
CurrentSeriesItemRow.propTypes = {
  errors: PropTypes.object,
  control: PropTypes.object,
  index: PropTypes.number,
  optimizedSearch: PropTypes.func,
  handleScroll: PropTypes.func,
  handleDelete: PropTypes.func,
  addMore: PropTypes.func,
  allSeries: PropTypes.array,
  fields: PropTypes.array,
  field: PropTypes.object,
  onSuperPriorityChange: PropTypes.func
}
export default CurrentSeriesItemRow
