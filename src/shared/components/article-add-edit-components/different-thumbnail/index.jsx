import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'

import ArticleTab from 'shared/components/article-tab'
import { getImgURL } from 'shared/utils'
import MediaGallery from 'shared/components/media-gallery'
import { S3_PREFIX } from 'shared/constants'
import useModal from 'shared/hooks/useModal'
// import { validationErrors } from 'shared/constants/ValidationErrors'

function DifferentThumbnail({ register, setValue, onDelete, articleData, disabled, values, errors, clearErrors }) {
  const [image, setImage] = useState()
  const { isShowing, toggle } = useModal()
  const [imageSUrl, setImageSUrl] = useState()

  function deleteImg() {
    setImage('')
    setValue('oTImg.sUrl', '')
    onDelete('oTImg')
  }

  useEffect(() => {
    if (articleData && articleData?.oTImg?.sUrl) setImage(getImgURL(articleData.oTImg.sUrl))
  }, [articleData])

  const imageUrl = (data) => {
    setImageSUrl(data?.sUrl)
  }

  const handleData = (data) => {
    setValue('oTImg.sText', data.sText)
    setValue('oTImg.sCaption', data.sCaption)
    setValue('oTImg.sAttribute', data.sAttribute)
    setValue('oTImg.sUrl', imageSUrl)
    setImage(S3_PREFIX + imageSUrl)
    toggle()
  }

  return (
    <>
      <ArticleTab title={useIntl().formatMessage({ id: 'differentThumbnail' })} event={1}>
        <div className="f-image d-flex align-items-center justify-content-center">
          <input type="hidden" name="oTImg.sUrl" {...register('oTImg.sUrl')} />
          {image && <img src={image} alt="Different Thumbnail" />}
          {!image && (
            <div>
              {/* <label htmlFor="DifferentThumbnail" className={disabled ? 'disabled' : ''}>
                <i className="icon-upload" />
                <FormattedMessage id="uploadImage" />
              </label>
              <span className="or d-block">
                <FormattedMessage id="or" />
              </span> */}
              <Button size="sm" variant="primary" disabled={disabled} onClick={() => toggle()}>
                <FormattedMessage id="mediaGallery" />
              </Button>
            </div>
          )}
          <MediaGallery show={isShowing} overRidePermission handleHide={toggle} handleData={handleData} imageUrl={imageUrl} />
        </div>
        {image && (
          <div className="change-img-btn">
            <Button variant="outline-secondary" size="sm" onClick={deleteImg} disabled={disabled}>
              <FormattedMessage id="deleteImage" />
            </Button>
            {/* FOR PHASE 2 */}
            {/* <Button variant="outline-secondary" size="sm" disabled={disabled}>
              <FormattedMessage id="photoEditor" />
            </Button>
            <Button variant="outline-secondary" size="sm" disabled={disabled}>
              <FormattedMessage id="clearFocusPoint" />
            </Button> */}
            <label className={`btn btn-outline-secondary btn-sm ${disabled ? 'disabled' : ''}`} onClick={() => toggle()}>
              <FormattedMessage id="replaceImage" />
            </label>
          </div>
        )}
        {errors?.oTImg?.fSUrl && <Form.Control.Feedback type="invalid">{errors?.oTImg?.fSUrl.message}</Form.Control.Feedback>}
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="altText" />
          </Form.Label>
          <Form.Control
            type="text"
            name="oTImg.sText"
            className={errors?.oTImg?.sText && 'error'}
            {...register('oTImg.sText')}
            disabled={disabled}
          />
          {errors?.oTImg?.sText && <Form.Control.Feedback type="invalid">{errors?.oTImg?.sText.message}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="caption" />
          </Form.Label>
          <Form.Control
            as="textarea"
            name="oTImg.sCaption"
            className={errors?.oTImg?.sCaption && 'error'}
            {...register('oTImg.sCaption')}
            disabled={disabled}
          />
          {errors?.oTImg?.sCaption && <Form.Control.Feedback type="invalid">{errors?.oTImg?.sCaption.message}</Form.Control.Feedback>}
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="attribution" />
          </Form.Label>
          <Form.Control
            as="textarea"
            name="oTImg.sAttribute"
            className={errors?.oTImg?.sAttribute && 'error'}
            {...register('oTImg.sAttribute')}
            disabled={disabled}
          />
          {errors?.oTImg?.sAttribute && <Form.Control.Feedback type="invalid">{errors?.oTImg?.sAttribute.message}</Form.Control.Feedback>}
        </Form.Group>
      </ArticleTab>
    </>
  )
}
DifferentThumbnail.propTypes = {
  register: PropTypes.func,
  setValue: PropTypes.func,
  onDelete: PropTypes.func,
  articleData: PropTypes.object,
  values: PropTypes.object,
  errors: PropTypes.object,
  disabled: PropTypes.bool,
  clearErrors: PropTypes.func
}
export default DifferentThumbnail
