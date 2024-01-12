import React, { forwardRef, useContext, useEffect, useState } from 'react'
import { Button, Col, Form, InputGroup, Row, Spinner } from 'react-bootstrap'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { FormattedMessage, useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import moment from 'moment'

import CommonInput from 'shared/components/common-input'
import PermissionProvider from 'shared/components/permission-provider'
import { validationErrors } from 'shared/constants/ValidationErrors'
import CountInput from 'shared/components/count-input'
import DisplayAuthor from 'shared/components/article-add-edit-components/display-author'
import MatchTeam from 'shared/components/live-event/match-team'
import { ADD_LIVE_BLOG_EVENT, EDIT_LIVE_EVENT } from 'graph-ql/live-events/mutations'
import { useLazyQuery, useMutation } from '@apollo/client'
import { allRoutes } from 'shared/constants/AllRoutes'
import { GET_LIVE_EVENT_BY_ID } from 'graph-ql/live-events/query'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { getCurrentUser } from 'shared/utils'

function AddEditLiveEvent() {
  const { id } = useParams()
  const history = useHistory()
  const [isNotPermitted, setIsNotPermitted] = useState()
  const { dispatch } = useContext(ToastrContext)
  const currentUser = getCurrentUser()
  const methods = useForm({
    mode: 'all', defaultValues: { sEventStatus: 'u', isCustomMatch: 'none' }
  })
  const {
    register,
    control,
    reset,
    getValues,
    handleSubmit,
    watch,
    formState: { errors }
  } = methods

  const values = getValues()

  const [addEvent, { loading: addEventLoading }] = useMutation(ADD_LIVE_BLOG_EVENT, {
    onCompleted: (data) => {
      if (data && data?.addLiveBlogEvent) {
        history.push(allRoutes.liveEvents)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.addLiveBlogEvent?.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
      }
    }
  })

  const [getLiveEventById, { loading: getLiveEventLoading }] = useLazyQuery(GET_LIVE_EVENT_BY_ID, {
    onCompleted: (data) => {
      if (data && data?.getLiveBlogEventById) {
        setLiveEventData(data?.getLiveBlogEventById)
        setIsNotPermitted((!data?.getLiveBlogEventById?.aEditors?.find((user) => user?._id === currentUser?._id) && id) && (data?.getLiveBlogEventById?.oAuthor?._id !== currentUser?._id) && !currentUser?.bSuperAdmin)
      }
    }
  })

  const setLiveEventData = (data) => {
    const isAuthorExistInEditor = data?.aEditors?.find((user) => user?._id === data?.oAuthor?._id)
    if (!isAuthorExistInEditor) {
      data.aEditors.push(data?.oAuthor)
    }

    const resetInputs = {
      iAuthorDId: data?.aEditors,
      dEventDate: data?.dEventDate,
      dEventEndDate: data?.dEventEndDate,
      sDescription: data?.sDescription,
      sEventName: data?.sEventName,
      sEventStatus: data?.sEventStatus,
      sLocation: data?.sLocation,
      oAuthor: data?.oAuthor
    }
    if (data?.oMatch && data?.oMatch?.iMatchId) {
      reset({
        ...resetInputs,
        isCustomMatch: 'selectMatch',
        oMatch: {
          _id: data?.oMatch?.iMatchId,
          sTitle: data?.oMatch?.sTitle,
          sSubtitle: data?.oMatch?.sSubtitle
        },
        oTeams: null
      })
    } else {
      reset({
        ...resetInputs,
        isCustomMatch: data?.oTeams ? 'manualScore' : 'none',
        oMatch: null,
        oTeams: data?.oTeams
      })
    }
  }

  const [editEvent, { loading: editEventLoading }] = useMutation(EDIT_LIVE_EVENT, {
    onCompleted: (data) => {
      if (data && data?.editLiveBlogEvent) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.editLiveBlogEvent?.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
        history.push(allRoutes.liveEvents)
      }
    }
  })

  useEffect(() => {
    if (id) {
      getLiveEventById({ variables: { input: { _id: id } } })
    }
  }, [id])

  function handleAddEditEvent(data) {
    const input = {
      aEditorsId: data?.iAuthorDId?.map((author) => author?._id),
      dEventDate: data?.dEventDate,
      dEventEndDate: data?.dEventEndDate,
      sDescription: data?.sDescription,
      sEventName: data?.sEventName,
      sEventStatus: data?.sEventStatus,
      iMatchId: data.isCustomMatch === 'selectMatch' ? data?.oMatch?._id : null,
      oTeams: data.isCustomMatch === 'manualScore' ? ({
        oTeamA: {
          sLogoUrl: data?.oTeams?.oTeamA?.sLogoUrl,
          sName: data?.oTeams?.oTeamA?.sName
        },
        oTeamB: {
          sLogoUrl: data?.oTeams?.oTeamB?.sLogoUrl,
          sName: data?.oTeams?.oTeamB?.sName
        }
      }) : null,
      sLocation: data?.sLocation
    }

    const isAuthorExistInEditor = input?.aEditorsId?.find((id) => id === data?.oAuthor?._id)
    if (!isAuthorExistInEditor) {
      input?.aEditorsId.push(data?.oAuthor?._id)
    }

    if (id) {
      editEvent({ variables: { input: { _id: id, ...input } } })
    } else {
      addEvent({ variables: { input: { ...input } } })
    }
  }

  return (
    <FormProvider {...methods} >
      <Form onSubmit={handleSubmit(handleAddEditEvent)}>
        <Row>
          <Col sm="8">
            <Row>
              <Col md={6}>
                <CommonInput
                  label='eventName'
                  type="text"
                  register={register}
                  errors={errors}
                  className={errors.sEventName && 'error'}
                  disabled={isNotPermitted}
                  name="sEventName"
                  validation={{ maxLength: { value: 40, message: validationErrors.maxLength(40) } }}
                  required
                />
              </Col>
              <Col md={6}>
                <Form.Group className="form-group">
                  <CommonInput
                    label='location'
                    type="text"
                    register={register}
                    disabled={isNotPermitted}
                    errors={errors}
                    required
                    name="sLocation"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="form-group radio-group">
                  <Form.Label>
                    <FormattedMessage id="eventStatus" />
                  </Form.Label>
                  <div className="d-flex">
                    <Form.Check
                      {...register('sEventStatus')}
                      value="l"
                      disabled={isNotPermitted}
                      type="radio"
                      label={useIntl().formatMessage({ id: 'live' })}
                      className="mb-0 mt-0"
                      name="sEventStatus"
                      id="Male"
                    />
                    <Form.Check
                      {...register('sEventStatus')}
                      value="u"
                      type="radio"
                      disabled={isNotPermitted}
                      label={useIntl().formatMessage({ id: 'upcoming' })}
                      className="mb-0 mt-0"
                      name="sEventStatus"
                      id="Female"
                    />
                    <Form.Check
                      {...register('sEventStatus')}
                      value="d"
                      type="radio"
                      disabled={isNotPermitted}
                      label={useIntl().formatMessage({ id: 'done' })}
                      className="mb-0 mt-0"
                      name="sEventStatus"
                      id="Other"
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="form-group">
                  <Form.Label className="d-block">
                    <FormattedMessage id="startTime" />
                  </Form.Label>
                  <Controller
                    name="dEventDate"
                    control={control}
                    rules={{ required: validationErrors.required }}
                    defaultValue={new Date(moment().add(30, 'minute').format())}
                    render={({ field: { onChange, value = '' } }) => (
                      <>
                        <DatePicker
                          selected={value}
                          dateFormat="dd-MM-yyyy h:mm aa"
                          onChange={onChange}
                          maxDate={watch('dEventEndDate')}
                          minDate={new Date()}
                          disabled={isNotPermitted}
                          showTimeSelect
                          timeIntervals={15}
                          customInput={<ExampleCustomInput icon="visibility" error={errors.date} />}
                          required
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
                    name="dEventEndDate"
                    control={control}
                    rules={{ required: validationErrors.required }}
                    defaultValue={new Date(moment().add(120, 'minute').format())}
                    render={({ field: { onChange, value = '' } }) => (
                      <>
                        <DatePicker
                          selected={value}
                          dateFormat="dd-MM-yyyy h:mm aa"
                          onChange={onChange}
                          disabled={isNotPermitted}
                          minDate={watch('dEventDate')}
                          showTimeSelect
                          timeIntervals={15}
                          customInput={<ExampleCustomInput icon="visibility" error={errors.date} />}
                        />
                      </>
                    )}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group className="form-group">
                  <Form.Label>
                    <FormattedMessage id="editors" />
                  </Form.Label>
                  <DisplayAuthor
                    className='d-block user d-author-live'
                    placeholder={useIntl().formatMessage({ id: 'editors' })}
                    control={control}
                    type={'lbc'}
                    isMultiple
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <CountInput
                  textarea
                  label={useIntl().formatMessage({ id: 'description' })}
                  name="sDescription"
                  disabled={isNotPermitted}
                  error={errors}
                  register={register('sDescription', { maxLength: { value: 250, message: validationErrors.maxLength(250) } })}
                />
              </Col>
            </Row>
          </Col>
          <Col sm={8}>
            <MatchTeam isNotPermitted={isNotPermitted} control={control} values={values} isLiveEvent />
          </Col>
        </Row>
        <div className="btn-bottom add-border">
          <PermissionProvider isAllowedTo="EDIT_LIVEEVENT">
            <Button
              variant="primary"
              type="submit"
              disabled={addEventLoading || editEventLoading || getLiveEventLoading || isNotPermitted}
            >
              {(addEventLoading || editEventLoading || getLiveEventLoading) && <Spinner animation="border" size="sm" />}
              <FormattedMessage id={id ? 'update' : 'createNewEvent'} />
            </Button>
          </PermissionProvider>
        </div>
      </Form >
    </FormProvider>
  )
}
export default AddEditLiveEvent

// eslint-disable-next-line react/prop-types
const ExampleCustomInput = forwardRef(({ value, onClick, icon, error }, ref) => (
  <InputGroup>
    <Form.Control value={value} type="text" ref={ref} onClick={onClick} className={error && 'error'} readOnly />
  </InputGroup>
))
ExampleCustomInput.displayName = ExampleCustomInput
