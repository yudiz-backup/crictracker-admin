import React from 'react'
import PropTypes from 'prop-types'
import { Form, InputGroup } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'

import { validationErrors } from 'shared/constants/ValidationErrors'
import ToolTip from 'shared/components/tooltip'

function CommonInput({
  type,
  errors,
  size,
  className,
  onChange,
  label,
  name,
  register,
  disabled,
  required,
  onBlur,
  placeholder,
  defaultValue,
  validation,
  style,
  altText,
  urlPrifix,
  categoryURL,
  availableSlug,
  displayClass,
  altTextLabel,
  children,
  toolTipText,
  inputGroupLeft,
  inputGroupRight
}) {
  const splitName = name.split('.')

  function applyValidation() {
    if (required) {
      return {
        required: validationErrors.required,
        maxLength: { value: 10000, message: validationErrors.maxLength(10000) },
        minLength: { value: 1, message: validationErrors.minLength(1) },
        onChange: (e) => { },
        ...validation
      }
    } else {
      return {
        maxLength: { value: 10000, message: validationErrors.maxLength(10000) },
        ...validation
      }
    }
  }

  function getNestedError(obj, keys) {
    return keys.reduce((acc, key) => {
      if (acc && acc[key]) {
        return acc[key]
      }
      return null
    }, obj)
  }

  const nestedError = getNestedError(errors, splitName)

  const setRegister = register(name, applyValidation())
  return (
    <Form.Group className={`form-group w-100 ${displayClass}`}>
      {label && (
        <Form.Label>
          {label && <FormattedMessage id={label} />}
          {label && required && '*'}
          {toolTipText && (
            <ToolTip toolTipMessage={<FormattedMessage id={toolTipText} />}>
              <i className="icon-info" />
            </ToolTip>
          )}
        </Form.Label>
      )}
      {(() => {
        if (urlPrifix || inputGroupLeft || inputGroupRight) {
          return (
            <InputGroup>
              {urlPrifix && (
                <InputGroup.Text>
                  {urlPrifix}
                  {categoryURL && categoryURL}
                </InputGroup.Text>
              )}
              {inputGroupLeft}
              <Form.Control
                as={type === 'text' ? 'input' : 'textarea'}
                name={name}
                size={size}
                className={className}
                disabled={disabled}
                defaultValue={defaultValue}
                style={style}
                placeholder={placeholder}
                {...setRegister}
                onChange={(e) => {
                  setRegister.onChange(e)
                  onChange && onChange(e)
                }}
                onBlur={(e) => {
                  e.target.value = e?.target?.value.trim()
                  onBlur && onBlur(e)
                  setRegister.onChange(e)
                }}
              />
              {inputGroupRight}
            </InputGroup>
          )
        } else {
          return (
            <Form.Control
              as={type === 'text' ? 'input' : 'textarea'}
              name={name}
              size={size}
              className={className}
              defaultValue={defaultValue}
              disabled={disabled}
              style={style}
              placeholder={placeholder}
              {...setRegister}
              onChange={(e) => {
                setRegister.onChange(e)
                onChange && onChange(e)
              }}
              onBlur={(e) => {
                e.target.value = e?.target?.value.trim()
                onBlur && onBlur(e)
                setRegister.onChange(e)
              }}
            />
          )
        }
      })()}
      {altText && (
        <Form.Text>
          <FormattedMessage id={altText} />
        </Form.Text>
      )}
      {availableSlug && (
        <Form.Text>
          <FormattedMessage id={altTextLabel} />: {availableSlug}
        </Form.Text>
      )}
      {splitName.length > 1 && errors && errors[splitName[0]] && errors[splitName[0]][splitName[1]] && (
        <Form.Control.Feedback type="invalid">{errors[splitName[0]][splitName[1]].message}</Form.Control.Feedback>
      )}

      {/* {splitName.length > 2 &&
        errors &&
        errors[splitName[0]] &&
        errors[splitName[0]][splitName[1]] &&
        errors[splitName[0]][splitName[1]][splitName[2]] && (
          <Form.Control.Feedback type="invalid">
            {errors[splitName[0]][splitName[1]][splitName[2]].message}
          </Form.Control.Feedback>
      )}
      {errors && errors[name] && <Form.Control.Feedback type="invalid">{errors[name].message}</Form.Control.Feedback>} */}
      {splitName.length > 2 && nestedError && <Form.Control.Feedback type="invalid">{nestedError.message}</Form.Control.Feedback>}
      {children}
    </Form.Group>
  )
}
CommonInput.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  size: PropTypes.string,
  categoryURL: PropTypes.string,
  altText: PropTypes.string,
  urlPrifix: PropTypes.string,
  toolTipText: PropTypes.string,
  displayClass: PropTypes.string,
  label: PropTypes.string,
  defaultValue: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  maxWord: PropTypes.number,
  register: PropTypes.func,
  children: PropTypes.node,
  onBlur: PropTypes.any,
  onChange: PropTypes.any,
  control: PropTypes.object,
  style: PropTypes.object,
  errors: PropTypes.object,
  className: PropTypes.any,
  availableSlug: PropTypes.string,
  altTextLabel: PropTypes.string,
  validation: PropTypes.object,
  inputGroupLeft: PropTypes.node,
  inputGroupRight: PropTypes.node
}
export default CommonInput
