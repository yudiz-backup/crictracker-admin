import React from 'react'
import { Button } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'
import { FormattedMessage } from 'react-intl'

import CommonInput from 'shared/components/common-input'
import MediaGallery from 'shared/components/media-gallery'
import useModal from 'shared/hooks/useModal'
import { getImgURL } from 'shared/utils'

function FirstSlide() {
  const { formState: { errors }, register, watch, setValue } = useFormContext()
  const { isShowing, toggle, closeModal } = useModal()
  const bgImage = watch('oBgImgUrl.sUrl')

  function handleData(data) {
    setValue('oBgImgUrl.sUrl', data?.sUrl)
    setValue('oBgImgUrl.sText', data?.sText)
    setValue('oBgImgUrl.sCaption', data?.sCaption)
    setValue('oBgImgUrl.sAttribute', data?.sAttribute)
    closeModal()
  }

  function handleRemoveBackground() {
    setValue('oBgImgUrl.sUrl', '')
    setValue('oBgImgUrl.sText', '')
    setValue('oBgImgUrl.sCaption', '')
    setValue('oBgImgUrl.sAttribute', '')
  }

  return (
    <div
      className='common-poll p-4 rounded-3 position-relative mb-4 first-slide'
      style={{ backgroundImage: bgImage ? `url(${getImgURL(bgImage)})` : '' }}
    >
      <MediaGallery show={isShowing} overRidePermission handleHide={closeModal} handleData={handleData} />
      <div className="text-end mb-3">
        <Button
          variant={bgImage ? 'danger' : 'primary'}
          onClick={(e) => bgImage ? handleRemoveBackground() : toggle(e)}
          className='left-icon'
        >
          <i className={bgImage ? 'icon-minus' : 'icon-add'} />
          <FormattedMessage id={'background'} />
        </Button>
      </div>
      <CommonInput
        register={register}
        errors={errors}
        className={`${errors?.sTitle && 'error'}`}
        type="text"
        name="sTitle"
        // label={useIntl().formatMessage({ id: 'title' })}
        label='title'
        required
      />
      <div className="submit-btn d-flex justify-content-center">
        <CommonInput
          register={register}
          errors={errors}
          className={`${errors?.sButtonText && 'error'} bg-primary text-center fw-bold`}
          type="text"
          name="sButtonText"
          // label={useIntl().formatMessage({ id: 'title' })}
          // label='title'
          required
        />
      </div>
    </div>
  )
}
export default FirstSlide
