import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { useFieldArray } from 'react-hook-form'
import { FormattedMessage } from 'react-intl'

import CommonInput from 'shared/components/common-input'
import useModal from 'shared/hooks/useModal'
import MediaGallery from 'shared/components/media-gallery'
import { getImgURL } from 'shared/utils'
import { POLL_SLIDES, QUIZ_SLIDES } from 'shared/lib/quiz-poll'
import { validationErrors } from 'shared/constants/ValidationErrors'

export function SimplePoll({ setValue, register, watch, errors, control, index, titleInputName, isQuiz, aFieldInputName }) {
  const optionsName = isQuiz ? 'aQuestions' : 'slides'
  const fieldName = isQuiz ? 'aAnswers' : 'aField'
  const bgImage = watch(`${optionsName}.${index}.oBgImgUrl.sUrl`)

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${optionsName}.${index}.${fieldName}`
  })
  const { isShowing, toggle } = useModal()

  const handleData = (data) => {
    setValue(`${optionsName}.${index}.oBgImgUrl.sUrl`, data.sUrl)
    setValue(`${optionsName}.${index}.oBgImgUrl.sText`, data.sText)
    setValue(`${optionsName}.${index}.oBgImgUrl.sCaption`, data.sCaption)
    setValue(`${optionsName}.${index}.oBgImgUrl.sAttribute`, data.sAttribute)
    toggle()
  }

  const handleRemoveBackground = () => {
    setValue(`${optionsName}.${index}.oBgImgUrl.sUrl`, '')
    setValue(`${optionsName}.${index}.oBgImgUrl.sText`, '')
    setValue(`${optionsName}.${index}.oBgImgUrl.sCaption`, '')
    setValue(`${optionsName}.${index}.oBgImgUrl.sAttribute`, '')
  }

  return (
    <>
      <div className="common-poll p-4 rounded-3 position-relative text-center" style={{ backgroundImage: `url(${getImgURL(bgImage)})` }}>
        <input
          type="hidden"
          name={`${optionsName}.${index}.oBgImgUrl.sUrl`}
          {...register(`${optionsName}.${index}.oBgImgUrl.sUrl`)}
        />
        <MediaGallery show={isShowing} overRidePermission handleHide={toggle} handleData={handleData} />
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
        <div className="mb-4 text-start">
          <label className="input-field">
            <FormattedMessage id={isQuiz ? 'enterQuestion' : 'pollTitle'} />*
          </label>
          <CommonInput
            register={register}
            errors={errors}
            className={`${errors?.[optionsName]?.[index]?.[titleInputName] && 'error'}`}
            as="input"
            // placeholder={useIntl().formatMessage({ id: 'pollTitle' })}
            type="text"
            name={`${optionsName}.${index}.${titleInputName}`}
            required
          />
        </div>

        <div className="poll-option-list mt-4 text-start">
          <label className="input-field">
            <FormattedMessage id={isQuiz ? 'enterAnswer' : 'pollOptions'} />*
          </label>
          {fields?.map((field, i) => {
            return (
              <div key={i} className="mb-2 position-relative">
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
                  className={errors?.[optionsName]?.[`${index}`]?.[fieldName]?.[`${i}`]?.[aFieldInputName] && 'error'}
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
          onClick={() => append(isQuiz ? QUIZ_SLIDES.sq.aAnswers[0] : POLL_SLIDES.sp.aField[0])}
        >
          <i className="icon-add me-1" /> <FormattedMessage id="addOption" />
        </Button>
      </div>
    </>
  )
}

SimplePoll.propTypes = {
  register: PropTypes.func,
  // values: PropTypes.func,
  // handleSubmit: PropTypes.func,
  control: PropTypes.object,
  watch: PropTypes.func,
  errors: PropTypes.object,
  index: PropTypes.number,
  setValue: PropTypes.func,
  isQuiz: PropTypes.bool,
  titleInputName: PropTypes.string.isRequired,
  aFieldInputName: PropTypes.string.isRequired
}

export default SimplePoll
