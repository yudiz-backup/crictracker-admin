import React, { useState, useEffect, useContext } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { GET_JOB_BY_ID } from 'graph-ql/settings/job-post/query'
import { ADD_JOB, EDIT_JOB } from 'graph-ql/settings/job-post/mutation'
import { Form, Row, Col, Button, Spinner } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useIntl, FormattedMessage } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'

import AddEditJobPost from 'shared/components/add-edit-job-post'
import TinyEditor from 'shared/components/editor'
import { OPENING_IN_JOB, DESIGNATION_IN_JOB, TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { allRoutes } from 'shared/constants/AllRoutes'
import CommonSEO from 'shared/components/common-seo'
import SeoMutation from 'shared/components/common-seo/seo-mutation'
import { removeTypeName } from 'shared/utils'

function AddEditJobPostView() {
  const { id, type } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const [name, setName] = useState()
  const [jobData, setJobData] = useState()
  const { data: seoSuccess, uploadData, loading: seoLoading } = SeoMutation()

  const history = useHistory()
  const {
    handleSubmit,
    reset,
    setValue,
    control,
    register,
    formState: { errors },
    watch,
    getValues,
    setError,
    clearErrors
  } = useForm({ mode: 'all' })

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteAllItem' })
  }
  const [getJob, { data, loading: getJobByIdLoader }] = useLazyQuery(GET_JOB_BY_ID, {
    onCompleted: (data) => {
      if (data && data.getJobById) {
        setJobData(data.getJobById)
        !jobData && setJobValue(data.getJobById)
      }
    }
  })
  const [addJob, { loading: addJobLoader }] = useMutation(ADD_JOB, {
    onCompleted: (data) => {
      if (data && data.addJob) {
        uploadData(getValues().oSeo, 'jo', data.addJob.oData._id, false, {
          query: GET_JOB_BY_ID,
          variable: { input: { _id: data.addJob.oData._id } },
          getKeyName: 'getJobById'
        })
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.addJob.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  const [editJob, { loading: editJobLoader }] = useMutation(EDIT_JOB, {
    onCompleted: (data) => {
      if (data && data.editJob) {
        uploadData(getValues().oSeo, 'jo', data.editJob.oData._id, true, {
          query: GET_JOB_BY_ID,
          variable: { input: { _id: data.editJob.oData._id } },
          getKeyName: 'getJobById'
        })
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editJob.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  useEffect(() => {
    id && getJob({ variables: { input: { _id: id } } })
  }, [id])

  useEffect(() => {
    if (seoSuccess) {
      history.push(allRoutes.jobPost)
    }
  }, [seoSuccess])

  function prepareJobData(value) {
    const inputValue = {
      eDesignation: value?.eDesignation?.value,
      sTitle: value?.sTitle,
      iLocationId: value?.oLocation._id,
      eOpeningFor: value?.eOpeningFor?.value,
      fExperienceFrom: Number(value?.fExperienceFrom),
      fExperienceTo: Number(value?.fExperienceTo),
      fSalaryFrom: Number(value?.fSalaryFrom),
      fSalaryTo: Number(value?.fSalaryTo),
      nOpenPositions: Number(value?.nOpenPositions),
      sDescription: value?.sDescription
    }
    if (id) {
      editJob({ variables: { input: { jobInput: inputValue, _id: id } } })
    } else {
      addJob({ variables: { input: { jobInput: inputValue } } })
    }
  }

  function setJobValue(value) {
    reset({
      eDesignation: DESIGNATION_IN_JOB.filter((d) => d.value === value?.eDesignation)[0],
      sTitle: value?.sTitle,
      oLocation: value?.oLocation,
      eOpeningFor: OPENING_IN_JOB.filter((d) => d.value === value?.eOpeningFor)[0],
      fExperienceFrom: value?.fExperienceFrom,
      fExperienceTo: value?.fExperienceTo,
      fSalaryFrom: value?.fSalaryFrom,
      fSalaryTo: value?.fSalaryTo,
      nOpenPositions: value?.nOpenPositions,
      sDescription: value?.sDescription,
      oSeo: {
        sTitle: value?.oSeo?.sTitle,
        sSlug: value?.oSeo?.sSlug,
        sDescription: value?.oSeo?.sDescription,
        aKeywords: value?.oSeo?.aKeywords ? value.oSeo.aKeywords.join(', ') : '',
        sCUrl: value?.oSeo?.sCUrl,
        sRobots: value?.oSeo?.sRobots,
        oFB: value.oSeo ? removeTypeName(value.oSeo.oFB) : '',
        oTwitter: value.oSeo ? removeTypeName(value.oSeo.oTwitter) : ''
      }
    })
  }
  const onAddEditJob = (data) => {
    prepareJobData(data)
  }

  function handleUpdateData(data) {
    setJobData(data)
  }

  return (
    <>
      <Form onSubmit={handleSubmit(onAddEditJob)}>
        <Row>
          <Col sm="12">
            <AddEditJobPost
              data={data && data?.getJobById}
              handleSubmit={handleSubmit}
              reset={reset}
              setValue={setValue}
              control={control}
              register={register}
              value={getValues()}
              errors={errors}
              watch={watch}
              nameChanged={(e) => setName(e)}
            />
          </Col>
          <Col sm="12">
            <Form.Group className="form-group">
              <Form.Label>
                <FormattedMessage id="jobDescription" />*
              </Form.Label>
              {type === 'detail-job' ? (
                <div dangerouslySetInnerHTML={{ __html: jobData?.sDescription }} />
              ) : (
                <>
                  <TinyEditor
                    className="form-control"
                    name="sDescription"
                    control={control}
                    initialValue={jobData?.sDescription}
                    required
                  />
                  {errors.sDescription && <Form.Control.Feedback type="invalid">{errors.sDescription.message}</Form.Control.Feedback>}
                </>
              )}
            </Form.Group>
          </Col>
          <Col sm="12">
            <CommonSEO
              register={register}
              errors={errors}
              values={getValues()}
              setError={setError}
              clearErrors={clearErrors}
              previewURL={jobData?.oSeo?.oFB?.sUrl || jobData?.oSeo?.oTwitter?.sUrl}
              fbImg={jobData?.oSeo?.oFB?.sUrl}
              twitterImg={jobData?.oSeo?.oTwitter?.sUrl}
              setValue={setValue}
              control={control}
              slugType="jo"
              slug={name ? `${allRoutes.careers}${name}` : undefined}
              id={id}
              hidden
              disabled={type === 'detail-job'}
              defaultData={jobData}
              categoryURL={allRoutes.careers}
              // removeParentCategory={true}
              onUpdateData={(e) => handleUpdateData(e)}
            />
          </Col>
        </Row>
        {type !== 'detail-job' && (
          <div className="btn-bottom add-border mt-4">
            <Button
              variant="outline-secondary"
              onClick={() => {
                history.push(allRoutes.jobPost)
              }}
            >
              <FormattedMessage id="cancel" />
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="m-2"
              disabled={addJobLoader || editJobLoader || getJobByIdLoader || seoLoading}
            >
              <FormattedMessage id={id ? 'update' : 'add'} />
              {(addJobLoader || editJobLoader || getJobByIdLoader || seoLoading) && <Spinner animation="border" size="sm" />}
            </Button>
          </div>
        )}
      </Form>
    </>
  )
}

export default AddEditJobPostView
