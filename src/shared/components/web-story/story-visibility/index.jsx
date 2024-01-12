import React from 'react'
import PropTypes from 'prop-types'
import { Controller, useWatch } from 'react-hook-form'
import Select from 'react-select'
import { STORY_VISIBILITY } from 'shared/constants'

function StoryVisibility({ control, disabled }) {
  const values = useWatch({
    control,
    name: 'eVisibility'
  })
  return (
  <>
  <Controller
      name="eVisibility"
      control={control}
      render={({ field: { onChange, value = [] } }) => (
        <Select
          value={value || values}
          options={STORY_VISIBILITY}
          className="react-select display-author on-hover"
          classNamePrefix="select"
          isSearchable={false}
          menuIsOpen
        //   isDisabled={disabled}
          onChange={(e) => {
            onChange(e)
          }}
        />
      )}
    />
  </>
  )
}

StoryVisibility.propTypes = {
  control: PropTypes.object,
  disabled: PropTypes.bool
}

export default StoryVisibility
