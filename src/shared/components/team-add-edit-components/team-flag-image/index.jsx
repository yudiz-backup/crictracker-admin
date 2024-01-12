import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'

import ArticleTab from 'shared/components/article-tab'
import { S3_PREFIX } from 'shared/constants'

function TeamFlagImage({ register, setValue, onDelete, articleData, disabled, values, errors }) {
  const [image, setImage] = useState()
  // const [isThumbnailVisible, setIsThumbnailVisible] = useState(false)

  // function handleThumbnail(e) {
  //   setIsThumbnailVisible(!isThumbnailVisible)
  // }

  useEffect(() => {
    if (articleData) {
      if (!values?.oImg?.fSUrl?.length && articleData?.oImg?.sUrl) setImage(`${S3_PREFIX}${articleData.oImg.sUrl}`)
      // articleData.oTImg && setIsThumbnailVisible(true)
    }
  }, [articleData])
  return (
    <>
      <ArticleTab title={useIntl().formatMessage({ id: 'teamFlagImage' })} event={1}>
        <div className="f-image d-flex align-items-center justify-content-center">
          <input type="hidden" name="oImg.sUrl" />
          <input type="file" name="oImg.fSUrl" id="featureImg" hidden disabled={disabled} />
          {image && <img src={image} alt="Featured Image" />}
          {!image && (
            <div>
              <label htmlFor="featureImg" className={disabled ? 'disabled' : ''}>
                <i className="icon-upload" />
                <FormattedMessage id="uploadImage" />
              </label>
              {/* FOR PHASE 2 */}
              {/* <span className="or d-block">
                <FormattedMessage id="or" />
              </span>
              <Button size="sm" variant="primary" disabled={disabled}>
                <FormattedMessage id="mediaGallery" />
              </Button> */}
            </div>
          )}
        </div>
        {image && (
          <div className="change-img-btn">
            <Button variant="outline-secondary" disabled={disabled} size="sm">
              <FormattedMessage id="deleteImage" />
            </Button>
            {/* FOR PHASE 2 */}
            {/* <Button variant="outline-secondary" disabled={disabled} size="sm">
              <FormattedMessage id="photoEditor" />
            </Button>
            <Button variant="outline-secondary" disabled={disabled} size="sm">
              <FormattedMessage id="clearFocusPoint" />
            </Button> */}
            <label className={`btn btn-outline-secondary btn-sm ${disabled ? 'disabled' : ''}`} htmlFor="featureImg">
              <FormattedMessage id="replaceImage" />
            </label>
          </div>
        )}
        {errors?.oImg?.fSUrl && <Form.Control.Feedback type="invalid">{errors?.oImg?.fSUrl.message}</Form.Control.Feedback>}
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="altText" />
          </Form.Label>
          <Form.Control type="text" name="oImg.sText" className={errors?.oImg?.sText && 'error'} disabled={disabled} />
          {errors?.oImg?.sText && <Form.Control.Feedback type="invalid">{errors?.oImg?.sText.message}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="caption" />
          </Form.Label>
          <Form.Control as="textarea" name="oImg.sCaption" className={errors?.oImg?.sCaption && 'error'} disabled={disabled} />
          {errors?.oImg?.sCaption && <Form.Control.Feedback type="invalid">{errors?.oImg?.sCaption.message}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="attribution" />
          </Form.Label>
          <Form.Control as="textarea" name="oImg.sAttribution" className={errors?.oImg?.sAttribute && 'error'} disabled={disabled} />
          {errors?.oImg?.sAttribute && <Form.Control.Feedback type="invalid">{errors?.oImg?.sAttribute.message}</Form.Control.Feedback>}
        </Form.Group>
      </ArticleTab>
    </>
  )
}
TeamFlagImage.propTypes = {
  register: PropTypes.func,
  setValue: PropTypes.func,
  onDelete: PropTypes.func,
  articleData: PropTypes.object,
  values: PropTypes.object,
  errors: PropTypes.object,
  disabled: PropTypes.bool
}
export default TeamFlagImage
