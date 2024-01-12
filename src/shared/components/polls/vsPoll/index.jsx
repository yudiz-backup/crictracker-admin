import React, { useRef, useState } from 'react'
import { Col, Dropdown, Form, Row } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { FormattedMessage, useIntl } from 'react-intl'
import { useFieldArray } from 'react-hook-form'

import useModal from 'shared/hooks/useModal'
import MediaGallery from 'shared/components/media-gallery'
import CommonInput from 'shared/components/common-input'
import { validationErrors } from 'shared/constants/ValidationErrors'
import VdoPopup from '../vdoPopup'
import { convertToEmbed, getImgURL } from 'shared/utils'

export function VsPoll({ register, errors, control, index, setValue, isQuiz, titleInputName }) {
  const { isShowing, toggle } = useModal()
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const { isShowing: vdoPopup, toggle: toggleVdoShow } = useModal()
  const selectedImageIndexRef = useRef(null)
  const optionsName = isQuiz ? 'aQuestions' : 'slides'
  const fieldName = isQuiz ? 'aAnswers' : 'aField'

  const { fields } = useFieldArray({
    control,
    name: `${optionsName}.${index}.${fieldName}`
  })

  function handleMediaGallery(index, type) {
    selectedImageIndexRef.current = index
    if (type === 'img') {
      toggle()
    } else {
      toggleVdoShow()
    }
  }

  const handleData = (data) => {
    if (selectedImageIndexRef.current !== null) {
      fields[selectedImageIndexRef.current].oMediaUrl.sUrl = data?.sUrl
      fields[selectedImageIndexRef.current].eMediaType = 'i'
      setValue(`${optionsName}.${index}.${fieldName}.${selectedImageIndexRef.current}.eMediaType`, 'i')
      setValue(`${optionsName}.${index}.${fieldName}.${selectedImageIndexRef.current}.oMediaUrl.sUrl`, data?.sUrl)
      setValue(`${optionsName}.${index}.${fieldName}.${selectedImageIndexRef.current}.oMediaUrl.sText`, data?.sText)
      setValue(`${optionsName}.${index}.${fieldName}.${selectedImageIndexRef.current}.oMediaUrl.sCaption`, data?.sCaption)
      setValue(`${optionsName}.${index}.${fieldName}.${selectedImageIndexRef.current}.oMediaUrl.sAttribute`, data?.sAttribute)
    }
    toggle()
  }

  const handleVdoUrl = (data) => {
    if (selectedImageIndexRef.current !== null) {
      fields[selectedImageIndexRef.current].oMediaUrl.sUrl = data?.sUrl
      fields[selectedImageIndexRef.current].eMediaType = 'v'
      setValue(`${optionsName}.${index}.${fieldName}.${selectedImageIndexRef.current}.eMediaType`, 'v')
      const embedUrl = convertToEmbed(data?.sUrl)
      setValue(`${optionsName}.${index}.${fieldName}.${selectedImageIndexRef.current}.oMediaUrl.sUrl`, embedUrl)
    }
  }

  return (
    <>
      <CommonInput
        register={register}
        errors={errors}
        className={`${errors?.[optionsName]?.[index]?.[titleInputName] && 'error'}`}
        displayClass="mb-1"
        as="input"
        placeholder={useIntl().formatMessage({ id: isQuiz ? 'enterQuestion' : 'pollTitle' }) + '*'}
        type="text"
        name={`${optionsName}.${index}.${titleInputName}`}
        required
      />
      <div className="rounded-3 vs-poll position-relative text-center overflow-hidden">
        <Row className="poll-option-list vspoll-option-list gx-0">
          <MediaGallery show={isShowing} overRidePermission handleHide={toggle} handleData={(data) => handleData(data)} />
          <VdoPopup show={vdoPopup} handleHide={toggleVdoShow} handleVdoUrl={handleVdoUrl} />
          {fields?.map((field, i) => {
            return (
              <Col xs={6} className="vsPoll-container position-relative" key={i}>
                <input type='hidden' name={`${optionsName}.${index}.${fieldName}.${i}.nVote`} />
                {isQuiz && (
                  <Form.Check
                    {...register(`${optionsName}.${index}.${fieldName}.isCorrect`, { required: validationErrors.selectCorrectAnswer })}
                    value={i}
                    defaultChecked={i === 0}
                    id={field?.id}
                    type='radio'
                    className="mt-0 vspoll-check"
                  />
                )}
                <div className="common-poll vsPoll mx-auto position-relative overflow-hidden">
                  <input
                    type="hidden"
                    name={`${optionsName}.${index}.${fieldName}.${i}.oMediaUrl.sUrl`}
                    {...register(`${optionsName}.${index}.${fieldName}.${i}.oMediaUrl.sUrl`, { required: validationErrors.required })}
                  />
                  {field?.eMediaType === 'i' ? (
                    <img src={getImgURL(field?.oMediaUrl?.sUrl)} alt="Option Image" />
                  ) : field?.eMediaType === 'v' ? (
                    // <div className="iframe-block">
                    <iframe
                      className="top-50 start-0 translate-middle-y position-absolute"
                      type="text/html"
                      src={field?.oMediaUrl?.sUrl}
                    ></iframe>
                  ) : (
                    // </div>
                    ''
                  )}
                  <div className="vsPoll-input bottom-0 position-absolute w-50" style={{ marginLeft: '135px' }}>
                    {`${errors?.[optionsName]?.[`${index}`]?.[fieldName]?.[`${i}`]?.oMediaUrl?.sUrl}` && !field.oMediaUrl.sUrl && (
                      <Form.Control.Feedback type="invalid">
                        {errors?.[optionsName]?.[`${index}`]?.[fieldName]?.[`${i}`]?.oMediaUrl?.sUrl.message}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </div>

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
              </Col>
            )
          })}
        </Row>
      </div>
    </>
  )
}

VsPoll.propTypes = {
  register: PropTypes.func,
  control: PropTypes.object,
  errors: PropTypes.object,
  index: PropTypes.number,
  setValue: PropTypes.func,
  isQuiz: PropTypes.bool,
  titleInputName: PropTypes.string.isRequired
}

export default VsPoll
