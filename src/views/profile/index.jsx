import React, { useState, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@apollo/client'
import { Form, Button, Spinner } from 'react-bootstrap'
import { useHistory } from 'react-router'
import { FormattedMessage } from 'react-intl'

import EditProfileComponent from 'shared/components/profile'
import UpdateCache from 'shared/components/cache/updateCache'
import { ToastrContext } from 'shared/components/toastr'
import { getPreSignedData, uploadImage } from 'shared/functions/PreSignedData'
import { GENERATE_PRE_SIGNED } from 'graph-ql/generate-pre-signed-url'
import { encryption } from 'shared/utils'
import { TOAST_TYPE } from 'shared/constants'
import { GET_PROFILE_DATA, EDIT_PROFILE } from 'graph-ql/profile'
import { allRoutes } from 'shared/constants/AllRoutes'
import { GlobalEventsContext } from 'shared/components/global-events'

function EditProfile() {
  const history = useHistory()
  const { dispatch } = useContext(ToastrContext)
  const { dispatch: editProfileEvent } = useContext(GlobalEventsContext)
  const [profileData, setProfileData] = useState({})
  const [formData, setFormData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { updateCacheData } = UpdateCache()
  const {
    register,
    control,
    formState: { errors },
    clearErrors,
    trigger,
    getValues,
    reset,
    handleSubmit,
    setValue
  } = useForm({
    mode: 'all',
    defaultValues: {
      sProfilePicture: '',
      sPanPicture: '',
      aSocialProfiles: [{ eSocialNetworkType: '', sDisplayName: '', sLink: '' }]
    }
  })

  const { loading } = useQuery(GET_PROFILE_DATA, {
    onCompleted: (data) => {
      if (data && data.getProfile) {
        setDataInForm(data.getProfile)
        setProfileData(data.getProfile)
      }
    }
  })

  function getPanPicture() {
    if (getValues().sPanPicture && getValues().sPanPicture[0] instanceof File) {
      return URL.createObjectURL(getValues().sPanPicture[0])
    } else {
      return (profileData.oKyc && profileData.oKyc.sUrl) || ''
    }
  }

  function getBankDetailPicture() {
    if (getValues().sBankDetailPic && getValues().sBankDetailPic[0] instanceof File) {
      return URL.createObjectURL(getValues().sBankDetailPic[0])
    } else {
      return (profileData.oKyc && profileData.oKyc.sBankDetailPic) || ''
    }
  }

  function getProfilePicture() {
    if (getValues().sProfilePicture && getValues().sProfilePicture[0] instanceof File) {
      return URL.createObjectURL(getValues().sProfilePicture[0])
    } else {
      return profileData.sUrl || ''
    }
  }

  function handleChange(newValue) {
    setProfileData({ ...profileData, sUrl: newValue })
  }

  const [generatePreSignedUrl] = useMutation(GENERATE_PRE_SIGNED, {
    onCompleted: (data) => {
      if (data) {
        let urls = data.generatePreSignedUrl
        const allData = formData
        urls = urls.map((item) => {
          const key = allData[item.sType].key
          key.includes('.') ? (allData[key.split('.')[0]][key.split('.')[1]] = item.sS3Url) : (allData[key] = item.sS3Url)
          return {
            ...item,
            file: allData[item.sType].file
          }
        })
        uploadImage(urls)
          .then((res) => {
            prepareEditProfile(allData)
            setIsLoading(false)
          })
          .catch((err) => {
            setIsLoading(false)
            console.log('err', err)
          })
      }
    }
  })

  const setDataInForm = (profileData) => {
    if (profileData) {
      let aSLinks
      if (profileData?.aSLinks?.length) {
        aSLinks = profileData.aSLinks.map((item) => {
          return { eSocialNetworkType: item.eSocialNetworkType, sDisplayName: item.sDisplayName, sLink: item.sLink }
        })
      }
      reset({
        sProfilePicture: '',
        sFullName: profileData.sFName,
        sNumber: profileData.sNumber,
        eGender: profileData.eGender,
        sDisplayName: profileData?.sDisplayName,
        sBio: profileData.sBio,
        sPanName: profileData?.oKyc?.sPName,
        sIfsc: profileData?.oKyc?.sIfsc,
        sAccountNumber: profileData?.oKyc?.sANumber,
        sAccountName: profileData?.oKyc?.sAName,
        sPanPicture: '',
        sBankDetailPic: '',
        sBankName: profileData?.oKyc?.sBankName,
        sBranchName: profileData?.oKyc?.sBranchName,
        sPanNumber: profileData?.oKyc?.sPanNumber,
        aSocialProfiles: profileData?.aSLinks?.length ? aSLinks : [{ eSocialNetworkType: '', sDisplayName: '', sLink: '' }]
      })
    }
  }

  const editProfile = (formValue) => {
    const { value, data } = getPreSignedData(formValue)
    setFormData(data)
    if (
      (data.sProfilePicture && data.sProfilePicture.files[0] instanceof File) ||
      (data.sPanPicture && data.sPanPicture[0] instanceof File) ||
      (data.sBankDetailPic && data.sBankDetailPic[0] instanceof File)
    ) {
      setIsLoading(true)
      generatePreSignedUrl({ variables: { generatePreSignedUrlInput: value } })
    } else {
      prepareEditProfile(data)
    }
  }

  const prepareEditProfile = (value) => {
    const data = value
    delete data.profile
    delete data.pan
    delete data.bank
    data.sAccountNumber = data.sAccountNumber ? encryption(data.sAccountNumber) : ''
    if (data.sProfilePicture === '') {
      data.sProfilePicture = profileData.sUrl || ''
    }
    if (data.sPanPicture === '') data.sPanPicture = profileData?.oKyc?.sUrl
    if (data.sBankDetailPic === '') data.sBankDetailPic = profileData?.oKyc?.sBankDetailPic
    if (data.aSocialProfiles.length && data.aSocialProfiles[data.aSocialProfiles.length - 1].sLink === '') {
      data.aSocialProfiles.length = data.aSocialProfiles.length - 1
    }
    editProfileMutation({
      variables: {
        input: {
          ...data
        }
      }
    })
  }
  const [editProfileMutation, { loading: editProfileLoading }] = useMutation(EDIT_PROFILE, {
    onCompleted: (data) => {
      if (data && data.editProfile) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editProfile.sMessage, type: TOAST_TYPE.Success, btnTxt: 'Close' }
        })
        editProfileEvent({
          type: 'CHANGE_PROFILE',
          payload: { profileData: data.editProfile.oData }
        })
        history.push(allRoutes.dashboard)
      }
    },
    update: (cache, { data }) => {
      data && data.editProfile && updateCacheData(GET_PROFILE_DATA, '', data.editProfile.oData, 'getProfile')
    }
  })

  return (
    <>
      <div className="edit-profile">
        <Form onSubmit={handleSubmit(editProfile)} autoComplete="off">
          <EditProfileComponent
            register={register}
            control={control}
            errors={errors}
            clearErrors={clearErrors}
            trigger={trigger}
            values={getValues()}
            sPanPicture={getPanPicture()}
            sBankDetailPic={getBankDetailPicture()}
            sProfilePicture={getProfilePicture()}
            profileData={profileData}
            handleChange={(e) => handleChange(e)}
            setValue={setValue}
          />
          <div className="add-border">
            <Button variant="primary" type="submit" className="m-2" disabled={loading || isLoading || editProfileLoading}>
              <FormattedMessage id="update" /> {(loading || isLoading || editProfileLoading) && <Spinner animation="border" size="sm" />}
            </Button>
          </div>
        </Form>
      </div>
    </>
  )
}

export default EditProfile
