import React, { forwardRef, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Col, Form, InputGroup, Row, Spinner } from 'react-bootstrap'
import { Controller, useForm, useFieldArray } from 'react-hook-form'
import { FormattedMessage, useIntl } from 'react-intl'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import { useLazyQuery, useMutation } from '@apollo/client'
import { useHistory, useParams } from 'react-router-dom/cjs/react-router-dom.min'

import CommonInput from 'shared/components/common-input'
import ImgPoll from 'shared/components/polls/imgPoll'
import MediaPoll from 'shared/components/polls/mediaPoll'
import SimplePoll from 'shared/components/polls/simplePoll'
import ReactionPoll from 'shared/components/polls/reactionPoll'
import VsPoll from 'shared/components/polls/vsPoll'
import { TOAST_TYPE } from 'shared/constants'
import PollLayout from 'shared/components/polls/pollLayout'
import Loading from 'shared/components/loading'
import { ADD_NEW_POLL, EDIT_NEW_POLL } from 'graph-ql/widgets/poll/mutation'
import { ToastrContext } from 'shared/components/toastr'
import { allRoutes } from 'shared/constants/AllRoutes'
import { GET_POLL } from 'graph-ql/widgets/poll/query'
import { removeTypeId, removeTypeName } from 'shared/utils'
import { POLL_SLIDES } from 'shared/lib/quiz-poll'

export function NewAddPoll({ pollId, asComponent, onSubmit }) {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    watch,
    reset,
    formState: { errors },
    clearErrors
  } = useForm({ defaultValues: getDefaultValue() })

  const id = asComponent ? pollId : useParams()?.id

  const { dispatch } = useContext(ToastrContext)
  const history = useHistory()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'slides'
  })

  useEffect(() => {
    if (id) {
      getPoll({ variables: { input: { _id: id } } })
    }
  }, [id])

  const [addPoll, { loading }] = useMutation(ADD_NEW_POLL, {
    onCompleted: (response) => {
      if (response) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: response?.addPoll?.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
        !asComponent && history.push(allRoutes.poll)
        onSubmit && onSubmit(response?.addPoll)
      }
    }
  })

  const [updatePoll, { loading: editDataLoading }] = useMutation(EDIT_NEW_POLL, {
    onCompleted: (response) => {
      if (response) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: response?.editPoll?.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
        !asComponent && history.push(allRoutes.poll)
        onSubmit && onSubmit(response?.editPoll)
      }
    }
  })

  const [getPoll, { data: getDataLoading }] = useLazyQuery(GET_POLL, {
    onCompleted: (data) => {
      if (data && data?.getPollById) {
        reset({
          sTitle: data?.getPollById?.sTitle,
          slides: data?.getPollById?.aSlides?.map((ele) => removeTypeName(ele)),
          dStartDate: data?.getPollById?.dStartDate,
          dEndDate: data?.getPollById?.dEndDate,
          eStatus: data?.getPollById?.eStatus
        })
      }
    }
  })

  function getDefaultValue() {
    return {
      slides: [POLL_SLIDES.sp]
    }
  }

  const handleAddSlide = () => {
    append(POLL_SLIDES.sp)
  }

  const handleDeleteSlide = (index) => {
    remove(index)
  }

  function onAddPoll(data) {
    preparePollData({ ...data })
  }

  function preparePollData(value) {
    const data = mapPollData(value)
    if (id) {
      updatePoll({ variables: { input: { ...data, _id: id } } })
    } else {
      addPoll({ variables: { input: { ...data, eStatus: 's' } } })
    }
    return false
  }

  function mapPollData(value) {
    const data = { ...value }
    data.aSlides = data.slides?.map((ele) => {
      const data = removeTypeId(ele)
      data.aField = data.aField?.map((ele) => removeTypeId(ele, 'aField'))
      return data
    })
    delete data.slides
    return data
  }

  function onSlideChange(type, index) {
    setValue(`slides.${index}`, POLL_SLIDES[type])
    // setValue(`slides.${index}.eSlideType`, slideType[changedSlideIndex])
    clearErrors('slides')
  }

  return (
    <>
      {((!getDataLoading && id) || editDataLoading) && <Loading />}
      <Form className="d-flex flex-column gap-3" onSubmit={handleSubmit(onAddPoll)}>
        <Row>
          <Col lg={8}>
            <CommonInput
              register={register}
              errors={errors}
              className={`${errors?.sTitle && 'error'}`}
              as="input"
              placeholder={useIntl().formatMessage({ id: 'pollTitle' })}
              type="text"
              name="sTitle"
              label="pollTitle"
              required
            />
            <Row>
              <Col md={6}>
                <Form.Group className="form-group">
                  <Form.Label className="d-block">
                    <FormattedMessage id="startTime" />
                  </Form.Label>
                  <Controller
                    name="dStartDate"
                    control={control}
                    defaultValue={new Date(moment().add(5, 'minute').format())}
                    render={({ field: { onChange, value = '' } }) => (
                      <>
                        <DatePicker
                          selected={value}
                          dateFormat="dd-MM-yyyy h:mm aa"
                          onChange={onChange}
                          showTimeSelect
                          timeIntervals={15}
                          minDate={new Date(moment().add(30, 'minute').format())}
                          customInput={<ExampleCustomInput icon="visibility" error={errors.date} />}
                        />
                      </>
                    )}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="form-group">
                  <Form.Label className="d-block">
                    <FormattedMessage id="endTime" />
                  </Form.Label>
                  <Controller
                    name="dEndDate"
                    control={control}
                    defaultValue={new Date(moment().add(1, 'day').add(30, 'minute').format())}
                    render={({ field: { onChange, value = '' } }) => (
                      <>
                        <DatePicker
                          selected={value}
                          dateFormat="dd-MM-yyyy h:mm aa"
                          onChange={onChange}
                          showTimeSelect
                          timeIntervals={15}
                          customInput={<ExampleCustomInput icon="visibility" error={errors.date} />}
                        />
                      </>
                    )}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Col>
          <Col md={10} xl={9}>
            {fields.map((slide, index) => (
              <div key={slide.id} className="position-relative">
                {index > 0 && (
                  <Button variant="danger" onClick={() => handleDeleteSlide(index)} className="dlt-button p-0 position-absolute">
                    <i className="icon-delete d-block" style={{ fontSize: '20px' }}></i>
                  </Button>
                )}
                <PollLayout onSlideChange={(slide) => onSlideChange(slide, index)} defaultTab={slide?.eSlideType}>
                  <SimplePoll
                    type='sp'
                    index={index}
                    errors={errors}
                    control={control}
                    setValue={setValue}
                    watch={watch}
                    register={register}
                    titleInputName="sTitle"
                    aFieldInputName="sTitle"
                  // isQuiz
                  />
                  <ImgPoll
                    type='ip'
                    index={index}
                    errors={errors}
                    control={control}
                    setValue={setValue}
                    values={getValues}
                    register={register}
                    watch={watch}
                    titleInputName="sTitle"
                    aFieldInputName="sTitle"
                  />
                  <MediaPoll
                    type='mp'
                    index={index}
                    errors={errors}
                    control={control}
                    setValue={setValue}
                    values={getValues}
                    register={register}
                    watch={watch}
                    titleInputName="sTitle"
                    aFieldInputName="sTitle"
                  />
                  <VsPoll
                    type='vs'
                    index={index}
                    errors={errors}
                    control={control}
                    setValue={setValue}
                    values={getValues}
                    register={register}
                    watch={watch}
                    titleInputName="sTitle"
                  />
                  <ReactionPoll
                    type='rp'
                    index={index}
                    watch={watch}
                    handleSubmit={handleSubmit}
                    errors={errors}
                    control={control}
                    setValue={setValue}
                    values={getValues}
                    register={register}
                  />
                </PollLayout>
              </div>
            ))}
            <Button className="w-50 mx-auto d-block mt-4" onClick={() => handleAddSlide()}>
              <i className="icon-add me-1" /> Add Slide
            </Button>
          </Col>

          <Button variant="primary" type={'submit'} onClick={handleSubmit(onAddPoll)} className="mt-4">
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : id ? (
              <FormattedMessage id="updatePoll" />
            ) : (
              <FormattedMessage id="createPoll" />
            )}
          </Button>
        </Row>
      </Form>
    </>
  )
}
NewAddPoll.propTypes = {
  pollId: PropTypes.string,
  onSubmit: PropTypes.func,
  asComponent: PropTypes.bool
}
export default NewAddPoll

// eslint-disable-next-line react/prop-types
const ExampleCustomInput = forwardRef(({ value, onClick, icon, error }, ref) => (
  <InputGroup>
    <Form.Control value={value} type="text" ref={ref} onClick={onClick} className={error && 'error'} readOnly />
  </InputGroup>
))
ExampleCustomInput.displayName = ExampleCustomInput
