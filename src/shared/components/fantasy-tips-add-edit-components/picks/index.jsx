import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Button } from 'react-bootstrap'
import { Controller, useFieldArray, useWatch } from 'react-hook-form'
import Select from 'react-select'
import { FormattedMessage, useIntl } from 'react-intl'

import ArticleTab from 'shared/components/article-tab'
import { validationErrors } from 'shared/constants/ValidationErrors'

function Picks({ control, register, errors, fieldName, title, isRequired, players, disabled, setValue }) {
  const [selectedItem, setSelected] = useState([])
  const [isDescriptionOpen, setDescription] = useState(false)
  const [validation, setValidation] = useState([createField(isRequired ? validationErrors.required : false)])
  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldName
  })
  const values = useWatch({
    control,
    name: fieldName
  })
  const avoidPlayer = useWatch({
    control,
    name: 'aAvoidPlayerFan'
  })

  function createField(value) {
    return {
      iPlayerFanId: value,
      sDescription: value
    }
  }

  function add() {
    setValidation([...validation, createField(isRequired ? validationErrors.required : false)])
    append(createField(''))
  }

  function copy(i) {
    setValidation([...validation, createField(isRequired ? validationErrors.required : false)])
    const data = values[i]
    data.iPlayerFanId = ''
    append(values[i])
  }

  function deleteItem(i) {
    remove(i)
    validation.splice(i, 1)
    setValidation(validation)
  }

  function handleChange() {
    const data = fieldName === 'aAvoidPlayerFan' ? values : [...values, ...avoidPlayer]
    setSelected(data.map((e) => e?.iPlayerFanId?._id))
  }

  useEffect(() => {
    if (values?.length && avoidPlayer?.length) {
      values[0]?.sDescription && setDescription(true)
      handleChange()
    }
  }, [values, avoidPlayer])

  return (
    <div className="mb-4 big-title">
      <ArticleTab title={title}>
        <Form.Check
          type="checkbox"
          label={useIntl().formatMessage({ id: 'addDescription' })}
          id={fieldName}
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
                      <Button onClick={add} disabled={disabled} variant="link" size="sm" className="square icon-btn">
                        <i className="icon-add d-block" />
                      </Button>
                    )}
                    <Button onClick={() => copy(i)} disabled={disabled} variant="link" size="sm" className="square icon-btn">
                      <i className="icon-copy d-block" />
                    </Button>
                  </>
                )}
                {fields.length !== 1 && (
                  <Button onClick={() => deleteItem(i)} disabled={disabled} variant="link" size="sm" className="square icon-btn">
                    <i className="icon-delete d-block" />
                  </Button>
                )}
              </div>
              <Form.Group className={`form-group ${!isDescriptionOpen && 'mb-0'}`}>
                <Form.Label>
                  <FormattedMessage id="selectPlayer" />
                  {isRequired && '*'}
                </Form.Label>
                <Controller
                  name={`${fieldName}[${i}].iPlayerFanId`}
                  control={control}
                  rules={{ required: validation[i]?.iPlayerFanId }}
                  render={({ field: { onChange, value = [], ref } }) => (
                    <Select
                      ref={ref}
                      value={value || values[i]?.iPlayerFanId}
                      options={players.map((s) => (selectedItem.includes(s?._id) ? { ...s, isDisabled: true } : s))}
                      getOptionLabel={(option) => option?.oPlayer?.sFullName || option?.oPlayer?.sFirstName}
                      getOptionValue={(option) => option?._id}
                      isSearchable
                      className={`react-select ${
                        errors[fieldName] && errors[fieldName][i]?.iPlayerFanId && 'error'
                      } ${fieldName}[${i}].iPlayerFanId`}
                      classNamePrefix="select"
                      isDisabled={disabled}
                      onChange={(e) => {
                        onChange(e)
                      }}
                    />
                  )}
                />
                {errors[fieldName] && errors[fieldName][i]?.iPlayerFanId && (
                  <Form.Control.Feedback type="invalid">{errors[fieldName][i]?.iPlayerFanId.message}</Form.Control.Feedback>
                )}
              </Form.Group>
              {isDescriptionOpen && (
                <Form.Group className="form-group mb-0">
                  <Form.Label>
                    <FormattedMessage id="description" />
                    {isRequired && '*'}
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    disabled={disabled}
                    className={errors[fieldName] && errors[fieldName][i]?.sDescription && 'error'}
                    {...register(`${fieldName}[${i}].sDescription`, { required: validation[i]?.sDescription })}
                  />
                  {errors[fieldName] && errors[fieldName][i]?.sDescription && (
                    <Form.Control.Feedback type="invalid">{errors[fieldName][i]?.sDescription.message}</Form.Control.Feedback>
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
Picks.propTypes = {
  control: PropTypes.object,
  errors: PropTypes.object,
  register: PropTypes.func,
  fieldName: PropTypes.string,
  title: PropTypes.string,
  isRequired: PropTypes.bool,
  players: PropTypes.array,
  disabled: PropTypes.bool,
  setValue: PropTypes.func
}
export default Picks
