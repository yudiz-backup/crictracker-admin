import React, { useContext, useEffect, useState } from 'react'
import { Button, Form, ListGroup, Spinner } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useHistory, useParams } from 'react-router'
import { useLazyQuery, useMutation } from '@apollo/client'

import StepOne from 'shared/components/user-steps/StepOne'
import StepTwo from 'shared/components/user-steps/StepTwo'
import CommonSEO from 'shared/components/common-seo'
import { ADD_USER, GET_USER, EDIT_USER } from 'graph-ql/settings/user'
import { getPreSignedData, uploadImage } from 'shared/functions/PreSignedData'
import { GENERATE_PRE_SIGNED } from 'graph-ql/generate-pre-signed-url'
import { encryption, scrollTop, removeTypeName } from 'shared/utils'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { allRoutes } from 'shared/constants/AllRoutes'
import { FormattedMessage } from 'react-intl'
import SeoMutation from 'shared/components/common-seo/seo-mutation'
import UpdateCache from 'shared/components/cache/updateCache'
import AddCache from 'shared/components/cache/addCache'

function AddEditUser() {
  const { id } = useParams()
  const [step, setStep] = useState(1)
  const [userData, setUserData] = useState({})
  const [formData, setFormData] = useState({})
  const history = useHistory()
  const { dispatch } = useContext(ToastrContext)
  const { data: seoSuccess, uploadData, loading: seoLoading } = SeoMutation()
  const { updateCacheData } = UpdateCache()
  const { addCacheData } = AddCache()

  const {
    register: stepOneField,
    handleSubmit: stepOneSubmit,
    formState: { errors: stepOneErrors },
    watch,
    setValue,
    getValues: stepOneValue,
    setError: setStepOneError,
    clearErrors: clearStepOneError,
    reset: resetStepOne,
    control: stepOneControl
  } = useForm({ mode: 'all', defaultValues: { sProfilePicture: '' } })

  const {
    register: stepTwoField,
    handleSubmit: stepTwoSubmit,
    formState: { errors: stepTwoErrors },
    control,
    trigger,
    setValue: setStepTwoValue,
    getValues: stepTwoValue,
    setError: setStepTwoError,
    clearErrors: clearStepTwoError,
    reset: resetStepTwo
  } = useForm({
    mode: 'all',
    defaultValues: {
      sPanPicture: '',
      sBankDetailPic: '',
      aSocialProfiles: [{ eSocialNetworkType: '', sDisplayName: '', sLink: '' }]
    }
  })

  const {
    register: stepThreeField,
    handleSubmit: stepThreeSubmit,
    getValues: stepThreeValue,
    formState: { errors: stepThreeErrors },
    setError: setStepThreeError,
    clearErrors: clearStepThreeError,
    setValue: setStepThreeValue,
    reset: resetStepThree,
    control: stepThreeControl
  } = useForm({
    mode: 'all',
    defaultValues: {
      oFB: { sUrl: '' },
      oTwitter: { sUrl: '' },
      sCustomSlug: ''
    }
  })
  const [addUser, { loading }] = useMutation(ADD_USER, {
    onCompleted: (data) => {
      if (data && data?.createSubAdmin) {
        uploadData(stepThreeValue().oSeo, 'ad', data.createSubAdmin.oData._id, false, {
          query: GET_USER,
          variable: { input: { _id: data.createSubAdmin.oData._id } },
          getKeyName: 'getSubAdmin'
        })
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.createSubAdmin.sMessage, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
      }
    },
    update: (cache, { data }) => {
      data?.createSubAdmin &&
        addCacheData(GET_USER, { input: { _id: data?.createSubAdmin.oData._id } }, data?.createSubAdmin?.oData, 'getSubAdmin')
    }
  })

  const [editUser, { loading: editLoading }] = useMutation(EDIT_USER, {
    onCompleted: (data) => {
      if (data && data?.editSubAdmin) {
        uploadData(stepThreeValue().oSeo, 'ad', id, true, { query: GET_USER, variable: { input: { _id: id } }, getKeyName: 'getSubAdmin' })
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editSubAdmin.sMessage, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
      }
    },
    update: (cache, { data }) => {
      data?.editSubAdmin && updateCacheData(GET_USER, { input: { _id: id } }, data?.editSubAdmin?.oData, 'getSubAdmin')
    }
  })

  const [generatePreSignedUrl, { loading: isImgUploading }] = useMutation(GENERATE_PRE_SIGNED, {
    onCompleted: (data) => {
      if (data) {
        const urls = data.generatePreSignedUrl
        const uploadData = []
        const allData = formData
        urls.forEach((item) => {
          if (item.sType === 'profile') {
            uploadData.push({ sUploadUrl: item.sUploadUrl, file: allData.sProfilePicture.files[0] })
            allData.sProfilePicture = item.sS3Url
          } else if (item.sType === 'pan') {
            uploadData.push({ sUploadUrl: item.sUploadUrl, file: allData.sPanPicture[0] })
            allData.sPanPicture = item.sS3Url
          } else {
            uploadData.push({ sUploadUrl: item.sUploadUrl, file: allData.sBankDetailPic[0] })
            allData.sBankDetailPic = item.sS3Url
          }
        })
        uploadImage(uploadData)
          .then((res) => {
            prepareUserData(allData)
          })
          .catch((err) => {
            console.log('err', err)
          })
      }
    }
  })

  const [getSubAdmin] = useLazyQuery(GET_USER, {
    onCompleted: (data) => {
      if (data && data.getSubAdmin) {
        setUserData(data.getSubAdmin)
        prepareStepData(data.getSubAdmin)
      }
    }
  })

  useEffect(() => {
    if (seoSuccess) {
      history.push(allRoutes.subAdmins)
    }
  }, [seoSuccess])

  useEffect(() => {
    if (id) {
      getSubAdmin({ variables: { input: { _id: id } } })
    }
  }, [id])

  function changeStep(number, data) {
    setStep(number)
    setFormData({ ...formData, ...data })
    scrollTop()
  }

  function onAddUser(formValue) {
    const { value, data } = getPreSignedData(formData)
    setFormData(data)
    if (
      (data.sProfilePicture && data.sProfilePicture.files && data.sProfilePicture.files[0] instanceof File) ||
      (data.sPanPicture && data.sPanPicture[0] instanceof File) ||
      (data.sBankDetailPic && data.sBankDetailPic[0] instanceof File)
    ) {
      generatePreSignedUrl({ variables: { generatePreSignedUrlInput: value } })
    } else {
      prepareUserData(data)
    }
  }

  function prepareUserData(value) {
    const data = JSON.parse(JSON.stringify(value))
    // encrypt fields
    if (!id) {
      data.sPassword = encryption(data.sPassword)
      data.sConfirmPassword = encryption(data.sConfirmPassword)
    }
    data.sAccountNumber = data.sAccountNumber ? encryption(data.sAccountNumber) : ''
    // Check Images url updated Or not
    if (id) {
      if (data.sProfilePicture === '') data.sProfilePicture = userData.sUrl
      if (data.sPanPicture === '') data.sPanPicture = userData.oKyc && userData.oKyc.sUrl
      if (data.sBankDetailPic === '') data.sBankDetailPic = userData.oKyc && userData.oKyc.sBankDetailPic
    }
    delete data.pan
    delete data.profile
    delete data.bank
    id ? editUser({ variables: { input: { _id: id, ...data } } }) : addUser({ variables: { input: data } })
  }

  function prepareStepData(data) {
    resetStepOne({
      sFullName: data.sFName,
      sDisplayName: data.sDisplayName,
      sEmail: data.sEmail,
      sNumber: data.sNumber,
      bIsVerified: data.bIsVerified,
      eDesignation: data.eDesignation,
      sCity: data.sCity,
      eGender: data.eGender,
      sAddress: data.sAddress,
      sBio: data.sBio,
      sUserName: data.sUName,
      sProfilePicture: ''
    })
    let aSLinks
    if (data.aSLinks.length) {
      aSLinks = data.aSLinks.map((item) => {
        return { eSocialNetworkType: item.eSocialNetworkType, sDisplayName: item.sDisplayName, sLink: item.sLink }
      })
    }
    resetStepTwo({
      sPanName: data.oKyc && data.oKyc.sPName ? data.oKyc.sPName : '',
      sIfsc: data.oKyc && data.oKyc.sIfsc ? data.oKyc.sIfsc : '',
      sAccountNumber: data.oKyc && data.oKyc.sANumber ? data.oKyc.sANumber : '',
      sAccountName: data.oKyc && data.oKyc.sAName ? data.oKyc.sAName : '',
      aSocialProfiles: data.aSLinks.length ? aSLinks : [{ eSocialNetworkType: '', sDisplayName: '', sLink: '' }],
      sPanPicture: '',
      sPanNumber: data.oKyc && data.oKyc.sPanNumber ? data.oKyc.sPanNumber : '',
      sBankDetailPic: '',
      sBankName: data.oKyc && data.oKyc.sBankName ? data.oKyc.sBankName : '',
      sBranchName: data.oKyc && data.oKyc.sBranchName ? data.oKyc.sBranchName : '',
      bIsCustom: data.bIsCustom || false
    })
    resetStepThree({
      oSeo: {
        sTitle: data.oSeo && data.oSeo.sTitle ? data.oSeo.sTitle : '',
        sSlug: data.oSeo && data.oSeo.sSlug ? data.oSeo.sSlug : '',
        sDescription: data.oSeo && data.oSeo.sDescription ? data.oSeo.sDescription : '',
        aKeywords: data.oSeo && data.oSeo.aKeywords ? data.oSeo.aKeywords.join(', ') : '',
        sCUrl: data.oSeo && data.oSeo.sCUrl ? data.oSeo.sCUrl : '',
        sRobots: data.oSeo && data.oSeo.sRobots ? data.oSeo.sRobots : '',
        oFB: data.oSeo ? removeTypeName(data.oSeo.oFB) : '',
        oTwitter: data.oSeo ? removeTypeName(data.oSeo.oTwitter) : ''
      }
    })
  }

  function handleUpdateData(data) {
    setUserData(data)
  }

  return (
    <>
      <div className="stepper d-flex justify-content-center justify-content-lg-end">
        <ListGroup horizontal as="ul">
          <ListGroup.Item as="li" active={step === 1}>
            <FormattedMessage id="personalInfo" />{' '}
          </ListGroup.Item>
          <ListGroup.Item as="li" active={step === 2}>
            <FormattedMessage id="otherDetails" />{' '}
          </ListGroup.Item>
          <ListGroup.Item as="li" active={step === 3}>
            <FormattedMessage id="seo" />{' '}
          </ListGroup.Item>
        </ListGroup>
      </div>
      <div className="user-container">
        <StepOne
          nextStep={changeStep}
          register={stepOneField}
          submit={stepOneSubmit}
          watch={watch}
          errors={stepOneErrors}
          setValue={setValue}
          values={stepOneValue()}
          setError={setStepOneError}
          clearErrors={clearStepOneError}
          control={stepOneControl}
          id={id}
          sProfilePicture={userData?.sUrl}
          profilePictureUpdate={(e) => setUserData({ ...userData, sUrl: e })}
          hidden={step !== 1}
          sUserName={userData.sUName}
        />
        <StepTwo
          register={stepTwoField}
          submit={stepTwoSubmit}
          errors={stepTwoErrors}
          control={control}
          nextStep={changeStep}
          previous={changeStep}
          setValue={setStepTwoValue}
          values={stepTwoValue()}
          setError={setStepTwoError}
          clearErrors={clearStepTwoError}
          trigger={trigger}
          sPanPicture={userData?.oKyc?.sUrl}
          sBankDetailPic={userData?.oKyc?.sBankDetailPic}
          id={id}
          selectedRole={userData.oRole}
          hidden={step !== 2}
        />
        <Form hidden={step !== 3} onSubmit={stepThreeSubmit(onAddUser)}>
          <CommonSEO
            register={stepThreeField}
            errors={stepThreeErrors}
            values={stepThreeValue()}
            previewURL={userData?.sUrl || userData?.oSeo?.oFB?.sUrl || userData?.oSeo?.oTwitter?.sUrl}
            setError={setStepThreeError}
            clearErrors={clearStepThreeError}
            slug={stepOneValue().sUserName}
            setValue={setStepThreeValue}
            fbImg={userData?.oSeo?.oFB?.sUrl}
            twitterImg={userData?.oSeo?.oTwitter?.sUrl}
            id={id}
            control={stepThreeControl}
            hidden={step === 3}
            slugType={'ad'}
            defaultData={userData}
            categoryURL={allRoutes.authors}
            removeParentCategory={true}
            onUpdateData={(e) => handleUpdateData(e)}
          />
          <div className="btn-bottom add-border">
            <Button onClick={() => changeStep(2)} variant="outline-secondary">
              <FormattedMessage id="back" />
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading || isImgUploading || stepThreeErrors.sCustomSlug || editLoading || seoLoading}
            >
              <FormattedMessage id={id ? 'update' : 'add'} />
              {(loading || isImgUploading || editLoading || seoLoading) && <Spinner animation="border" size="sm" />}
            </Button>
          </div>
        </Form>
      </div>
    </>
  )
}
export default AddEditUser
