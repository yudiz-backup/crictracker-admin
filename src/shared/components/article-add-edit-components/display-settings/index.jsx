import React from 'react'
import { Form } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'

import ArticleTab from 'shared/components/article-tab'

function DisplaySettings({ register, disabled }) {
  return (
    <ArticleTab title="Display Settings">
      {/* <Form.Check type="checkbox"
        className="ms-0"
        name="bCategory"
        label={useIntl().formatMessage({ id: 'showInFeaturedPostOnHomePage' })}
        {...register('oSticky.bCategory')}
        id="bCategory"
      /> */}
      <Form.Check
        type="checkbox"
        className="ms-0"
        name="bHome"
        {...register('oSticky.bHome')}
        label={useIntl().formatMessage({ id: 'makeStickyArticle' })}
        id="bHome"
      />
      {/* <Form.Check
        type="checkbox"
        className="ms-0 mb-0"
        name="bHomeCategory"
        {...register('oSticky.bHomeCategory')}
        label={useIntl().formatMessage({ id: 'makeStickyOnCategoryDetailPage' })}
        id="bHomeCategory"
      /> */}
    </ArticleTab>
  )
}

DisplaySettings.propTypes = {
  register: PropTypes.func,
  disabled: PropTypes.bool
}

export default DisplaySettings
