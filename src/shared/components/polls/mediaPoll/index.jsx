import React, { useRef, useState } from 'react'
import { Button, Col, Dropdown, Form, InputGroup, Row } from 'react-bootstrap'
import { useFieldArray } from 'react-hook-form'
import PropTypes from 'prop-types'
import { FormattedMessage, useIntl } from 'react-intl'

import useModal from 'shared/hooks/useModal'
import MediaGallery from 'shared/components/media-gallery'
import CommonInput from 'shared/components/common-input'
import VdoPopup from '../vdoPopup'
import { convertToEmbed, getImgURL } from 'shared/utils'
import { validationErrors } from 'shared/constants/ValidationErrors'

export function MediaPoll({ register, errors, control, index, setValue, values, watch, isQuiz, titleInputName, aFieldInputName }) {
  const { isShowing, toggle } = useModal()
  const { isShowing: vdoPopup, toggle: toggleVdoShow } = useModal()
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const selectedImageIndexRef = useRef(null)
  const optionsName = isQuiz ? 'aQuestions' : 'slides'
  const fieldName = isQuiz ? 'aAnswers' : 'aField'

  const { fields } = useFieldArray({
    control,
    name: `${optionsName}.${index}.${fieldName}`
  })

  const fieldValue = values(`${optionsName}.${index}`)

  function handleMediaGallery(i, type) {
    if (i >= 0) {
      selectedImageIndexRef.current = i
    } else {
      selectedImageIndexRef.current = null
    }
    if (type === 'img') {
      toggle()
    } else {
      toggleVdoShow()
    }
  }

  const handleData = (data) => {
    if (selectedImageIndexRef.current !== null) {
      setValue(`${optionsName}.${index}.${fieldName}.${selectedImageIndexRef.current}.eMediaType`, 'i')
      setValue(`${optionsName}.${index}.${fieldName}.${selectedImageIndexRef.current}.oMediaUrl.sUrl`, data.sUrl)
      setValue(`${optionsName}.${index}.${fieldName}.${selectedImageIndexRef.current}.oMediaUrl.sText`, data?.sText)
      setValue(`${optionsName}.${index}.${fieldName}.${selectedImageIndexRef.current}.oMediaUrl.sCaption`, data?.sCaption)
      setValue(`${optionsName}.${index}.${fieldName}.${selectedImageIndexRef.current}.oMediaUrl.sAttribute`, data?.sAttribute)
    } else {
      setValue(`${optionsName}.${index}.oBgImgUrl.sUrl`, data?.sUrl)
      setValue(`${optionsName}.${index}.oBgImgUrl.sText`, data.sText)
      setValue(`${optionsName}.${index}.oBgImgUrl.sCaption`, data.sCaption)
      setValue(`${optionsName}.${index}.oBgImgUrl.sAttribute`, data.sAttribute)
    }
    toggle()
  }

  const handleVdoUrl = (data) => {
    if (selectedImageIndexRef.current !== null) {
      setValue(`${optionsName}.${index}.${fieldName}.${selectedImageIndexRef.current}.eMediaType`, 'v')
      const embedUrl = convertToEmbed(data?.sUrl)
      setValue(`${optionsName}.${index}.${fieldName}.${selectedImageIndexRef.current}.oMediaUrl.sUrl`, embedUrl)
    }
  }

  return (
    <>
      <div
        className="common-poll p-2 p-md-4 rounded-3 position-relative text-center"
        style={{ backgroundImage: watch(`${optionsName}.${index}.oBgImgUrl`) ? `url(${getImgURL(fieldValue?.oBgImgUrl?.sUrl)})` : '' }}
      >
        <MediaGallery
          show={isShowing}
          overRidePermission
          handleHide={toggle}
          handleData={(data) => handleData(data)}
        />
        <VdoPopup show={vdoPopup} handleHide={toggleVdoShow} handleVdoUrl={handleVdoUrl} />
        <input
          type="hidden"
          name={`${optionsName}.${index}.oBgImgUrl.sUrl`}
          {...register(`${optionsName}.${index}.oBgImgUrl.sUrl`)}
        />
        <div className="text-end mb-3">
          <Button
            variant={fieldValue?.oBgImgUrl?.sUrl ? 'danger' : 'primary'}
            onClick={(e) => fieldValue?.oBgImgUrl?.sUrl ? setValue(`${optionsName}.${index}.oBgImgUrl`, null) : handleMediaGallery(null, 'img')}
            className='left-icon'
          >
            <i className={fieldValue?.oBgImgUrl?.sUrl ? 'icon-minus' : 'icon-add'} />
            <FormattedMessage id={'background'} />
          </Button>
        </div>
        <div className="mb-4 text-start">
          <label className="input-field">
            <FormattedMessage id={isQuiz ? 'enterQuestion' : 'pollTitle'} />*
          </label>
          <CommonInput
            register={register}
            errors={errors}
            className={`${errors?.[titleInputName] && 'error'}`}
            as="input"
            // placeholder={useIntl().formatMessage({ id: 'pollTitle' })}
            type="text"
            name={`${optionsName}.${index}.${titleInputName}`}
            required
          />
        </div>
        <Row className="poll-option-list">
          {fields?.map((field, i) => {
            const fieldValue = values(`${optionsName}.${index}.${fieldName}.${i}`)
            return (
              <Col md={6} key={i}>
                <input type='hidden' name={`${optionsName}.${index}.${fieldName}.${i}.nVote`} />
                <div className="img-option mb-2 mx-auto position-relative">
                  <input
                    type="hidden"
                    name={`${optionsName}.${index}.${fieldName}.${i}.oMediaUrl.sUrl`}
                    {...register(`${optionsName}.${index}.${fieldName}.${i}.oMediaUrl.sUrl`, { required: validationErrors.required })}
                  />
                  {fieldValue?.eMediaType === 'i' ? (
                    <img src={getImgURL(fieldValue?.oMediaUrl.sUrl)} alt="Option Image" />
                  ) : fieldValue?.eMediaType === 'v' ? (
                    <iframe type="text/html" width="500" height="450" src={fieldValue?.oMediaUrl?.sUrl}></iframe>
                  ) : (
                    ''
                  )}
                  {`${errors?.[optionsName]?.[`${index}`]?.[fieldName]?.[`${i}`]?.oMediaUrl?.sUrl}` && !fieldValue?.oMediaUrl?.sUrl && (
                    <Form.Control.Feedback type="invalid">
                      {errors?.[optionsName]?.[`${index}`]?.[fieldName]?.[`${i}`]?.oMediaUrl?.sUrl?.message}
                    </Form.Control.Feedback>
                  )}
                  <Dropdown
                    className="text-end position-absolute top-50 start-50"
                    show={hoveredIndex === i}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="media-icon translate-middle bg-dark rounded-circle d-flex align-items-center justify-content-center">
                      <Dropdown.Toggle variant="link" className="actionButton">
                        <i className="icon-image-1" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="up-arrow">
                        <Dropdown.Item onClick={() => handleMediaGallery(i, 'img')}>
                          <i className="icon-image-1" />
                          <FormattedMessage id="mediaGallery" />
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleMediaGallery(i, 'vdo')}>
                          <i className="icon-image-1" />
                          <FormattedMessage id="ytVdo" />
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </div>
                  </Dropdown>
                </div>
                <CommonInput
                  inputGroupLeft={isQuiz ? <InputGroup.Text>
                    <Form.Check
                      {...register(`${optionsName}.${index}.${fieldName}.isCorrect`, { required: validationErrors.selectCorrectAnswer })}
                      value={i}
                      type='radio'
                      className="mt-0"
                    />
                  </InputGroup.Text> : null}
                  register={register}
                  errors={errors}
                  className={`${errors?.[optionsName]?.[`${index}`]?.[fieldName]?.[`${i}`]?.[aFieldInputName] && 'error'}`}
                  placeholder={useIntl().formatMessage({ id: isQuiz ? 'enterAnswer' : 'writeYourOption' })}
                  as="input"
                  name={`${optionsName}.${index}.${fieldName}.${i}.${aFieldInputName}`}
                  type="text"
                  validation={{ required: false }}
                />
              </Col>
            )
          })}
        </Row>
        {errors?.[optionsName]?.[index]?.[fieldName]?.isCorrect && (
          <Form.Control.Feedback className='text-start' type="invalid">{errors?.[optionsName]?.[index]?.[fieldName]?.isCorrect?.message}</Form.Control.Feedback>
        )}
      </div>
    </>
  )
}

MediaPoll.propTypes = {
  register: PropTypes.func,
  control: PropTypes.object,
  values: PropTypes.func,
  errors: PropTypes.object,
  index: PropTypes.number,
  setValue: PropTypes.func,
  watch: PropTypes.func,
  isQuiz: PropTypes.bool,
  titleInputName: PropTypes.string.isRequired,
  aFieldInputName: PropTypes.string.isRequired
}

export default MediaPoll
