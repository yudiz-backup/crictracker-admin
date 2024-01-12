import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Form } from 'react-bootstrap'

import { URL_PREFIX } from 'shared/constants'
import CommonInput from '../common-input'
import { GENERATE_SLUG } from 'graph-ql/generate-slug/query'
import { useLazyQuery } from '@apollo/client'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { FormattedMessage, useIntl } from 'react-intl'
import TinyEditor from 'shared/components/editor'
import CountInput from '../count-input'

function AddEditSeriesSeo({ defaultSlug, register, errors, slugType, control, disabled, setValue, setError, values }) {
  const [slug, setSlug] = useState()
  const [availableSlug, setAvailableSlug] = useState()

  const [generateSlugs] = useLazyQuery(GENERATE_SLUG, {
    onCompleted: (data) => {
      if (data?.generateSlugs?.oData) {
        if (data.generateSlugs.oData.bIsExists) {
          setValue('customSlug', data.generateSlugs.oData.sSlug)
          setAvailableSlug(data.generateSlugs.oData.sSlug)
          setError('customSlug', { type: 'manual', message: validationErrors.notAvailable })
        }
        if (!data.generateSlugs.oData.bIsExists && !data.generateSlugs.oData.sSlug) {
          setValue('customSlug', slug)
          setAvailableSlug('')
        }
      }
    }
  })

  function handleBlur(e) {
    setSlug(e?.target?.value)
    if (e?.target?.value !== defaultSlug) {
      generateSlugs({ variables: { eType: slugType, sSlug: e?.target?.value } })
    }
  }

  return (
    <>
      <Row>
        <Col sm="12">
          <CommonInput
            type="text"
            register={register}
            urlPrifix={URL_PREFIX}
            errors={errors}
            onBlur={handleBlur}
            className={errors?.customSlug && 'error'}
            // validation={{ pattern: { value: CUSTOM_URL_WITH_SLASH, message: validationErrors.customURL } }}
            name="customSlug"
            disabled={disabled}
            altTextLabel="suggestedSlug"
            availableSlug={availableSlug}
            label="slug"
            required
          />
        </Col>
        <CountInput
          maxWord={150}
          currentLength={values?.sDTitle?.length}
          label={useIntl().formatMessage({ id: 'title' })}
          name="oSeo.sDTitle"
          error={errors}
          register={register('oSeo.sDTitle', { maxLength: { value: 150, message: validationErrors.maxLength(150) } })}
        />
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="content" />
          </Form.Label>
          <TinyEditor
            className={`form-control ${errors.sContent && 'error'}`}
            name="oSeo.sContent"
            control={control}
            onlyTextFormatting
          />
          {errors.sContent && <Form.Control.Feedback type="invalid">{errors.sContent.message}</Form.Control.Feedback>}
        </Form.Group>
      </Row>
    </>
  )
}
AddEditSeriesSeo.propTypes = {
  register: PropTypes.func,
  defaultSlug: PropTypes.string,
  errors: PropTypes.object,
  getSeoBySlug: PropTypes.func,
  control: PropTypes.any,
  setValue: PropTypes.func,
  setError: PropTypes.func,
  slugType: PropTypes.string,
  categoryURL: PropTypes.string,
  values: PropTypes.object,
  disabled: PropTypes.bool
}

export default AddEditSeriesSeo
