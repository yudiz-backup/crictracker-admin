import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Col, Form, Row } from 'react-bootstrap'
import { Controller } from 'react-hook-form'
import { FormattedMessage, useIntl } from 'react-intl'
import Select from 'react-select'
import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { validationErrors } from 'shared/constants/ValidationErrors'
import { DESIGNATION_IN_JOB, NO_MINUS_NEGATIVE, NO_NEGATIVE, OPENING_IN_JOB } from 'shared/constants'
import { GET_LOCATIONS } from 'graph-ql/settings/job-post/query'
import CommonInput from '../common-input'

function AddEditJobPost({ control, register, errors, values, setValue, nameChanged, watch }) {
  const [name, setName] = useState()
  const { type } = useParams()
  const [location, setLocation] = useState()
  const salaryMin = watch('fSalaryFrom')
  const experienceMin = watch('fExperienceFrom')

  const { loading } = useQuery(GET_LOCATIONS, {
    onCompleted: (data) => {
      if (data && data.getLocations) {
        setLocation(data.getLocations)
      }
    }
  })

  useEffect(() => {
    name && nameChanged(name)
  }, [name])

  function handleBlur(e) {
    e.target.value && !name && setName(e.target.value)
  }
  return (
    <>
      <Row>
        <Col md="4">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="designation" />*
            </Form.Label>
            <Controller
              name="eDesignation"
              control={control}
              rules={{ required: validationErrors.required }}
              render={({ field: { onChange, value = [], ref } }) => (
                <Select
                  ref={ref}
                  value={value || values?.eDesignation}
                  options={DESIGNATION_IN_JOB}
                  className={`react-select ${errors?.eDesignation && 'error'}`}
                  classNamePrefix="select"
                  isSearchable={false}
                  isDisabled={type === 'detail-job'}
                  onChange={(e) => {
                    onChange(e)
                  }}
                />
              )}
            />
            {errors.eDesignation && <Form.Control.Feedback type="invalid">{errors.eDesignation.message}</Form.Control.Feedback>}
          </Form.Group>
        </Col>
        <Col md="4">
          <CommonInput
            type="text"
            onBlur={handleBlur}
            placeholder={useIntl().formatMessage({ id: 'writeHere' })}
            register={register}
            errors={errors}
            className={errors.sTitle && 'error'}
            name="sTitle"
            disabled={type === 'detail-job'}
            label="jobTitle"
            required
          />
        </Col>
        <Col md="4">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="location" />*
            </Form.Label>
            <Controller
              name="oLocation"
              control={control}
              rules={{ required: validationErrors.required }}
              render={({ field: { onChange, value = [], ref } }) => (
                <Select
                  ref={ref}
                  value={value || values?.oLocation}
                  getOptionLabel={(option) => option.sTitle}
                  getOptionValue={(option) => option._id}
                  options={location}
                  className={`react-select ${errors?.oLocation && 'error'}`}
                  classNamePrefix="select"
                  isSearchable={false}
                  isLoading={loading}
                  onChange={(e) => {
                    onChange(e)
                  }}
                  isDisabled={type === 'detail-job'}
                />
              )}
            />
            {errors.oLocation && <Form.Control.Feedback type="invalid">{errors.oLocation.message}</Form.Control.Feedback>}
          </Form.Group>
        </Col>
        <Col md="4">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="openingFor" />*
            </Form.Label>
            <Controller
              name="eOpeningFor"
              control={control}
              rules={{ required: validationErrors.required }}
              render={({ field: { onChange, value = [], ref } }) => (
                <Select
                  ref={ref}
                  value={value || values?.eOpeningFor}
                  options={OPENING_IN_JOB}
                  className={`react-select ${errors?.eOpeningFor && 'error'}`}
                  classNamePrefix="select"
                  isSearchable={false}
                  onChange={(e) => {
                    onChange(e)
                  }}
                  isDisabled={type === 'detail-job'}
                />
              )}
            />
            {errors.eOpeningFor && <Form.Control.Feedback type="invalid">{errors.eOpeningFor.message}</Form.Control.Feedback>}
          </Form.Group>
        </Col>
        <Col md="8">
          <Row>
            <Col sm="4">
              <Form.Group className="form-group">
                <Form.Label>
                  <FormattedMessage id="experienceRequired" />*
                </Form.Label>
                <div className="d-flex">
                  <div>
                    <Form.Control
                      type="number"
                      step="0.1"
                      name="fExperienceFrom"
                      className={errors.fExperienceFrom && 'error'}
                      onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                      {...register('fExperienceFrom', {
                        required: validationErrors.required,
                        pattern: { value: NO_MINUS_NEGATIVE, message: validationErrors.noNegative },
                        maxLength: { value: 5, message: validationErrors.rangeLength(1, 5) },
                        minLength: { value: 1, message: validationErrors.rangeLength(1, 5) }
                      })}
                      disabled={type === 'detail-job'}
                    />
                    {errors.fExperienceFrom && (
                      <Form.Control.Feedback type="invalid">{errors.fExperienceFrom.message}</Form.Control.Feedback>
                    )}
                  </div>
                  <div className="mx-3 my-2">{useIntl().formatMessage({ id: 'to' })}</div>
                  <div>
                    <Form.Control
                      type="number"
                      step="0.1"
                      name="fExperienceTo"
                      className={errors.fExperienceTo && 'error'}
                      onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                      {...register('fExperienceTo', {
                        required: validationErrors.required,
                        pattern: { value: NO_NEGATIVE, message: validationErrors.noNegative },
                        maxLength: { value: 5, message: validationErrors.rangeLength(1, 5) },
                        minLength: { value: 1, message: validationErrors.rangeLength(1, 5) },
                        min: { value: experienceMin, message: validationErrors.minLength(experienceMin) }
                      })}
                      disabled={type === 'detail-job'}
                    />
                    {errors.fExperienceTo && <Form.Control.Feedback type="invalid">{errors.fExperienceTo.message}</Form.Control.Feedback>}
                  </div>
                  <div className="mx-3 my-2"> {useIntl().formatMessage({ id: 'year' })}</div>
                </div>
              </Form.Group>
            </Col>
            <Col sm="4">
              <Form.Group className="form-group">
                <Form.Label>
                  <FormattedMessage id="salary" />
                </Form.Label>
                <div className="d-flex">
                  <div>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="fSalaryFrom"
                      className={errors.fSalaryFrom && 'error'}
                      onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                      {...register('fSalaryFrom', {
                        pattern: { value: NO_NEGATIVE, message: validationErrors.noNegative },
                        maxLength: { value: 12, message: validationErrors.maxLength(12) }
                      })}
                      disabled={type === 'detail-job'}
                    />
                    {errors.fSalaryFrom && <Form.Control.Feedback type="invalid">{errors.fSalaryFrom.message}</Form.Control.Feedback>}
                  </div>
                  <div className="mx-3 my-2">{useIntl().formatMessage({ id: 'to' })}</div>
                  <div>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="fSalaryTo"
                      className={errors.fSalaryTo && 'error'}
                      onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                      {...register('fSalaryTo', {
                        pattern: { value: NO_NEGATIVE, message: validationErrors.noNegative },
                        maxLength: { value: 12, message: validationErrors.maxLength(12) },
                        min: { value: salaryMin, message: validationErrors.minLength(salaryMin) }
                      })}
                      disabled={type === 'detail-job'}
                    />
                    {errors.fSalaryTo && <Form.Control.Feedback type="invalid">{errors.fSalaryTo.message}</Form.Control.Feedback>}
                  </div>
                  <div className="mx-3 my-2"> {useIntl().formatMessage({ id: 'lpa' })}</div>
                </div>
              </Form.Group>
            </Col>
            <Col sm="4">
              <Form.Group className="form-group">
                <Form.Label className="d-flex justify-content-between">
                  <div>
                    <FormattedMessage id="openPositions" />*
                  </div>
                  <div className="text-muted text-capitalize">({useIntl().formatMessage({ id: 'onlyNumbers' })})</div>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="nOpenPositions"
                  className={errors.nOpenPositions && 'error'}
                  onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                  {...register('nOpenPositions', {
                    required: validationErrors.required,
                    pattern: { value: NO_NEGATIVE, message: validationErrors.noNegative },
                    maxLength: { value: 4, message: validationErrors.maxLength(4) }
                  })}
                  disabled={type === 'detail-job'}
                />
                {errors.nOpenPositions && <Form.Control.Feedback type="invalid">{errors.nOpenPositions.message}</Form.Control.Feedback>}
              </Form.Group>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  )
}
AddEditJobPost.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  control: PropTypes.object,
  watch: PropTypes.func,
  values: PropTypes.object,
  setValue: PropTypes.func,
  nameChanged: PropTypes.func
}

export default AddEditJobPost
