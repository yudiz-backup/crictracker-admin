import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Dropdown, Form, InputGroup } from 'react-bootstrap'
import { useFieldArray } from 'react-hook-form'
import { FormattedMessage } from 'react-intl'

import useModal from 'shared/hooks/useModal'
import MediaGallery from 'shared/components/media-gallery'
import { validationErrors } from 'shared/constants/ValidationErrors'
import CommonInput from 'shared/components/common-input'
import VdoPopup from '../vdoPopup'
import { convertToEmbed, getImgURL } from 'shared/utils'
import { POLL_SLIDES, QUIZ_SLIDES } from 'shared/lib/quiz-poll'

export function ImgPoll({ register, errors, control, index, setValue, values, watch, isQuiz, titleInputName, aFieldInputName }) {
  const optionsName = isQuiz ? 'aQuestions' : 'slides'
  const fieldName = isQuiz ? 'aAnswers' : 'aField'
  const { isShowing, toggle } = useModal()
  const { isShowing: vdoPopup, toggle: toggleVdoShow } = useModal()
  const [isDropDown, setIsDropDown] = useState(false)
  const [type, setType] = useState()

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${optionsName}.${index}.${fieldName}`
  })

  const fieldValue = values(`${optionsName}.${index}`)

  function handleMediaGallery(t) {
    if (t === 'bg') {
      setType('bg')
      toggle()
    } else {
      setType('cover')
      toggle()
    }
  }

  const handleData = (data) => {
    if (type === 'cover') {
      setValue(`${optionsName}.${index}.eMediaType`, 'i')
      setValue(`${optionsName}.${index}.oMediaUrl.sUrl`, data?.sUrl)
      setValue(`${optionsName}.${index}.oMediaUrl.sText`, data.sText)
      setValue(`${optionsName}.${index}.oMediaUrl.sCaption`, data.sCaption)
      setValue(`${optionsName}.${index}.oMediaUrl.sAttribute`, data.sAttribute)
    } else if (type === 'bg') {
      setValue(`${optionsName}.${index}.oBgImgUrl.sUrl`, data?.sUrl)
      setValue(`${optionsName}.${index}.oBgImgUrl.sText`, data.sText)
      setValue(`${optionsName}.${index}.oBgImgUrl.sCaption`, data.sCaption)
      setValue(`${optionsName}.${index}.oBgImgUrl.sAttribute`, data.sAttribute)
    }

    toggle()
  }

  const handleVdoUrl = (data) => {
    setValue(`${optionsName}.${index}.eMediaType`, 'v')
    const embedUrl = convertToEmbed(data?.sUrl)
    setValue(`${optionsName}.${index}.oMediaUrl.sUrl`, embedUrl)
  }

  return (
    <>
      <div
        className="common-poll p-4 rounded-3 position-relative text-center"
        style={{ backgroundImage: watch(`${optionsName}.${index}.oBgImgUrl`) ? `url(${getImgURL(fieldValue?.oBgImgUrl?.sUrl)})` : '' }}
      >
        <MediaGallery show={isShowing} overRidePermission handleHide={toggle} handleData={(data) => handleData(data)} />
        <VdoPopup show={vdoPopup} handleHide={toggleVdoShow} handleVdoUrl={handleVdoUrl} />
        <input type="hidden" name={`${optionsName}.${index}.oBgImgUrl.sUrl`} {...register(`${optionsName}.${index}.oBgImgUrl.sUrl`)} />
        <div className="text-end mb-3">
          <Button
            variant={fieldValue?.oBgImgUrl?.sUrl ? 'danger' : 'primary'}
            onClick={(e) => fieldValue?.oBgImgUrl?.sUrl ? setValue(`${optionsName}.${index}.oBgImgUrl`, null) : handleMediaGallery('bg')}
            className='left-icon'
          >
            <i className={fieldValue?.oBgImgUrl?.sUrl ? 'icon-minus' : 'icon-add'} />
            <FormattedMessage id={'background'} />
          </Button>
        </div>
        <div className="mb-4 text-start">
          <label className="input-field">
            <FormattedMessage id={isQuiz ? 'enterQuestion' : 'pollTitle'} />
          </label>
          <CommonInput
            register={register}
            className={`${errors?.[optionsName]?.[index]?.[titleInputName] && 'error'}`}
            as="input"
            // placeholder={useIntl().formatMessage({ id: 'pollTitle' })}
            type="text"
            name={`${optionsName}.${index}.${titleInputName}`}
            validation={{ required: false }}
          />
        </div>
        <div className="ImgPoll mb-2 mx-auto position-relative">
          <input
            type="hidden"
            name={`${optionsName}.${index}.oMediaUrl.sUrl`}
            {...register(`${optionsName}.${index}.oMediaUrl.sUrl`, { required: validationErrors.required })}
          />
          {fieldValue?.eMediaType === 'i' ? (
            <img src={getImgURL(fieldValue?.oMediaUrl?.sUrl)} alt="Option Image" />
          ) : fieldValue?.eMediaType === 'v' ? (
            <iframe type="text/html" src={fieldValue?.oMediaUrl?.sUrl}></iframe>
          ) : (
            ''
          )}
          {`${errors?.[optionsName]?.[`${index}`]?.oMediaUrl?.sUrl}` && (
            <Form.Control.Feedback type="invalid">{errors?.[optionsName]?.[`${index}`]?.oMediaUrl?.sUrl?.message}</Form.Control.Feedback>
          )}
          <Dropdown
            className="text-end position-absolute top-50 start-50"
            show={isDropDown}
            onMouseEnter={() => setIsDropDown(true)}
            onMouseLeave={() => setIsDropDown(false)}
          >
            <div className="media-icon translate-middle bg-dark rounded-circle d-flex align-items-center justify-content-center">
              <Dropdown.Toggle variant="link" className="actionButton">
                <i className="icon-image-1" />
              </Dropdown.Toggle>
              <Dropdown.Menu className="up-arrow">
                <Dropdown.Item onClick={() => handleMediaGallery('cover')}>
                  <i className="icon-image-1" />
                  <FormattedMessage id="mediaGallery" />
                </Dropdown.Item>
                <Dropdown.Item onClick={toggleVdoShow}>
                  <i className="icon-image-1" />
                  <FormattedMessage id="ytVdo" />
                </Dropdown.Item>
              </Dropdown.Menu>
            </div>
          </Dropdown>
        </div>
        <div className="poll-option-list mt-2 text-start">
          <label className="input-field">
            <FormattedMessage id={isQuiz ? 'enterAnswer' : 'pollOptions'} />*
          </label>
          {fields?.map((field, i) => {
            return (
              <div className="mb-2 position-relative" key={i}>
                <input type='hidden' name={`${optionsName}.${index}.${fieldName}.${i}.nVote`} />
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
                  placeholder={`${i + 1}`}
                  as="input"
                  name={`${optionsName}.${index}.${fieldName}.${i}.${aFieldInputName}`}
                  type="text"
                  required
                />
                {fields?.length > 2 && (
                  <Button
                    variant="link"
                    className="square icon-btn position-absolute top-50 end-0 me-2 translate-middle-y"
                    onClick={() => remove(i)}
                  >
                    <i className="icon-delete d-block"></i>
                  </Button>
                )}
              </div>
            )
          })}
          {errors?.[optionsName]?.[index]?.[fieldName]?.isCorrect && (
            <Form.Control.Feedback className='text-start' type="invalid">{errors?.[optionsName]?.[index]?.[fieldName]?.isCorrect?.message}</Form.Control.Feedback>
          )}
        </div>
        <Button
          disabled={fields?.length >= 4}
          className="w-20 mx-auto d-block"
          onClick={() => append(isQuiz ? QUIZ_SLIDES.mq.aAnswers[0] : POLL_SLIDES.ip.aField[0])}
        >
          <i className="icon-add me-1" /> <FormattedMessage id="addOption" />
        </Button>
      </div>
    </>
  )
}

ImgPoll.propTypes = {
  setValue: PropTypes.func,
  register: PropTypes.func,
  control: PropTypes.object,
  values: PropTypes.func,
  errors: PropTypes.object,
  index: PropTypes.number,
  watch: PropTypes.func,
  isQuiz: PropTypes.bool,
  titleInputName: PropTypes.string.isRequired,
  aFieldInputName: PropTypes.string.isRequired
}

export default ImgPoll
