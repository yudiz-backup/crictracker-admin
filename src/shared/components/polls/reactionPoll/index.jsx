
import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Dropdown, Form, Row } from 'react-bootstrap'
import { useFieldArray } from 'react-hook-form'
import { FormattedMessage, useIntl } from 'react-intl'

import useModal from 'shared/hooks/useModal'
import MediaGallery from 'shared/components/media-gallery'
import CommonInput from 'shared/components/common-input'
import { validationErrors } from 'shared/constants/ValidationErrors'
import VdoPopup from '../vdoPopup'
import { convertToEmbed, getImgURL } from 'shared/utils'
import EmojiPopup from '../emojiPopup'

export function ReactionPoll({ register, errors, control, index, values, setValue, watch }) {
  const { isShowing, toggle } = useModal()
  const { isShowing: emoji, toggle: toggleEmojiShow } = useModal()
  const { isShowing: vdoPopup, toggle: toggleVdoShow } = useModal()
  const [type, setType] = useState()
  const [isDropDown, setIsDropDown] = useState(false)
  const selectedImageIndexRef = useRef(null)

  const { fields } = useFieldArray({
    control,
    name: `slides.${index}.aField`
  })

  const fieldValue = values(`slides.${index}`)

  function handleMediaGallery(type, url) {
    setType(type)
    if (url === 'img') {
      toggle()
    } else {
      toggleVdoShow()
    }
  }

  function handleEmojiUrl(index) {
    if (index >= 0) {
      selectedImageIndexRef.current = index
    }
    toggleEmojiShow()
  }

  const handleData = (data) => {
    if (type === 'bg') {
      setValue(`slides.${index}.oBgImgUrl.sUrl`, data?.sUrl)
      setValue(`slides.${index}.oBgImgUrl.sText`, data.sText)
      setValue(`slides.${index}.oBgImgUrl.sCaption`, data.sCaption)
      setValue(`slides.${index}.oBgImgUrl.sAttribute`, data.sAttribute)
    } else {
      setValue(`slides.${index}.eMediaType`, 'i')
      setValue(`slides.${index}.oMediaUrl.sUrl`, data?.sUrl)
      setValue(`slides.${index}.oMediaUrl.sText`, data.sText)
      setValue(`slides.${index}.oMediaUrl.sCaption`, data.sCaption)
      setValue(`slides.${index}.oMediaUrl.sAttribute`, data.sAttribute)
    }
    toggle()
  }

  const handleVdoUrl = (data) => {
    setValue(`slides.${index}.eMediaType`, 'v')
    const embedUrl = convertToEmbed(data?.sUrl)
    setValue(`slides.${index}.oMediaUrl.sUrl`, embedUrl)
  }

  function handleEmoji(data) {
    fields[selectedImageIndexRef.current].oMediaUrl.sUrl = data.sMediaUrl
    setValue(`slides.${index}.aField.${selectedImageIndexRef.current}.eMediaType`, 'i')
    setValue(`slides.${index}.aField.${selectedImageIndexRef.current}.oMediaUrl.sUrl`, data.sMediaUrl)
  }

  return (
    <>
      <div
        className="common-poll p-4 rounded-3 position-relative text-center"
        style={{ backgroundImage: watch(`slides.${index}.oBgImgUrl`) ? `url(${getImgURL(fieldValue?.oBgImgUrl?.sUrl)})` : '' }}
      >
        <input
          type="hidden"
          name={`slides.${index}.oBgImgUrl.sUrl`}
          {...register(`slides.${index}.oBgImgUrl.sUrl`)}
        />
        <div className="text-end mb-3">
          <Button
            variant={fieldValue?.oBgImgUrl?.sUrl ? 'danger' : 'primary'}
            onClick={(e) => fieldValue?.oBgImgUrl?.sUrl ? setValue(`slides.${index}.oBgImgUrl`, null) : handleMediaGallery('bg', 'img')}
            className='left-icon'
          >
            <i className={fieldValue?.oBgImgUrl?.sUrl ? 'icon-minus' : 'icon-add'} />
            <FormattedMessage id={'background'} />
          </Button>
        </div>
        <div className="mb-4 text-start">
          <label className="input-field">
            <FormattedMessage id={'pollTitle'} />*
          </label>
          <CommonInput
            register={register}
            errors={errors}
            className={`${errors?.slides?.[index]?.sTitle && 'error'}`}
            as="input"
            placeholder={useIntl().formatMessage({ id: 'pollTitle' })}
            type="text"
            name={`slides.${index}.sTitle`}
            required
          />
        </div>
        <EmojiPopup show={emoji} handleHide={toggleEmojiShow} handleEmoji={handleEmoji} />
        <MediaGallery
          show={isShowing}
          overRidePermission
          handleHide={toggle}
          handleData={(data) => handleData(data)}
        />
        <VdoPopup show={vdoPopup} handleHide={toggleVdoShow} handleVdoUrl={handleVdoUrl} />
        <div className="ImgPoll mb-2 mx-auto position-relative">
          <input
            type="hidden"
            name={`slides.${index}.oMediaUrl.sUrl`}
            {...register(`slides.${index}.oMediaUrl.sUrl`)}
          />
          {fieldValue?.eMediaType === 'i' ? (
            <img src={getImgURL(fieldValue.oMediaUrl.sUrl)} alt="Option Image" />
          ) : fieldValue.eMediaType === 'v' ? (
            <iframe type="text/html" src={fieldValue.oMediaUrl.sUrl}></iframe>
          ) : (
            ''
          )}
          <Dropdown
            className="text-end position-absolute top-50 start-50"
            show={isDropDown}
            onMouseEnter={() => setIsDropDown(true)}
            onMouseLeave={() => setIsDropDown(false)}
          >
            <div className="media-icon vdoPoll-container translate-middle bg-dark rounded-circle d-flex align-items-center justify-content-center">
              <Dropdown.Toggle variant="link" className="actionButton">
                <i className="icon-image-1" />
              </Dropdown.Toggle>
              <Dropdown.Menu className="up-arrow">
                <Dropdown.Item onClick={() => handleMediaGallery('cvr', 'img')}>
                  <i className="icon-image-1" />
                  <FormattedMessage id="mediaGallery" />
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleMediaGallery('cvr', 'vdo')}>
                  <i className="icon-image-1" />
                  <FormattedMessage id="ytVdo" />
                </Dropdown.Item>
              </Dropdown.Menu>
            </div>
          </Dropdown>
        </div>
        <Row className="poll-option-list mt-3">
          {fields?.map((field, i) => {
            return (
              <Col xs={3} key={i}>
                <input type='hidden' name={`slides.${index}.aField.${i}.nVote`} />
                <div className="img-option vdo-option mb-2 mx-auto position-relative rounded-3">
                  <input
                    type="hidden"
                    name={`slides.${index}.aField.${i}.oMediaUrl.sUrl`}
                    {...register(`slides.${index}.aField.${i}.oMediaUrl.sUrl`, { required: validationErrors.required })}
                  />
                  {`${errors?.slides?.[`${index}`]?.aField?.[`${i}`]?.oMediaUrl?.sUrl}` && !field.oMediaUrl?.sUrl && (
                    <Form.Control.Feedback type="invalid">
                      {errors?.slides?.[`${index}`]?.aField?.[`${i}`]?.oMediaUrl?.sUrl?.message}
                    </Form.Control.Feedback>
                  )}
                  <div
                    className="media-icon emoji-icon position-absolute top-50 start-50 translate-middle bg-dark rounded-circle d-flex align-items-center justify-content-center"
                    onClick={() => handleEmojiUrl(i)}
                  >
                    <div className="emoji-font">{field?.oMediaUrl?.sUrl || <i className="icon-reactionPoll" />}</div>
                  </div>
                </div>
              </Col>
            )
          })}
        </Row>
      </div>
    </>
  )
}

ReactionPoll.propTypes = {
  register: PropTypes.func,
  handleSubmit: PropTypes.func,
  control: PropTypes.object,
  values: PropTypes.func,
  errors: PropTypes.object,
  index: PropTypes.number,
  setValue: PropTypes.func,
  watch: PropTypes.func
}

export default ReactionPoll
