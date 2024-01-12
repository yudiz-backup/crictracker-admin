import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Col, Form, Button, Row } from 'react-bootstrap'
import { Controller, useFieldArray, useWatch } from 'react-hook-form'
import Select from 'react-select'

import ArticleTab from 'shared/components/article-tab'
import { FormattedMessage, useIntl } from 'react-intl'
import { E_CVC } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'

function CaptainsSelection({ control, register, errors, players, disabled, setValue }) {
  const [selectedItem, setSelected] = useState([])
  const [isDescriptionOpen, setDescription] = useState(false)
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'aCVCFan'
  })

  const values = useWatch({
    control,
    name: 'aCVCFan'
  })
  const avoidPlayer = useWatch({
    control,
    name: 'aAvoidPlayerFan'
  })

  function createCVCField(value) {
    return {
      eType: value,
      iPlayerFanId: value,
      sDescription: value
    }
  }

  function addMoreCVC() {
    append(createCVCField(''))
  }

  function copyCVC(i) {
    const data = values[i]
    data.iPlayerFanId = ''
    append(data)
  }

  function removeCVC(i) {
    remove(i)
  }

  function handleChange() {
    const data = [...values, ...avoidPlayer]
    setSelected(data.map((e) => e.iPlayerFanId?._id))
  }

  useEffect(() => {
    if (values?.length && avoidPlayer?.length) {
      values[0]?.sDescription && setDescription(true)
      handleChange()
    }
  }, [values, avoidPlayer])

  return (
    <div className="mb-4 big-title">
      <ArticleTab title={useIntl().formatMessage({ id: 'captainsSelection' })}>
        <Form.Check
          type="checkbox"
          label={useIntl().formatMessage({ id: 'addDescription' })}
          id="descriptions"
          value={isDescriptionOpen}
          onChange={() => setDescription(!isDescriptionOpen)}
          disabled={disabled}
        />
        {fields.map((e, i) => {
          return (
            <div className="inner-box" key={e.id}>
              <div className="right-btn">
                {fields.length < 3 && (
                  <>
                    {i + 1 === fields.length && (
                      <Button onClick={addMoreCVC} disabled={disabled} variant="link" size="sm" className="square icon-btn">
                        <i className="icon-add d-block" />
                      </Button>
                    )}
                    <Button onClick={() => copyCVC(i)} disabled={disabled} variant="link" size="sm" className="square icon-btn">
                      <i className="icon-copy d-block" />
                    </Button>
                  </>
                )}
                {fields.length !== 1 && (
                  <Button onClick={() => removeCVC(i)} disabled={disabled} variant="link" size="sm" className="square icon-btn">
                    <i className="icon-delete d-block" />
                  </Button>
                )}
              </div>
              <Row>
                <Col md="6">
                  <Form.Group className={`form-group ${!isDescriptionOpen && 'mb-0'}`}>
                    <Form.Label>
                      <FormattedMessage id="type" />*
                    </Form.Label>
                    <Controller
                      name={`aCVCFan[${i}].eType`}
                      control={control}
                      rules={{ required: validationErrors.required }}
                      render={({ field: { onChange, value = [], ref } }) => (
                        <Select
                          ref={ref}
                          value={value || values[i]?.eType}
                          options={E_CVC}
                          className={`react-select ${errors?.aCVCFan && errors?.aCVCFan[i]?.eType && 'error'}`}
                          classNamePrefix="select"
                          isDisabled={disabled}
                          onChange={(e) => {
                            onChange(e)
                          }}
                        />
                      )}
                    />
                    {errors?.aCVCFan && errors?.aCVCFan[i]?.eType && (
                      <Form.Control.Feedback type="invalid">{errors?.aCVCFan[i]?.eType.message}</Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
                <Col md="6">
                  <Form.Group className={`form-group ${!isDescriptionOpen && 'mb-0'}`}>
                    <Form.Label>
                      <FormattedMessage id="selectPlayer" />*
                    </Form.Label>
                    <Controller
                      name={`aCVCFan[${i}].iPlayerFanId`}
                      control={control}
                      rules={{ required: validationErrors.required }}
                      render={({ field: { onChange, value = [], ref } }) => (
                        <Select
                          ref={ref}
                          value={value || values[i]?.iPlayerFanId}
                          options={players.map((s) => (selectedItem.includes(s?._id) ? { ...s, isDisabled: true } : s))}
                          getOptionLabel={(option) => option?.oPlayer?.sFirstName}
                          getOptionValue={(option) => option?._id}
                          isSearchable
                          className={`react-select ${errors?.aCVCFan && errors?.aCVCFan[i]?.iPlayerFanId && 'error'}`}
                          classNamePrefix="select"
                          isDisabled={disabled}
                          onChange={(e) => {
                            onChange(e)
                          }}
                        />
                      )}
                    />
                    {errors?.aCVCFan && errors?.aCVCFan[i]?.iPlayerFanId && (
                      <Form.Control.Feedback type="invalid">{errors?.aCVCFan[i]?.iPlayerFanId.message}</Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
              </Row>
              {isDescriptionOpen && (
                <Form.Group className="form-group mb-0">
                  <Form.Label>
                    <FormattedMessage id="description" />*
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    className={errors?.aCVCFan && errors?.aCVCFan[i]?.sDescription && 'error'}
                    disabled={disabled}
                    {...register(`aCVCFan[${i}].sDescription`, { required: validationErrors.required })}
                  />
                  {errors?.aCVCFan && errors?.aCVCFan[i]?.sDescription && (
                    <Form.Control.Feedback type="invalid">{errors?.aCVCFan[i]?.sDescription.message}</Form.Control.Feedback>
                  )}
                </Form.Group>
              )}
            </div>
          )
        })}
      </ArticleTab>
    </div>
  )
}
CaptainsSelection.propTypes = {
  control: PropTypes.object,
  errors: PropTypes.object,
  register: PropTypes.func,
  players: PropTypes.array,
  disabled: PropTypes.bool,
  setValue: PropTypes.func
}
export default CaptainsSelection
