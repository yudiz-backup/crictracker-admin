import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import { useParams } from 'react-router-dom'

import ArticleTab from 'shared/components/article-tab'
import { getAdvanceFeature } from 'shared/utils'

function AdvancedFeatures({ register, disabled, isFantasy }) {
  const { id } = useParams()

  return (
    <ArticleTab title="Advanced Features">
      {getAdvanceFeature(id, isFantasy).map((item) => {
        return (
          <Form.Check
            key={item.value}
            type="checkbox"
            className="ms-0"
            name={item.value}
            label={item.label}
            defaultChecked={item.defaultChecked}
            id={item.value}
            {...register(`oAdvanceFeature.${item.value}`)}
            disabled={disabled}
          />
        )
      })}
    </ArticleTab>
  )
}
AdvancedFeatures.propTypes = {
  register: PropTypes.func,
  disabled: PropTypes.bool,
  isFantasy: PropTypes.bool
}
export default AdvancedFeatures
