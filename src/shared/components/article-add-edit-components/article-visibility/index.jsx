import React from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import { Controller, useWatch } from 'react-hook-form'
import { ARTICLE_VISIBILITY } from 'shared/constants'

function Visibility({ control, disabled }) {
  const values = useWatch({
    control,
    name: 'eVisibility'
  })
  return (
    <Controller
      name="eVisibility"
      control={control}
      render={({ field: { onChange, value = [] } }) => (
        <Select
          value={value || values}
          options={ARTICLE_VISIBILITY}
          className="react-select display-author on-hover"
          classNamePrefix="select"
          isSearchable={false}
          menuIsOpen
          isDisabled={disabled}
          onChange={(e) => {
            onChange(e)
          }}
        />
      )}
    />
  )
}
Visibility.propTypes = {
  disabled: PropTypes.bool,
  control: PropTypes.object
}
export default Visibility
