import React, { useEffect, useState, useRef } from 'react'
import moment from 'moment'
import { Form, Row, Col } from 'react-bootstrap'
import { useLazyQuery, useQuery } from '@apollo/client'
import PropTypes from 'prop-types'
import { Controller } from 'react-hook-form'
import { FormattedMessage, useIntl } from 'react-intl'
import Select from 'react-select'
import { useParams } from 'react-router-dom'

import TinyEditor from 'shared/components/editor'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { GET_SERIES_CATEGORY_LIST, GET_SERIES_LIST } from 'graph-ql/management/category'
import { debounce } from 'shared/utils'
import CommonInput from '../common-input'
import ToolTip from 'shared/components/tooltip'
function AddCategory({ register, errors, control, nameChanged, data, watch, values, setValue, getParentUrl }) {
  const { id } = useParams()
  const eType = watch('eType')
  const [name, setName] = useState()
  const [requestParamsSeries, setRequestParamsSeries] = useState({ nSkip: 1, nLimit: 10, sSearch: '' })
  const [requestParamsParentCategory, setRequestParamsParentCategory] = useState({ nSkip: 1, nLimit: 10, sSearch: '' })
  const [series, setSeries] = useState()
  const [parentCategory, setParentCategory] = useState()
  const totalSeries = useRef(0)
  const totalParentCategory = useRef(10)
  const isBottomReached = useRef(false)

  const [getSeries, { loading: loadingSeries }] = useLazyQuery(GET_SERIES_LIST, {
    variables: { input: requestParamsSeries },
    onCompleted: (data) => {
      if (data?.listSeries) {
        if (isBottomReached.current) {
          setSeries([...series, ...data.listSeries.aResults])
        } else {
          setSeries(data?.listSeries?.aResults)
        }

        totalSeries.current = data.listSeries.nTotal
        isBottomReached.current = false
      }
    }
  })

  const { loading: loadingParentCategory } = useQuery(GET_SERIES_CATEGORY_LIST, {
    variables: { input: requestParamsParentCategory },
    onCompleted: (data) => {
      if (data?.getApiSeriesCategory) {
        if (isBottomReached.current) {
          setParentCategory([...parentCategory, ...data.getApiSeriesCategory])
        } else {
          setParentCategory(data.getApiSeriesCategory)
        }
        totalParentCategory.current = data.getApiSeriesCategory.length
        isBottomReached.current = false
      }
    }
  })

  useEffect(() => {
    name && nameChanged(name)
  }, [name])

  useEffect(() => {
    if (eType === 'as') {
      getSeries()
    }
    if (eType !== 'as') {
      setValue('oSeries', '')
      // setValue('oParentCategory', '')
    }
  }, [eType])

  useEffect(() => {
    if (!id) {
      setValue('eType', 's')
    }
  }, [id])
  function handleBlur(e) {
    e.target.value && !name && setName(e.target.value)
  }
  function handleScrollSeries() {
    if (totalSeries.current > requestParamsSeries.nSkip * 10) {
      setRequestParamsSeries({ ...requestParamsSeries, nSkip: requestParamsSeries.nSkip + 1 })
      isBottomReached.current = true
    }
  }
  function handleScrollParentCategory() {
    if (totalParentCategory.current < requestParamsParentCategory?.nLimit) {
      isBottomReached.current = false
    } else {
      setRequestParamsParentCategory({ ...requestParamsParentCategory, nSkip: requestParamsParentCategory.nSkip + 1 })
      isBottomReached.current = true
    }
  }

  const optimizedSearch = debounce((value, action, type) => {
    if (action.action !== 'input-blur') {
      if (type === 'series') {
        setRequestParamsSeries({ ...requestParamsSeries, sSearch: value, nSkip: 1 })
      }
      if (type === 'parentCategory') {
        setRequestParamsParentCategory({ ...requestParamsParentCategory, sSearch: value, nSkip: 1 })
      }
    }
  })

  return (
    <Row>
      <Col sm="3">
        <Form.Label>
          <FormattedMessage id="selectCategoryType" />*
        </Form.Label>
      </Col>
      <Col sm="3">
        <Form.Group className="form-group radio-group">
          <Form.Check
            {...register('eType', { required: validationErrors.required })}
            value="s"
            type="radio"
            label={useIntl().formatMessage({ id: 'simpleCategory' })}
            className="mb-0 mt-0"
            name="eType"
            disabled={data?.eType === 't'}
            id="Simple Category"
          />
        </Form.Group>
      </Col>
      <Col sm="3">
        <Form.Group className="form-group radio-group">
          <Form.Check
            {...register('eType', { required: validationErrors.required })}
            value="as"
            type="radio"
            label={useIntl().formatMessage({ id: 'apiSeriesCategory' })}
            disabled={data?.eType === 't'}
            className="mb-0 mt-0"
            name="eType"
            id="API series Category"
          />
        </Form.Group>
      </Col>
      <Col sm="3">
        <Form.Group className="form-group radio-group">
          <Form.Check
            {...register('eType', { required: validationErrors.required })}
            value="pct"
            type="radio"
            label={useIntl().formatMessage({ id: 'parentCategory' })}
            className="mb-0 mt-0"
            name="eType"
            disabled={data?.eType === 't'}
            id="Tournament Category"
          />
          {errors.eType && <Form.Control.Feedback type="invalid">{errors.eType.message}</Form.Control.Feedback>}
        </Form.Group>
      </Col>
      {eType === 'as' && (
        <>
          <Col sm="6">
            <Form.Check
              type="checkbox"
              {...register('bIsLeague')}
              id="bIsLeague"
              name="bIsLeague"
              className="form-check"
              label={useIntl().formatMessage({ id: 'consideredAsLeague' })}
            />
          </Col>
          <Col sm="6">
            <Form.Check
              type="checkbox"
              {...register('isBlockedMini')}
              id="isBlockedMini"
              name="isBlockedMini"
              className="form-check"
              label={useIntl().formatMessage({ id: 'blockedInMiniscoreCard' })}
            />
          </Col>
        </>
      )}
      <Col sm="6">
        <CommonInput
          placeholder={useIntl().formatMessage({ id: 'writeHere' })}
          altText="nameIsHowItAppearsOnTheSite"
          type="text"
          register={register}
          errors={errors}
          className={errors.sName && 'error'}
          name="sName"
          label="name"
          validation={{ maxLength: { value: 40, message: validationErrors.maxLength(40) } }}
          onBlur={handleBlur}
          required
        />
      </Col>
      {eType === 'as' && (
        <Col sm="6">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="series" />*
              <ToolTip toolTipMessage={<FormattedMessage id="pleaseAddSeoRedirectToThisSeries" />}>
                <i className="icon-info" />
              </ToolTip>
            </Form.Label>
            <Controller
              name="oSeries"
              control={control}
              rules={{ required: validationErrors.required }}
              render={({ field: { onChange, value = [], ref } }) => (
                <Select
                  ref={ref}
                  value={value || values?.oSeries}
                  options={series}
                  getOptionLabel={(option) => option.sTitle && `${option.sTitle} - ${option?.sSeason} (${moment(option.dStartDate).format('Do MMM')}) - (${moment(option.dEndDate).format('Do MMM')})`}
                  getOptionValue={(option) => option._id}
                  className={`react-select ${errors?.oSeries && 'error'}`}
                  classNamePrefix="select"
                  isSearchable={true}
                  onMenuScrollToBottom={handleScrollSeries}
                  isLoading={loadingSeries}
                  onInputChange={(value, action) => optimizedSearch(value, action, 'series')}
                  onChange={(e) => {
                    onChange(e)
                  }}
                />
              )}
            />
            {errors.oSeries && <Form.Control.Feedback type="invalid">{errors.oSeries.message}</Form.Control.Feedback>}
          </Form.Group>
        </Col>
      )}

      {eType === 'as' && (
        <Col sm="6">
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={errors.sSrtTitle && 'error'}
            name="sSrtTitle"
            label="shortTitle"
            validation={{ maxLength: { value: 100, message: validationErrors.maxLength(100) } }}
            onBlur={handleBlur}
          />
        </Col>
      )}
      <Col sm="6">
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="parentCategory" />
          </Form.Label>
          <Controller
            name="oParentCategory"
            control={control}
            render={({ field: { onChange, value = [], ref } }) => (
              <Select
                ref={ref}
                value={value}
                options={parentCategory}
                getOptionLabel={(option) => option.sName}
                getOptionValue={(option) => option._id}
                className={`react-select ${errors?.oParentCategory && 'error'}`}
                classNamePrefix="select"
                onInputChange={(value, action) => optimizedSearch(value, action, 'parentCategory')}
                isSearchable={true}
                isClearable
                isLoading={loadingParentCategory}
                onMenuScrollToBottom={handleScrollParentCategory}
                onChange={(e) => {
                  onChange(e)
                  getParentUrl((t) => t || (e.oSeo.sSlug + '/'))
                }}
              />
            )}
          />
          {errors.oParentCategory && <Form.Control.Feedback type="invalid">{errors.oParentCategory.message}</Form.Control.Feedback>}
        </Form.Group>
      </Col>
      <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="content" />
        </Form.Label>
        <TinyEditor
          className={`form-control ${errors.sContent && 'error'}`}
          name="sContent"
          control={control}
          onlyTextFormatting
        />
        {errors.sContent && <Form.Control.Feedback type="invalid">{errors.sContent.message}</Form.Control.Feedback>}
      </Form.Group>
    </Row>
  )
}

AddCategory.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  control: PropTypes.object,
  nameChanged: PropTypes.func,
  data: PropTypes.object,
  watch: PropTypes.func,
  values: PropTypes.object,
  setValue: PropTypes.func,
  getParentUrl: PropTypes.func
}

export default AddCategory
