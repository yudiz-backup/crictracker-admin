import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'

import ArticleTab from 'shared/components/article-tab'
import CommonInput from 'shared/components/common-input'
import { ONLY_NUMBER } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'

function ArticleViewCount({ errors, register, disabled }) {
  return (
    <ArticleTab title={useIntl().formatMessage({ id: 'viewCount' })}>
      <CommonInput
        register={register}
        type="text"
        errors={errors}
        className={`form-control ${errors?.sEditorNotes && 'error'}`}
        name="nViewCount"
        label="addViewCount"
        disabled={disabled}
        validation={{ pattern: { value: ONLY_NUMBER, message: validationErrors.number } }}
      />
    </ArticleTab>
  )
}
ArticleViewCount.propTypes = {
  register: PropTypes.func,
  setValue: PropTypes.func,
  errors: PropTypes.object,
  disabled: PropTypes.bool
}
export default ArticleViewCount
