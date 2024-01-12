import React, { forwardRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, ButtonGroup, Col, Dropdown, Form, InputGroup, Modal, Row, Spinner } from 'react-bootstrap'
import PermissionProvider from 'shared/components/permission-provider'
import { FormattedMessage, useIntl } from 'react-intl'
import CommonInput from '../common-input'
import DatePicker from 'react-datepicker'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { getCurrentUser, parseParams } from 'shared/utils'
import ScheduleModal from 'shared/components/article-add-edit-components/schedule-modal'
import moment from 'moment'
import { useLazyQuery } from '@apollo/client'
import { GET_LIVE_EVENTS_CONTENT } from 'graph-ql/live-events/query'
import Img from '../image'
import { S3_PREFIX } from 'shared/constants'
import Select from 'react-select'

function CreatePoll({ authorsList, isShowing, toggle, handleCancel, eventId, addContent, editLiveContent, isLoading, isPermitted }) {
  const currentUser = getCurrentUser()
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    watch,
    formState: { errors }
  } = useForm({ defaultValues: { oPoll: getDefaultValue(), iAuthorDId: currentUser } })
  const params = parseParams(location.search)

  const [getLiveBlogContent] = useLazyQuery(GET_LIVE_EVENTS_CONTENT, {
    onCompleted: (data) => {
      if (data && data?.getLiveBlogContent) {
        reset({
          dPublishDate: data?.getLiveBlogContent?.oPoll?.dStartDate,
          eStatus: data?.getLiveBlogContent?.eStatus,
          dEndDate: data?.getLiveBlogContent?.oPoll?.dEndDate,
          dStartDate: data?.getLiveBlogContent?.oPoll?.dStartDate,
          sTitle: data?.getLiveBlogContent?.sTitle || '',
          iAuthorDId: data?.getLiveBlogContent?.oAuthor || currentUser,
          oPoll: data?.getLiveBlogContent?.oPoll
        })
        if (data?.getLiveBlogContent?.eType === 'poll') {
          toggle()
        }
      }
    }
  })
  function closeModal() {
    reset({ oPoll: getDefaultValue() })
    handleCancel()
  }

  useEffect(() => {
    if (params?.editPoll) {
      getLiveBlogContent({ variables: { input: { _id: params?.editPoll } } })
    }
  }, [params?.editPoll])

  function getDefaultValue() {
    return { sTitle: '', aField: [{ sTitle: '' }, { sTitle: '' }] }
  }

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'oPoll.aField'
  })

  const onAddPoll = (data, eStatus) => {
    let totalVote = 0
    const pollData = {
      eStatus,
      iEventId: eventId,
      eType: 'poll',
      iDisplayAuthorId: data?.iAuthorDId?._id,
      oPoll: {
        dStartDate: data.dPublishDate || moment.utc(new Date()).format(),
        dEndDate: data?.dEndDate,
        aField: data?.oPoll?.aField?.map((field) => {
          totalVote = parseInt(totalVote) + parseInt(field?.nVote || 0)
          if (field?._id) {
            return {
              sTitle: field?.sTitle,
              _id: field?._id,
              nVote: field?.nVote || 0
            }
          } else {
            return {
              sTitle: field?.sTitle,
              nVote: field?.nVote || 0
            }
          }
        }),
        _id: data?.oPoll?._id || ''
      },
      sTitle: data?.oPoll?.sTitle
    }
    delete pollData?.iAuthorDId
    if (params?.editPoll) {
      delete pollData?.iEventId
      // delete pollData?.dPublishDate
      pollData.oPoll.dStartDate = eStatus === 's' ? data?.dPublishDate : pollData.oPoll.dStartDate
      editLiveContent({ variables: { input: { _id: params?.editPoll, ...pollData } } }).then(closeModal)
    } else {
      delete pollData?.oPoll?._id
      addContent({ variables: { input: { ...pollData } } }).then(closeModal)
    }
  }
  return (
    <Modal show={isShowing} centered>
      <Modal.Header>
        <h4 className="m-0 text-uppercase">
          <FormattedMessage id="poll" />
        </h4>
      </Modal.Header>
      <Form className='d-flex flex-column gap-3' onSubmit={handleSubmit(onAddPoll)}>
        <Modal.Body>
          <Row>
            <Col md={8}>
              <CommonInput
                register={register}
                errors={errors}
                className={`${errors?.oPoll?.sTitle && 'error'}`}
                disabled={isPermitted}
                as='input'
                placeholder={useIntl().formatMessage({ id: 'pollTitle' })}
                type="text"
                name="oPoll.sTitle"
                required
              />
            </Col>
            <Col md={4}>
              <Controller
                name="iAuthorDId"
                control={control}
                render={({ field: { onChange, value = [] } }) => {
                  return (
                  <Select
                    value={value}
                    options={authorsList}
                    getOptionLabel={(option) => option.sFName}
                    getOptionValue={(option) => option._id }
                    className={'react-select display-author on-hover arrow d-block user d-author-live'}
                    classNamePrefix="select"
                    formatOptionLabel={(user) => (
                      <div className="country-option">
                        {user.sUrl ? <Img src={S3_PREFIX + user.sUrl} alt={user.sFName} /> : <i className="icon-account-fill no-img" />}
                        <span>{user.sFName}</span>
                      </div>
                    )}
                    menuIsOpen
                    isSearchable={true}
                    onChange={onChange}
                  />
                  )
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Form.Group className="form-group">
                  <Form.Label className="d-block">
                    <FormattedMessage id="endTime" />
                  </Form.Label>
                  <Controller
                    name="dEndDate"
                    control={control}
                    defaultValue={new Date(moment().add(30, 'minute').format())}
                    render={({ field: { onChange, value = '' } }) => (
                      <>
                        <DatePicker
                          selected={value}
                          dateFormat="dd-MM-yyyy h:mm aa"
                          onChange={onChange}
                          disabled={isPermitted}
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
          <div className='d-flex flex-column'>
            <Form.Label className='text-uppercase'>
              <FormattedMessage id="pollOptions" />*
            </Form.Label>
            {
              fields?.map((field, i) => {
                return (
                  <div key={i} className='d-flex align-items-start gap-1'>
                    <CommonInput
                      register={register}
                      disabled={isPermitted}
                      errors={errors}
                      className={errors?.oPoll?.pollOptions?.[`${i}`]?.sTitle && 'error'}
                      placeholder={`${i + 1}`}
                      as='input'
                      type="text"
                      name={`oPoll.aField[${i}].sTitle`}
                      required
                    />
                    {
                      fields?.length > 2 && <Button disabled={isPermitted} variant="link" className="square icon-btn mt-1" onClick={() => remove(i)}>
                        <i className="icon-delete d-block" />
                      </Button>
                    }
                  </div>
                )
              })
            }
          </div>
          <Button disabled={fields?.length >= 5 || isPermitted} className="w-100" size="md" variant="secondary" onClick={() => append({ option: '' })}>
            + <FormattedMessage id="addOption" />
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button size="md" variant="secondary" onClick={closeModal}>
            <FormattedMessage id="cancel" />
          </Button>
          <Dropdown as={ButtonGroup}>
            <PermissionProvider isAllowedTo="EDIT_LIVEEVENT">
              <Button variant="primary" disabled={isPermitted} type='submit' onClick={handleSubmit((d) => onAddPoll(d, 'pb'))}>
                {(isLoading) ? <Spinner animation="border" size="sm" /> : <FormattedMessage id={`${params.editPoll ? 'updatePoll' : 'createPoll'}`} />}
              </Button>
            </PermissionProvider>
            {
              (!params?.editPoll || (params?.editPoll && watch('eStatus') === 's')) && (
                <PermissionProvider isAllowedTo="EDIT_LIVEEVENT">
                  <Dropdown.Toggle split variant="primary" disabled={isPermitted}/>
                  <Dropdown.Menu>
                    <ScheduleModal defaultValue={watch('dStartDate')} setValue={setValue} formSubmit={onAddPoll} articleSubmit={handleSubmit} />
                    <Dropdown.Item onClick={handleSubmit((d) => onAddPoll(d, 'dr'))}><FormattedMessage id='saveDraft' /></Dropdown.Item>
                  </Dropdown.Menu>
                </PermissionProvider>
              )
            }
          </Dropdown>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

CreatePoll.propTypes = {
  authorsList: PropTypes.array,
  isShowing: PropTypes.bool,
  isLoading: PropTypes.bool,
  isPermitted: PropTypes.bool,
  eventId: PropTypes.string,
  handleCancel: PropTypes.func,
  toggle: PropTypes.func,
  setValue: PropTypes.func,
  onAddEvent: PropTypes.func,
  addContent: PropTypes.func,
  editLiveContent: PropTypes.func
}

export default CreatePoll

// eslint-disable-next-line react/prop-types
const ExampleCustomInput = forwardRef(({ value, onClick, icon, error }, ref) => (
  <InputGroup>
    <Form.Control value={value} type="text" ref={ref} onClick={onClick} className={error && 'error'} readOnly />
  </InputGroup>
))
ExampleCustomInput.displayName = ExampleCustomInput
