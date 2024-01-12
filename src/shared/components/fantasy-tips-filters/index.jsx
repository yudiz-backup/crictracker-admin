import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Controller, useForm } from 'react-hook-form'
import { Form, Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import Select from 'react-select'
import moment from 'moment'

import { FANTASY_TIPS_TYPES } from 'shared/constants'
import DatePicker from 'react-datepicker'

function FantasyTipsFilters({ filterChange, defaultValue }) {
  const { handleSubmit, control, reset, setValue, getValues } = useForm({})
  const values = getValues()
  const [dateRange, setDateRange] = useState([null, null])
  const [startDate, endDate] = dateRange

  useEffect(() => {
    if (defaultValue.aFilter) {
      const paramFilter = FANTASY_TIPS_TYPES.filter((type) => defaultValue.aFilter.includes(type.value) && type)
      setValue('aFilters', paramFilter)
    }
  }, [defaultValue.aFilter])

  useEffect(() => {
    if (defaultValue.aDate?.length !== 0) {
      setDateRange([defaultValue.aDate[0], defaultValue.aDate[1]])
    }
  }, [defaultValue.aDate])

  function onSubmit(data) {
    data.aFilters = data.aFilters ? data.aFilters.map((item) => item.value) : []
    data.aDate = data.aDate ? moment(Number(data.aDate[0])).format('DD MMMM YYYY') + '-' + moment(Number(data.aDate[1])).format('DD MMMM YYYY') : ''
    filterChange({ data })
  }

  function onReset() {
    reset({ aFilters: '' })
    setDateRange([null, null])
  }

  return (
    <Form className="user-filter" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="top-d-button">
        <Button variant="outline-secondary" type="reset" onClick={onReset} className="square me-2" size="sm">
          <FormattedMessage id="reset" />
        </Button>
        <Button variant="success" type="submit" className="square" size="sm">
          <FormattedMessage id="apply" />
        </Button>
      </div>
      <div>
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="type" />
          </Form.Label>
          <Controller
            name="aFilters"
            control={control}
            render={({ field: { onChange, value = [], ref } }) => (
              <Select
                ref={ref}
                value={value || values?.aFilters}
                options={FANTASY_TIPS_TYPES}
                isMulti
                className="react-select"
                classNamePrefix="select"
                closeMenuOnSelect={false}
                onChange={(e) => {
                  onChange(e)
                }}
              />
            )}
          />
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label className="d-block">
            <FormattedMessage id="dateRange" />
          </Form.Label>
          <Controller
            name="aDate"
            control={control}
            render={({ field: { onChange, value = [], ref } }) => (
              <DatePicker
                ref={ref}
                value={value}
                className="form-control"
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => {
                  setDateRange(update)
                  onChange(update)
                }}
                // maxDate={new Date()}
              />
            )}
          />
        </Form.Group>
      </div>
    </Form>
  )
}

FantasyTipsFilters.propTypes = {
  filterChange: PropTypes.func,
  defaultValue: PropTypes.object
}

export default FantasyTipsFilters
