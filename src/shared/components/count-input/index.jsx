import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'

function CountInput({ label, textarea, name, error, maxWord, register, currentLength, disabled, onBlur, ...rest }) {
  const [count, setCount] = useState(0)
  const [current, setCurrent] = useState()
  const splitName = name.split('.')

  function handleChange(e) {
    setCount(e.target.value.length)
    setCurrent(0)
  }
  useEffect(() => {
    currentLength ? setCurrent(currentLength) : setCurrent(0)
  }, [currentLength])

  function showError() {
    if (error) {
      if (error[name]) return true
      if (splitName?.length === 2 && error[splitName[0]] && error[splitName[0]][splitName[1]]) return true
      if (error[splitName[0]] && error[splitName[0]][splitName[1]] && error[splitName[0]][splitName[1]][splitName[2]]) return true
    }
    return false
  }

  return (
    <Form.Group className="form-group">
      <Form.Label>
        {label}{' '}
        {maxWord && (
          <span>
            {count || current}/{maxWord}
          </span>
        )}
      </Form.Label>
      <Form.Control
        as={textarea ? 'textarea' : 'input'}
        row={5}
        type="text"
        {...register}
        onChange={(e) => {
          handleChange(e)
          register.onChange(e)
        }}
        name={name}
        className={showError() && 'error'}
        disabled={disabled}
        {...rest}
        onBlur={(e) => {
          e.target.value = e?.target?.value.trim()
          onBlur && onBlur(e)
          register.onChange(e)
        }}
      />
      {splitName.length > 1 && error && error[splitName[0]] && error[splitName[0]][splitName[1]] && (
        <Form.Control.Feedback type="invalid">{error[splitName[0]][splitName[1]].message}</Form.Control.Feedback>
      )}
      {splitName.length > 2 &&
        error &&
        error[splitName[0]] &&
        error[splitName[0]][splitName[1]] &&
        error[splitName[0]][splitName[1]][splitName[2]] && (
          <Form.Control.Feedback type="invalid">{error[splitName[0]][splitName[1]][splitName[2]].message}</Form.Control.Feedback>
      )}
      {error && error[name] && <Form.Control.Feedback type="invalid">{error[name].message}</Form.Control.Feedback>}
    </Form.Group>
  )
}
CountInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  textarea: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.object,
  maxWord: PropTypes.number,
  currentLength: PropTypes.number,
  register: PropTypes.any,
  onBlur: PropTypes.func
}
export default CountInput
