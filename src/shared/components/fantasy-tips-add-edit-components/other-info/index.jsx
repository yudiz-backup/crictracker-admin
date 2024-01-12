import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'

import ArticleTab from 'shared/components/article-tab'
import CommonInput from 'shared/components/common-input'

function OtherInfo({ register, errors, disabled }) {
  return (
    <div className="mb-4 big-title">
      <ArticleTab title={useIntl().formatMessage({ id: 'otherInfo' })}>
        <CommonInput
          type="textarea"
          register={register}
          disabled={disabled}
          errors={errors}
          className={errors?.oOtherInfo?.sExpertAdvice && 'error'}
          name="oOtherInfo.sExpertAdvice"
          label="expertAdvice"
          placeholder={useIntl().formatMessage({ id: 'writeHere' })}
        />
        {/* <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="note" />
          </Form.Label>
          <Form.Control as="textarea" name="sNote" placeholder={useIntl().formatMessage({ id: 'writeHere' })} />
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="disclaimer" />
          </Form.Label>
          <Form.Control as="textarea" name="sDisclaimer" placeholder={useIntl().formatMessage({ id: 'writeHere' })} />
        </Form.Group> */}
      </ArticleTab>
    </div>
  )
}
OtherInfo.propTypes = {
  errors: PropTypes.object,
  register: PropTypes.func,
  disabled: PropTypes.bool
}
export default OtherInfo
