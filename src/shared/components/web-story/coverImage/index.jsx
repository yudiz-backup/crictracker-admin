import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import ArticleTab from 'shared/components/article-tab'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { getImgURL } from 'shared/utils'
import MediaGallery from 'shared/components/media-gallery'
import { S3_PREFIX } from 'shared/constants'
import useModal from 'shared/hooks/useModal'
import CommonInput from 'shared/components/common-input'

function CoverImage({ register, setValue, onDelete, disabled, errors, clearErrors, storyData, titleName, objectName }) {
  const [image, setImage] = useState()
  const [imageSUrl, setImageSUrl] = useState()
  const { isShowing, toggle } = useModal()

  const handleData = (data) => {
    setValue(`${objectName}.sText`, data.sText)
    setValue(`${objectName}.sCaption`, data.sCaption)
    setValue(`${objectName}.sAttribute`, data.sAttribute)
    setValue(`${objectName}.sUrl`, imageSUrl)
    clearErrors(`${objectName}.sUrl`)
    setImage(S3_PREFIX + imageSUrl)
    toggle()
  }

  const imageUrl = (data) => {
    setImageSUrl(data?.sUrl)
  }

  useEffect(() => {
    if (storyData && objectName === 'oCoverImg') {
      if (storyData?.oCoverImg?.sUrl) setImage(getImgURL(storyData.oCoverImg.sUrl))
    } else {
      if (storyData?.oLogoImg?.sUrl) setImage(getImgURL(storyData.oLogoImg.sUrl))
    }
  }, [storyData])

  function deleteImg() {
    setImage('')
    setValue(`${objectName}.sUrl`, '')
    onDelete(objectName)
  }

  return (
    <>
      <ArticleTab title={useIntl().formatMessage({ id: titleName })} event={1}>
        <div className="web-story-img d-flex align-items-center justify-content-center">
          <input type="hidden" name={`${objectName}.sUrl`} {...register(`${objectName}.sUrl`, { required: validationErrors.required })} />
          {image && (
            <img
              className={objectName === 'oCoverImg' ? 'cover-img' : ''}
              src={image}
              alt={objectName === 'oCoverImg' ? 'Cover Image' : 'Logo Image'}
            />
          )}
          {!image && (
            <div className='media m-4'>
              <Button size="sm" variant="primary" disabled={disabled} onClick={() => toggle()}>
                <FormattedMessage id="mediaGallery" />
              </Button>
            </div>
          )}
          <MediaGallery show={isShowing} overRidePermission handleHide={toggle} handleData={handleData} imageUrl={imageUrl} />
        </div>

        {image && (
          <div className="change-img-btn mt-2">
            <Button variant="outline-secondary" disabled={disabled} size="sm" onClick={deleteImg}>
              <FormattedMessage id="deleteImage" />
            </Button>
            <label className={`btn btn-outline-secondary btn-sm ${disabled ? 'disabled' : ''}`} onClick={() => toggle()}>
              <FormattedMessage id="replaceImage" />
            </label>
          </div>
        )}
        {objectName === 'oCoverImg' && errors?.oCoverImg?.sUrl ? (
          <Form.Control.Feedback type="invalid">{errors?.oCoverImg?.sUrl.message}</Form.Control.Feedback>
        ) : objectName === 'oLogoImg' && errors?.oLogoImg?.sUrl ? (
          <Form.Control.Feedback type="invalid">{errors?.oLogoImg?.sUrl.message}</Form.Control.Feedback>
        ) : (
          ''
        )}

        <CommonInput
          type="text"
          register={register}
          errors={errors}
          className={`form-control ${errors?.oCoverImg?.sText && 'error'}`}
          name={`${objectName}.sText`}
          label="altText"
          disabled={disabled}
          required
        />

        <CommonInput
          type="textarea"
          register={register}
          errors={errors}
          className={`form-control ${errors?.oCoverImg?.sCaption && 'error'}`}
          name={`${objectName}.sCaption`}
          label="caption"
          disabled={disabled}
          required
        />

        <CommonInput
          type="textarea"
          register={register}
          errors={errors}
          className={`form-control ${errors?.oCoverImg?.sAttribute && 'error'}`}
          name={`${objectName}.sAttribute`}
          label="attribution"
          disabled={disabled}
          required
        />
      </ArticleTab>
    </>
  )
}
CoverImage.propTypes = {
  register: PropTypes.func,
  setValue: PropTypes.func,
  onDelete: PropTypes.func,
  storyData: PropTypes.object,
  errors: PropTypes.object,
  disabled: PropTypes.bool,
  clearErrors: PropTypes.func,
  reset: PropTypes.func,
  titleName: PropTypes.string,
  objectName: PropTypes.string
}
export default CoverImage
