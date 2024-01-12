import React, { useContext, useEffect, useRef, useState } from 'react'
import { Button, ButtonGroup, Col, Dropdown, Form, Row, Spinner } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router-dom'
import moment from 'moment'
import Select from 'react-select'

import TinyEditor from 'shared/components/editor'
import { GET_LIVE_EVENTS_CONTENT } from 'graph-ql/live-events/query'
import { ToastrContext } from 'shared/components/toastr'
import { ADD_LIVE_EVENT_CONTENT, EDIT_LIVE_EVENT_CONTENT, LIST_LIVE_BLOG_CONTENT } from 'graph-ql/live-events/mutations'
import { S3_PREFIX, TOAST_TYPE } from 'shared/constants'
import { getCurrentUser, parseParams } from 'shared/utils'
import PermissionProvider from 'shared/components/permission-provider'
import ScheduleModal from 'shared/components/article-add-edit-components/schedule-modal'
import LiveEventSideBar from 'shared/components/live-event/live-event-sidebar'
import EditScore from './edit-score'
import Drawer from 'shared/components/drawer'
import ArticlePreview from 'shared/components/article-add-edit-components/article-preview'
import Img from 'shared/components/image'
import { validationErrors } from 'shared/constants/ValidationErrors'

function AddEditLiveEventsContent() {
  const [eContent, setEContent] = useState({})
  const { dispatch } = useContext(ToastrContext)
  const history = useHistory()
  const params = parseParams(location.search)
  const [isOpen, setIsOpen] = useState(false)
  const currentUser = getCurrentUser()
  const { id } = useParams()
  const [isPermitted, setIsPermitted] = useState(false)
  const [isMatchId, setIsMatchId] = useState()
  const [oTeams, setOTeams] = useState()
  const [payload, setPayload] = useState({ aStatus: ['pb'], iEventId: id, nLimit: 10, nSkip: 1, nOrder: -1, sSortBy: 'dCreated' })
  const [content, setContent] = useState([])
  const [authorsList, setAuthorsList] = useState([])
  const lastTotal = useRef(0)
  const isLoading = useRef(false)
  const [titleValidation, setTitleValidation] = useState(validationErrors.required)

  const methods = useForm({ mode: 'all' })

  const MATCH_STATUS = [
    { value: 'prem', label: 'Pre Match' },
    { value: 'posm', label: 'Post Match' },
    { value: 'l', label: 'Live' },
    { value: 'ib', label: 'Innings Break' },
    { value: 'd', label: 'Match Delay' }
  ]

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    getValues,
    watch,
    reset,
    clearErrors
  } = methods

  const values = getValues()
  const pollId = watch('iPollId')

  const [getLiveBlogContent] = useLazyQuery(GET_LIVE_EVENTS_CONTENT, {
    onCompleted: (data) => {
      if (data && data?.getLiveBlogContent) {
        resetFormData(data?.getLiveBlogContent)
        setEContent(data?.getLiveBlogContent)
      }
    }
  })

  const handleSearch = (data) => {
    setPayload({ ...payload, sSearch: data, nSkip: 1 })
  }

  const { loading } = useQuery(LIST_LIVE_BLOG_CONTENT, {
    variables: { input: payload },
    onCompleted: (data) => {
      if (data && data?.listLiveBlogContent?.aResults) {
        const listData = data?.listLiveBlogContent?.aResults
        if (isLoading.current) {
          setContent([...content, ...listData])
        } else {
          setContent(listData)
        }
        const loggedInEditor = data?.listLiveBlogContent?.oEvent?.aEditors?.find((user) => user?._id === currentUser?._id)
        setAuthorsList(data?.listLiveBlogContent?.oEvent.aEditors)
        reset({ iAuthorDId: loggedInEditor || data?.listLiveBlogContent?.oEvent?.oAuthor })
        setIsPermitted(!loggedInEditor && data?.listLiveBlogContent?.oEvent?.oAuthor?._id !== currentUser?._id && !currentUser?.bSuperAdmin)
        setIsMatchId(data?.listLiveBlogContent?.oEvent?.oMatch?.iMatchId)
        setOTeams(data?.listLiveBlogContent?.oEvent?.oTeams)
        isLoading.current = false
        lastTotal.current = data?.listLiveBlogContent?.aResults?.length
      }
    }
  })

  const [addContent, { loading: contentIsLoading }] = useMutation(ADD_LIVE_EVENT_CONTENT, {
    onCompleted: (data) => {
      if (data && data.addLiveBlogContent) {
        const { oData, sMessage } = data.addLiveBlogContent
        resetFormData({})
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
        setEContent({ eType: 'new', oData, eStatus: oData?.eStatus === 'pb' ? 'pb' : 'dr,s' })
        setTimeout(() => {
          clearErrors('sContent')
        }, 0)
      }
    }
  })

  const [editLiveContent, { loading: editLiveContentLoading }] = useMutation(EDIT_LIVE_EVENT_CONTENT, {
    onCompleted: (data) => {
      if (data && data.editLiveBlogContent) {
        const { oData, sMessage } = data.editLiveBlogContent
        resetFormData({})
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
        setEContent({ eType: 'edit', oData, eStatus: oData?.eStatus === 'pb' ? 'pb' : 'dr,s' })
        setTimeout(() => {
          clearErrors('sContent')
        }, 0)
        history.push({ editContent: '' })
      }
    }
  })

  useEffect(() => {
    if (params?.editContent) {
      getLiveBlogContent({ variables: { input: { _id: params?.editContent } } })
    }
  }, [params?.editContent])

  const handleEditCancel = () => {
    reset({ content: '' })
    history.push({ search: '' })
  }

  const onAddEvent = (data, eStatus, eType) => {
    const input = {
      ...data,
      eStatus,
      iEventId: id,
      iDisplayAuthorId: data?.iAuthorDId?._id,
      eType: !data.sTitle && data?.iPollId ? 'poll' : eType,
      iPollId: data?.iPollId,
      eMatchStatus: data?.eMatchStatus?.value
    }

    input.eStatus = eStatus
    delete input['social-url-preview']
    if (eStatus !== 's') input.dPublishDate = moment.utc(new Date()).format()
    delete input?.iAuthorDId

    if (params.editContent) {
      delete input?.iEventId
      input.dPublishDate = data?.dPublishDate
      editLiveContent({ variables: { input: { _id: params.editContent, ...input } } })
    } else {
      addContent({ variables: { input: { ...input } } })
    }
  }

  function resetFormData(data) {
    reset({
      eStatus: data?.eStatus,
      sTitle: data?.sTitle || '',
      dPublishDate: data?.dPublishDate,
      iAuthorDId: data?.oAuthor || currentUser,
      sContent: data?.sContent || '',
      iPollId: data?.oPoll?._id || undefined,
      eMatchStatus: data?.eMatchStatus ? MATCH_STATUS?.filter(e => e?.value === data?.eMatchStatus)[0] : ''
    })
  }

  useEffect(() => {
    if (pollId) setTitleValidation(false)
    else setTitleValidation(validationErrors.required)
  }, [pollId])

  return (
    <Row>
      {/* {seoDataLoading && <Loading />} */}
      <Col sm="12" md="7">
        <FormProvider {...methods}>
          <Form onSubmit={handleSubmit(onAddEvent)}>
            <Row>
              <Col xs={12}>
                <Form.Group className="form-group">
                  <Form.Control
                    type="text"
                    name="sTitle"
                    placeholder='Title'
                    className={errors?.sTitle && 'error'}
                    {...register('sTitle', {
                      required: titleValidation,
                      maxLength: { value: 100, message: validationErrors.maxLength(100) }
                    })}
                    disabled={isPermitted}
                  />
                  {errors?.sTitle && (
                    <Form.Control.Feedback type="invalid">{errors?.sTitle?.message}</Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="form-group">
                  <Controller
                    name="iAuthorDId"
                    control={control}
                    render={({ field: { onChange, value = {} } }) => {
                      return (
                        <Select
                          value={value}
                          options={authorsList}
                          getOptionLabel={(option) => option.sFName}
                          getOptionValue={(option) => option._id}
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
                          placeholder={'Select Author'}
                          onChange={onChange}
                        />
                      )
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="form-group">
                  <Controller
                    name="eMatchStatus"
                    control={control}
                    rules={{ required: validationErrors.required }}
                    render={({ field: { onChange, value = {} } }) => {
                      return (
                        <Select
                          value={value?.value ? value : ''}
                          options={MATCH_STATUS}
                          isSearchable={false}
                          className={`react-select ${errors?.eMatchStatus && 'error'}`}
                          classNamePrefix="select"
                          placeholder={<FormattedMessage id="selectMatchStatus" />}
                          onChange={onChange}
                        />
                      )
                    }}
                  />
                  {errors?.eMatchStatus && <Form.Control.Feedback type="invalid">{errors?.eMatchStatus?.message}</Form.Control.Feedback>}
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="form-group live-events-editor">
              <TinyEditor
                className={`form-control ${errors.sContent && 'error'}`}
                name="sContent"
                control={control}
                register={register}
                values={getValues}
                setValue={setValue}
                error={errors?.sContent?.message}
                required
                isLiveArticle
              />
            </Form.Group>
            <div className="btn-bottom add-border mt-2 d-flex align-items-center gap-2">
              <Dropdown as={ButtonGroup}>
                <PermissionProvider isAllowedTo="EDIT_LIVEEVENT">
                  <Button variant="primary" disabled={isPermitted} type="submit" onClick={handleSubmit((d) => onAddEvent(d, 'pb', 'ct'))}>
                    <FormattedMessage id={`${params.editContent && watch('eStatus') !== 'dr' ? 'updateContent' : 'publish'}`} />
                    {(contentIsLoading || editLiveContentLoading) && <Spinner animation="border" size="sm" />}
                  </Button>
                </PermissionProvider>
                {(!params.editContent || (params?.editContent && watch('eStatus') === 's') || watch('eStatus') === 'dr') && (
                  <PermissionProvider isAllowedTo="EDIT_LIVEEVENT">
                    <Dropdown.Toggle split variant="primary" disabled={isPermitted} />
                    <Dropdown.Menu>
                      <ScheduleModal
                        setValue={setValue}
                        formSubmit={onAddEvent}
                        articleSubmit={handleSubmit}
                        defaultValue={watch('dPublishDate')}
                      />
                      <Dropdown.Item onClick={handleSubmit((d) => onAddEvent(d, 'dr', 'ct'))}>
                        <FormattedMessage id="saveDraft" />
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </PermissionProvider>
                )}
              </Dropdown>
              <Button variant="secondary" disabled={isPermitted} onClick={() => setIsOpen(true)}>
                <FormattedMessage id="preview" />
              </Button>
              {params.editContent ? (
                <Button variant="outline-secondary" disabled={isPermitted} onClick={handleEditCancel}>
                  <FormattedMessage id="Cancel" />
                </Button>
              ) : null}
            </div>
          </Form>
          {!isMatchId && oTeams && (
            <EditScore oTeams={oTeams} isMatchId={isMatchId} isNotPermitted={isPermitted} values={values} setPayload={setPayload} />
          )}
        </FormProvider>
      </Col>
      <Col sm="12" md="5" className="mt-4 mt-md-0">
        <LiveEventSideBar
          eContent={eContent}
          setIsPermitted={setIsPermitted}
          isPermitted={isPermitted}
          lastTotal={lastTotal}
          isLoading={isLoading}
          loading={loading}
          setContent={setContent}
          content={content}
          payload={payload}
          handleSearch={handleSearch}
          setPayload={setPayload}
        />
      </Col>
      <Drawer className="article-preview" isOpen={isOpen} onClose={() => setIsOpen(!isOpen)} title={<FormattedMessage id="preview" />}>
        <ArticlePreview liveEventId={id} />
      </Drawer>
    </Row>
  )
}

export default AddEditLiveEventsContent
