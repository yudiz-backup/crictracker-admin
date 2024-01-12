import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'

import { S3_PREFIX } from 'shared/constants'
import CategoryPlayerTeamTab from '../category-player-team-tab'
import MediaGallery from 'shared/components/media-gallery'
import useModal from 'shared/hooks/useModal'
import CommonInput from '../common-input'

function CategoryPlayerTeamImage({ register, setValue, onDelete, values, errors, data, clearErrors }) {
  const [image, setImage] = useState()
  const { isShowing, toggle } = useModal()

  useEffect(() => {
    if (data) {
      if (!values?.oImg?.fSUrl?.length && data?.oImg?.sUrl) setImage(`${S3_PREFIX}${data.oImg.sUrl}`)
    }
  }, [data])

  function deleteImg() {
    setImage('')
    setValue('oImg.sUrl', '')
    onDelete('oImg')
  }

  const handleData = (data) => {
    setValue('oImg.sText', data.sText)
    setValue('oImg.sCaption', data.sCaption)
    setValue('oImg.sAttribute', data.sAttribute)
    setValue('oImg.sUrl', data?.sUrl)
    setImage(S3_PREFIX + data?.sUrl)
    toggle()
  }

  return (
    <>
      <CategoryPlayerTeamTab title={useIntl().formatMessage({ id: 'featuredImage' })} event={1}>
        <div className="f-image d-flex align-items-center justify-content-center">
          <input type="hidden" name="oImg.sUrl" {...register('oImg.sUrl')} />
          {image && <img src={image} alt="Featured Image" />}
          {!image && (
            <div>
              {/* <label htmlFor="featureImg">
                <i className="icon-upload" />
                <FormattedMessage id="uploadImage" />
              </label> */}
              {/* FOR PHASE 2 */}
              {/* <span className="or d-block">
                <FormattedMessage id="or" />
              </span> */}
              <Button size="sm" variant="primary" onClick={() => toggle()}>
                <FormattedMessage id="mediaGallery" />
              </Button>
            </div>
          )}
          <MediaGallery show={isShowing} overRidePermission handleHide={toggle} handleData={handleData} />
        </div>
        {image && (
          <div className="change-img-btn">
            <Button variant="outline-secondary" size="sm" onClick={deleteImg}>
              <FormattedMessage id="delete" />
            </Button>
            {/* FOR PHASE 2 */}
            {/* <Button variant="outline-secondary" size="sm">
              <FormattedMessage id="photoEditor" />
            </Button>
            <Button variant="outline-secondary" size="sm">
              <FormattedMessage id="clearFocusPoint" />
            </Button> */}
            <label className="btn btn-outline-secondary btn-sm" onClick={() => toggle()}>
              <FormattedMessage id="replaceImage" />
            </label>
          </div>
        )}
        <CommonInput
          type="text"
          register={register}
          errors={errors}
          className={`form-control ${errors?.oImg?.sText && 'error'}`}
          name="oImg.sText"
          label="altText"
        />
        <CommonInput
          type="textarea"
          register={register}
          errors={errors}
          className={`form-control ${errors?.oImg?.sCaption && 'error'}`}
          name="oImg.sCaption"
          label="caption"
        />
        <CommonInput
          type="textarea"
          register={register}
          errors={errors}
          className={`form-control ${errors?.oImg?.sAttribute && 'error'}`}
          name="oImg.sAttribute"
          label="attribution"
        />
      </CategoryPlayerTeamTab>
    </>
  )
}
CategoryPlayerTeamImage.propTypes = {
  register: PropTypes.func,
  setValue: PropTypes.func,
  onDelete: PropTypes.func,
  articleData: PropTypes.object,
  values: PropTypes.object,
  errors: PropTypes.object,
  data: PropTypes.object,
  clearErrors: PropTypes.func
}
export default CategoryPlayerTeamImage
