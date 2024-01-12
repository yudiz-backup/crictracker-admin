import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { useFieldArray, useForm, useFormContext } from 'react-hook-form'
import { FormattedMessage } from 'react-intl'

import CommonInput from 'shared/components/common-input'
import YoutubeVideoPlayer from 'shared/components/youtube-video-player'
import { URL_REGEX } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import useNumberArray from 'shared/hooks/useNumberArray'
import { QUIZ_SLIDES } from 'shared/lib/quiz-poll'
import VideoQuestion from '../videoQuestion'
import { convertToEmbed } from 'shared/utils'

function VideoQuiz({ index }) {
  const [currentSlide, setCurrentSlide] = useState(-1)
  // const [url, setUrl] = useState('https://www.youtube.com/watch?v=jgm58cbu0kw')
  const { control, setValue, watch } = useFormContext()
  const url = watch(`aQuestions.${index}.oMediaUrl.sUrl`)
  const {
    register: r,
    formState: { errors: e },
    handleSubmit: hs
  } = useForm({ defaultValues: { sUrl: url } })
  const { append: addStopPoint, value: stopsPoints, remove: removeStopPoint } = useNumberArray(`aQuestions.${index}.aPausePoint`)
  const { append, remove } = useFieldArray({
    control,
    name: `aQuestions.${index}.aQuestions`
  })

  function onURLSubmit({ sUrl }) {
    setValue(`aQuestions.${index}.oMediaUrl.sUrl`, convertToEmbed(sUrl))
  }
  return (
    <>
      {!url && <div className="common-poll ratio ratio-16x9 mb-1" />}
      {url && (
        <div className="mb-1 position-relative poll-player">
          <YoutubeVideoPlayer
            url={url}
            width="100%"
            height="300px"
            className="mb-0"
            stopsPoints={stopsPoints}
            onStopPointClick={(i) => setCurrentSlide(i)}
            onStop={(i) => setCurrentSlide(i)}
          >
            {({ playerStats, range }) => {
              if (url) {
                // setCurrentSlide(stopsPoints?.indexOf(Number(range?.value || -1)))
                if (playerStats === 2 && currentSlide === -1) {
                  return (
                    <div className="slide-interaction position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center text-center">
                      <div>
                        <div
                          onClick={() => {
                            addStopPoint(Number(range?.value))
                            append(QUIZ_SLIDES.sq)
                            setCurrentSlide(stopsPoints?.indexOf(Number(range?.value || -1)))
                          }}
                          className="interaction pe-cursor mx-auto d-flex justify-content-center align-items-center rounded-circle"
                        >
                          <i className="icon-touch-interaction h1 mt-2"></i>
                        </div>
                        <h3 className="mb-0 mt-3">
                          <FormattedMessage id="addInteraction" />
                        </h3>
                      </div>
                    </div>
                  )
                } else if (playerStats === 2 && currentSlide !== -1) {
                  return (
                    <div
                      key={`${currentSlide}-slide-i`}
                      // key={Date.now()}
                      className="slide-interaction position-absolute w-100 h-100 top-0 start-0 d-flex align-items-center justify-content-center text-center"
                    >
                      <Button
                        onClick={() => {
                          remove(currentSlide)
                          removeStopPoint(currentSlide)
                          setCurrentSlide(stopsPoints?.indexOf(Number(range?.value || -1)))
                        }}
                        variant="danger"
                        size="lg"
                        className="icon-btn p-0 d-flex align-items-center justify-content-center position-absolute top-0 end-0 m-4"
                      >
                        <i className="icon-delete d-block h4 mb-0" />
                      </Button>
                      <VideoQuestion parentIndex={index} quizIndex={currentSlide} />
                    </div>
                  )
                } else return null
              } else return null
            }}
          </YoutubeVideoPlayer>
        </div>
      )}
      <Form>
        <CommonInput
          register={r}
          errors={e}
          className={`${e?.sUrl && 'error'}`}
          as="input"
          type="text"
          name="sUrl"
          displayClass="mb-0"
          inputGroupRight={
            <div className="ps-2 d-flex align-items-center">
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  return hs(onURLSubmit)(e)
                }}
                type="submit"
                size="sm"
                variant="primary"
              >
                <FormattedMessage id="done" />
              </Button>
            </div>
          }
          placeholder="https://www.youtube.com/watch?v=xyz"
          validation={{ pattern: { value: URL_REGEX, message: validationErrors.url } }}
          required
        />
      </Form>
    </>
  )
}
VideoQuiz.propTypes = {
  index: PropTypes.number
}
export default VideoQuiz
