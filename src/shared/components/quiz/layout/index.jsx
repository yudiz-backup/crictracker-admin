import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { useFormContext } from 'react-hook-form'

import { QUIZ_SLIDES } from 'shared/lib/quiz-poll'
import SimplePoll from 'shared/components/polls/simplePoll'
import ImgPoll from 'shared/components/polls/imgPoll'
import MediaPoll from 'shared/components/polls/mediaPoll'
import VideoQuiz from '../video-quiz'

function QuizLayout({ index, eType }) {
  const { control, formState: { errors }, setValue, register, watch, getValues, clearErrors } = useFormContext()
  const [selected, setSelected] = useState(eType || 'sq')
  const icons = {
    sq: 'icon-simplePoll',
    mq: 'icon-imgPoll',
    ma: 'icon-mediaPoll',
    vq: 'icon-video-quiz'
    // rp: 'icon-reactionPoll'
  }

  function getComponents({ eType, props }) {
    switch (eType) {
      case 'sq':
        return <SimplePoll {...props} />
      case 'mq':
        return <ImgPoll {...props} />
      case 'ma':
        return <MediaPoll {...props} />
      case 'vq':
        return <VideoQuiz {...props} />
      default:
        return null
    }
  }

  function onSlideChange(type, index) {
    setValue(`aQuestions.${index}`, QUIZ_SLIDES[type])
    clearErrors(`aQuestions.${index}`)
    setSelected(type)
  }

  useEffect(() => setSelected(eType || 'sq'), [eType])

  return (
    <div className="mb-4">
      {getComponents({
        eType: selected,
        props: {
          type: selected,
          index,
          errors,
          control,
          setValue,
          values: getValues,
          register,
          watch,
          titleInputName: 'sQuestion',
          aFieldInputName: 'sAnswer',
          isQuiz: true
        }
      })}
      <div className="poll-actions position-relative text-center d-flex mx-auto">
        <div className="action-list mx-auto">
          {Object.keys(QUIZ_SLIDES).map((key) => {
            const icon = icons?.[key]
            const isActive = selected === key
            const iconColor = isActive ? 'orange' : 'grey'
            return (
              <Button key={key} variant='link' className="square icon-btn mx-1" onClick={() => onSlideChange(key, index)}>
                <i className={icon} style={{ color: iconColor }}></i>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
QuizLayout.propTypes = {
  index: PropTypes.number,
  eType: PropTypes.string
}
export default QuizLayout
