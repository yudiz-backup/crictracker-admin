import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import ArticleTab from 'shared/components/article-tab'
import DifferentThumbnail from '../different-thumbnail'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { removeTypeName, getImgURL } from 'shared/utils'
import MediaGallery from 'shared/components/media-gallery'
import { S3_PREFIX } from 'shared/constants'
import useModal from 'shared/hooks/useModal'
import CommonInput from 'shared/components/common-input'

function FeaturedImage({ register, setValue, onDelete, articleData, disabled, values, errors, clearErrors }) {
  const [image, setImage] = useState()
  const [isThumbnailVisible, setIsThumbnailVisible] = useState(false)
  const { isShowing, toggle } = useModal()
  const [imageSUrl, setImageSUrl] = useState()

  function handleThumbnail(e) {
    setIsThumbnailVisible(!isThumbnailVisible)
  }

  function deleteImg() {
    setImage('')
    setValue('oImg.sUrl', '')
    onDelete('oImg')
  }

  useEffect(() => {
    if (articleData) {
      if (articleData?.oImg?.sUrl) setImage(getImgURL(articleData.oImg.sUrl))
      if (articleData.oTImg) {
        !Object.values(removeTypeName(articleData.oTImg)).every((x) => x === null || x === '') && setIsThumbnailVisible(true)
      }
    }
  }, [articleData])

  const imageUrl = (data) => {
    setImageSUrl(data?.sUrl)
  }

  const handleData = (data) => {
    setValue('oImg.sText', data.sText)
    setValue('oImg.sCaption', data.sCaption)
    setValue('oImg.sAttribute', data.sAttribute)
    setValue('oImg.sUrl', imageSUrl)
    clearErrors('oImg.sUrl')
    setImage(S3_PREFIX + imageSUrl)
    toggle()
  }

  return (
    <>
      <ArticleTab title={useIntl().formatMessage({ id: 'featuredImage' })} event={1}>
        <div className="f-image d-flex align-items-center justify-content-center">
          <input type="hidden" name="oImg.sUrl" {...register('oImg.sUrl', { required: validationErrors.required })} />
          {image && <img src={image} alt="Featured Image" />}
          {!image && (
            <div>
              <Button size="sm" variant="primary" disabled={disabled} onClick={() => toggle()}>
                <FormattedMessage id="mediaGallery" />
              </Button>
            </div>
          )}
          <MediaGallery show={isShowing} overRidePermission handleHide={toggle} handleData={handleData} imageUrl={imageUrl} />
        </div>
        {image && (
          <div className="change-img-btn">
            <Button variant="outline-secondary" disabled={disabled} size="sm" onClick={deleteImg}>
              <FormattedMessage id="deleteImage" />
            </Button>
            {/* FOR PHASE 2 */}
            {/* <Button variant="outline-secondary" disabled={disabled} size="sm">
              <FormattedMessage id="photoEditor" />
            </Button>
            <Button variant="outline-secondary" disabled={disabled} size="sm">
              <FormattedMessage id="clearFocusPoint" />
            </Button> */}
            <label className={`btn btn-outline-secondary btn-sm ${disabled ? 'disabled' : ''}`} onClick={() => toggle()}>
              <FormattedMessage id="replaceImage" />
            </label>
          </div>
        )}
        {errors?.oImg?.sUrl && <Form.Control.Feedback type="invalid">{errors?.oImg?.sUrl.message}</Form.Control.Feedback>}
        <CommonInput
          type="text"
          register={register}
          errors={errors}
          className={`form-control ${errors?.oImg?.sText && 'error'}`}
          name="oImg.sText"
          label="altText"
          disabled={disabled}
          required
        />
        <CommonInput
          type="textarea"
          register={register}
          errors={errors}
          className={`form-control ${errors?.oImg?.sCaption && 'error'}`}
          name="oImg.sCaption"
          label="caption"
          disabled={disabled}
          required
        />
        <CommonInput
          type="textarea"
          register={register}
          errors={errors}
          className={`form-control ${errors?.oImg?.sAttribute && 'error'}`}
          name="oImg.sAttribute"
          label="attribution"
          disabled={disabled}
          required
        />
        <Form.Check
           type="checkbox"
           label={useIntl().formatMessage({ id: 'setDifferentThumbnail' })}
           id="Thumbnail"
           className="mb-0"
           checked={isThumbnailVisible}
           onChange={handleThumbnail}
           disabled={disabled}
         />
      </ArticleTab>
      {isThumbnailVisible && (
        <DifferentThumbnail
          register={register}
          setValue={setValue}
          onDelete={onDelete}
          articleData={articleData}
          disabled={disabled}
          values={values}
          errors={errors}
          clearErrors={clearErrors}
        />
      )}
    </>
  )
}
FeaturedImage.propTypes = {
  register: PropTypes.func,
  setValue: PropTypes.func,
  onDelete: PropTypes.func,
  articleData: PropTypes.object,
  values: PropTypes.object,
  errors: PropTypes.object,
  disabled: PropTypes.bool,
  clearErrors: PropTypes.func,
  reset: PropTypes.func
}
export default FeaturedImage
