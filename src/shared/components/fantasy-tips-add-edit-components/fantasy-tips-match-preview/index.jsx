import React from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'

import ArticleTab from 'shared/components/article-tab'
import TinyEditor from 'shared/components/editor'
import { useIntl } from 'react-intl'

function FantasyTipsMatchPreview({ control, disabled, articleData, errors, fieldName, required, title, useCommonMatchPreview }) {
  return (
    <div className="mb-4 big-title">
      <ArticleTab title={`${title} ${required ? '*' : ''}`}>
        {useCommonMatchPreview && (
          <Form.Check type="checkbox" label={useIntl().formatMessage({ id: 'useCommonMatchPreview' })} id="common" className="mb-3" />
        )}
        <Form.Group className="form-group">
          <TinyEditor
            className={'form-control'}
            name={fieldName}
            control={control}
            initialValue={articleData && articleData[fieldName]}
            required={required}
            disabled={disabled}
          />
          {errors[fieldName] && <Form.Control.Feedback type="invalid">{errors[fieldName].message}</Form.Control.Feedback>}
        </Form.Group>
        {/* <div className="change-img-btn mb-0">
          <Button variant="outline-secondary" size="sm">
            <i className="icon-visibility me-1" />
            <FormattedMessage id="poll" />
          </Button>
          <Button variant="outline-secondary" size="sm">
            <i className="icon-visibility me-1" />
            <FormattedMessage id="quiz" />
          </Button>
          <Button variant="outline-secondary" size="sm">
            <i className="icon-visibility me-1" />
            <FormattedMessage id="subscribe" />
          </Button>
          <Button variant="outline-secondary" size="sm">
            <i className="icon-visibility me-1" />
            <FormattedMessage id="alsoRead" />
          </Button>
        </div> */}
      </ArticleTab>
    </div>
  )
}
FantasyTipsMatchPreview.propTypes = {
  control: PropTypes.object,
  articleData: PropTypes.object,
  errors: PropTypes.object,
  disabled: PropTypes.bool,
  fieldName: PropTypes.string,
  title: PropTypes.string,
  required: PropTypes.bool,
  useCommonMatchPreview: PropTypes.bool
}
export default FantasyTipsMatchPreview
