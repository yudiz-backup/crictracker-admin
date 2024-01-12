import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'

import ArticleTab from 'shared/components/article-tab'
import CommonInput from 'shared/components/common-input'

function EditorNotes({ errors, register, setValue, disabled }) {
  function handleClear() {
    setValue('sEditorNotes', '')
  }
  return (
    <ArticleTab title="Editor Notes">
      <CommonInput
        placeholder={useIntl().formatMessage({ id: 'writeHere' })}
        type="textarea"
        register={register}
        errors={errors}
        className={`form-control ${errors?.sEditorNotes && 'error'}`}
        name="sEditorNotes"
        label="addNotes"
        disabled={disabled}
      />
      <div>
        <Button onClick={handleClear} size="sm" variant="outline-secondary" className="square" disabled={disabled}>
          <FormattedMessage id="clear" />
        </Button>
      </div>
    </ArticleTab>
  )
}
EditorNotes.propTypes = {
  register: PropTypes.func,
  setValue: PropTypes.func,
  errors: PropTypes.object,
  disabled: PropTypes.bool
}
export default EditorNotes
