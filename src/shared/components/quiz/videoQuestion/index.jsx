import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { FormattedMessage, useIntl } from 'react-intl'

import CommonInput from 'shared/components/common-input'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { QUIZ_SLIDES } from 'shared/lib/quiz-poll'
// import { validationErrors } from 'shared/constants/ValidationErrors'

const VideoQuestion = ({ parentIndex, quizIndex }) => {
  const optionsName = useMemo(() => `aQuestions.${parentIndex}.aQuestions.${quizIndex}`, [parentIndex, quizIndex])
  const { register, errors, control } = useFormContext()

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${optionsName}.aAnswers`
  })
  return (
    <div className="common-poll p-3 text-start d-flex align-items-center">
      <div className='w-100'>
        <CommonInput
          register={register}
          errors={errors}
          className={`${errors?.aQuestions?.[parentIndex]?.aQuestions?.[quizIndex]?.sQuestion && 'error'}`}
          as="input"
          placeholder={useIntl().formatMessage({ id: 'enterQuestion' })}
          type="text"
          name={`${optionsName}.sQuestion`}
          required
        />
        <div className="poll-option-list mt-4 text-start">
          {fields?.map((field, i) => (
            <div key={field?.id + i} className="mb-2 position-relative">
              <input type='hidden' {...register(`${optionsName}.aAnswers.${i}.nVote`)} />
              <CommonInput
                inputGroupLeft={
                  <InputGroup.Text>
                    <Form.Check
                      {...register(`${optionsName}.aAnswers.isCorrect`)}
                      // defaultChecked={i === 0}
                      value={i}
                      type='radio'
                      className="mt-0"
                    />
                  </InputGroup.Text>
                }
                register={register}
                errors={errors}
                className={errors?.aQuestions?.[parentIndex]?.aQuestions?.[quizIndex]?.aAnswers?.[i]?.sAnswer && 'error'}
                as="input"
                placeholder={useIntl().formatMessage({ id: 'enterAnswer' })}
                name={`${optionsName}.aAnswers.${i}.sAnswer`}
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
          ))}
        </div>
        <Button disabled={fields?.length >= 4} className="w-20 mx-auto d-block" onClick={() => append(QUIZ_SLIDES.sq.aAnswers[0])}>
          <i className="icon-add me-1" /> <FormattedMessage id="addOption" />
        </Button>
      </div>
    </div>
  )
}
VideoQuestion.propTypes = {
  parentIndex: PropTypes.number.isRequired,
  quizIndex: PropTypes.number.isRequired
}
export default VideoQuestion
