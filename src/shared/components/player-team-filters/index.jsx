import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useQuery } from '@apollo/client'
import { FormattedMessage } from 'react-intl'
import Select from 'react-select'

import { GET_COUNTRY_LIST } from 'graph-ql/management/player'
import { ROLES } from 'shared/constants'
import { debounce, getQueryVariable } from 'shared/utils'

function PlayerTeamFilters({ filterChange, type, defaultValue }) {
  const { handleSubmit, control, reset, setValue, getValues } = useForm({})
  const [countryList, setCountryList] = useState()
  const values = getValues()
  const [requestParams, setRequestParams] = useState({ nSkip: 1, nLimit: 10, sSearch: '' })
  const totalCountry = useRef(0)
  const isBottomReached = useRef(false)
  const { loadingCountry } = useQuery(GET_COUNTRY_LIST, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      if (isBottomReached.current) {
        setCountryList([...countryList, ...data.listCountry.aResults])
      } else {
        setCountryList(data.listCountry.aResults)
      }
      totalCountry.current = data.listCountry.nTotal
      isBottomReached.current = false
    }
  })
  const countryFilterLabel = getQueryVariable('aCountryFilterLabel')
  const countryFilterValue = getQueryVariable('aCountryFilterValue')
  useEffect(() => {
    if (countryFilterLabel && countryFilterValue) {
      setValue('aCountryFilters', { sTitle: countryFilterLabel, sISO: countryFilterValue })
    }
  }, [])

  useEffect(() => {
    if (defaultValue.aRoleFilter && type === 'player') {
      const paramRoleFilter = ROLES.filter((role) => defaultValue.aRoleFilter.includes(role.value) && role)
      setValue('aRoleFilters', paramRoleFilter)
    }
  }, [defaultValue.aRoleFilter])

  function onSubmit(data) {
    const countryFilter = data.aCountryFilters
    data.aCountryFilters = data.aCountryFilters ? { sISO: countryFilter.sISO, sTitle: countryFilter.sTitle } : {}
    data.aRoleFilters = data.aRoleFilters ? data.aRoleFilters.map((item) => item.value) : []
    filterChange({ data })
  }

  function onReset() {
    reset({ aCountryFilters: '', aRoleFilters: '' })
  }
  function handleScrollCountry() {
    if (totalCountry.current > requestParams.nSkip * 10) {
      setRequestParams({ ...requestParams, nSkip: requestParams.nSkip + 1 })
      isBottomReached.current = true
    }
  }
  const optimizedSearch = debounce((txt, { action, prevInputValue }) => {
    if (action === 'input-change') {
      if (txt) setRequestParams({ ...requestParams, sSearch: txt, nSkip: 1 })
    }
    if (action === 'set-value') {
      prevInputValue && setRequestParams({ ...requestParams, sSearch: '', nSkip: 1 })
    }
    if (action === 'menu-close') {
      prevInputValue && setRequestParams({ ...requestParams, sSearch: '', nSkip: 1 })
    }
  })

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
          <FormattedMessage id="country" />
        </Form.Label>
        <Controller
          name="aCountryFilters"
          control={control}
          render={({ field: { onChange, value = [], ref } }) => (
            <Select
              ref={ref}
              value={value}
              options={countryList}
              getOptionLabel={(option) => option.sTitle}
              getOptionValue={(option) => option.sISO}
              isSearchable
              isClearable
              className="react-select"
              classNamePrefix="select"
              isLoading={loadingCountry}
              onMenuScrollToBottom={handleScrollCountry}
              onInputChange={(value, action) => optimizedSearch(value, action)}
              onChange={(e) => {
                onChange(e)
              }}
            />
          )}
        />
      </Form.Group>
      {type === 'player' && (
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="role" />
          </Form.Label>
          <Controller
            name="aRoleFilters"
            control={control}
            render={({ field: { onChange, value = [], ref } }) => (
              <Select
                ref={ref}
                value={value || values?.aRoleFilters}
                options={ROLES}
                isMulti
                isSearchable
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
      )}
    </Form>
  )
}
PlayerTeamFilters.propTypes = {
  filterChange: PropTypes.func,
  defaultValue: PropTypes.object,
  type: PropTypes.string
}
export default PlayerTeamFilters
