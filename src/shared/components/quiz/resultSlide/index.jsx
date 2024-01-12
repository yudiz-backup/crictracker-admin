import React from 'react'
import { Accordion, Button } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'
import { FormattedMessage } from 'react-intl'
import CommonInput from 'shared/components/common-input'
import MediaGallery from 'shared/components/media-gallery'
import useModal from 'shared/hooks/useModal'
import { getImgURL } from 'shared/utils'

function ResultSlide() {
  const {
    formState: { errors },
    register,
    watch,
    setValue
  } = useFormContext()
  const { isShowing, toggle, closeModal } = useModal()
  const bgImage = watch('oResSlide.oBgImgUrl.sUrl')

  function handleData(data) {
    setValue('oResSlide.oBgImgUrl.sUrl', data?.sUrl)
    setValue('oResSlide.oBgImgUrl.sText', data?.sText)
    setValue('oResSlide.oBgImgUrl.sCaption', data?.sCaption)
    setValue('oResSlide.oBgImgUrl.sAttribute', data?.sAttribute)
    closeModal()
  }

  function handleRemoveBackground() {
    setValue('oResSlide.oBgImgUrl.sUrl', '')
    setValue('oResSlide.oBgImgUrl.sText', '')
    setValue('oResSlide.oBgImgUrl.sCaption', '')
    setValue('oResSlide.oBgImgUrl.sAttribute', '')
  }
  return (
    <div className="p-4 rounded-3 position-relative my-4 result-slide">
      <MediaGallery show={isShowing} overRidePermission handleHide={closeModal} handleData={handleData} />
      <div className="text-end mb-3">
        <Button
          variant={bgImage ? 'danger' : 'primary'}
          onClick={(e) => (bgImage ? handleRemoveBackground() : toggle(e))}
          className="left-icon me-auto"
        >
          <i className={bgImage ? 'icon-minus' : 'icon-add'} />
          <FormattedMessage id={'background'} />
        </Button>
      </div>
      <Accordion defaultActiveKey="0">
        <Accordion.Item
          eventKey="0"
          className="mb-3 common-poll border-0"
          style={{ backgroundImage: bgImage ? `url(${getImgURL(bgImage)})` : '' }}
        >
          <Accordion.Header>2 Out of 8</Accordion.Header>
          <Accordion.Body className="">
            <div className="score rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3">
              <p className="h1 mb-0">2/8</p>
            </div>
            <CommonInput
              type="text"
              register={register}
              name="oResSlide.sLowText"
              errors={errors}
              className={`${errors?.oResSlide?.sLowText && 'error'} text-center`}
              required
              defaultValue="Thats a… good start? "
              displayClass="mb-0"
            />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item
          eventKey="1"
          className="mb-3 common-poll border-0"
          style={{ backgroundImage: bgImage ? `url(${getImgURL(bgImage)})` : '' }}
        >
          <Accordion.Header>4 Out of 8</Accordion.Header>
          <Accordion.Body>
            <div className="score rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3">
              <p className="h1 mb-0">4/8</p>
            </div>
            <CommonInput
              type="text"
              register={register}
              name="oResSlide.sMidText"
              required
              defaultValue="Not bad, but you can do better!"
              displayClass="mb-0"
              errors={errors}
              className={`${errors?.oResSlide?.sMidText && 'error'} text-center`}
            />
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item
          eventKey="2"
          className="mb-3 common-poll border-0"
          style={{ backgroundImage: bgImage ? `url(${getImgURL(bgImage)})` : '' }}
        >
          <Accordion.Header>7 Out of 8</Accordion.Header>
          <Accordion.Body>
            <div className="score rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3">
              <p className="h1 mb-0">7/8</p>
            </div>
            <CommonInput
              type="text"
              register={register}
              name="oResSlide.sHighText"
              required
              defaultValue="Good job! Share it proudly!"
              displayClass="mb-0"
              errors={errors}
              className={`${errors?.oResSlide?.sHighText && 'error'} text-center`}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  )
}
export default ResultSlide
