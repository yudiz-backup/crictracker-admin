import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { FormattedMessage } from 'react-intl'
import Select from 'react-select'

import { TAG_MIGRATION_TYPES } from 'shared/constants'

function PlayerTeamFilters({ filterChange, defaultValue }) {
  const { handleSubmit, control, reset, setValue, getValues } = useForm({})
  const values = getValues()

  useEffect(() => {
    if (defaultValue.eType) {
      const defaultTagType = TAG_MIGRATION_TYPES.filter((tag) => tag.value === defaultValue.eType)
      setValue('eTypeFilters', defaultTagType)
    }
  }, [defaultValue.eType])

  function onSubmit(data) {
    filterChange(data?.eTypeFilters?.value)
  }

  function onReset() {
    reset({})
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
      <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="tagType" />
        </Form.Label>
        <Controller
          name="eTypeFilters"
          control={control}
          render={({ field: { onChange, value = [], ref } }) => (
            <Select
              ref={ref}
              value={value || values?.eTypeFilters}
              options={TAG_MIGRATION_TYPES}
              isSearchable
              className="react-select"
              classNamePrefix="select"
              onChange={(e) => {
                onChange(e)
              }}
            />
          )}
        />
      </Form.Group>
    </Form>
  )
}
PlayerTeamFilters.propTypes = {
  filterChange: PropTypes.func,
  defaultValue: PropTypes.object
}
export default PlayerTeamFilters
