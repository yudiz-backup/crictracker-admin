import React, { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Form, Col, Row, Spinner } from 'react-bootstrap'
import { useMutation, useLazyQuery } from '@apollo/client'
import { useHistory, useParams } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl'

import AddEditCms from 'shared/components/add-edit-cms'
import CommonSEO from 'shared/components/common-seo'
import UpdateCache from 'shared/components/cache/updateCache'
import AddCache from 'shared/components/cache/addCache'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { allRoutes } from 'shared/constants/AllRoutes'
import { removeTypeName, wrapTable } from 'shared/utils'
import { GET_CMS_BY_ID, EDIT_CMS, ADD_CMS } from 'graph-ql/settings/cms'
import SeoMutation from 'shared/components/common-seo/seo-mutation'

function AddEditCmsView() {
  const history = useHistory()
  const [cmsData, setCmsData] = useState()
  const { id } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const { updateCacheData } = UpdateCache()
  const { addCacheData } = AddCache()
  const [name, setName] = useState()
  const close = useIntl().formatMessage({ id: 'close' })
  const { data: seoSuccess, uploadData, loading: seoLoading } = SeoMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: seoErrors },
    setError,
    clearErrors,
    setValue,
    control,
    getValues
  } = useForm({
    mode: 'all',
    defaultValues: {
      oFB: { sPicture: '' },
      oTwitter: { sPicture: '' },
      sCustomSlug: ''
    }
  })

  const [getCms, { data: seoDataId }] = useLazyQuery(GET_CMS_BY_ID, {
    onCompleted: (data) => {
      if (data && data.getCMSPageById) {
        setCmsData(data.getCMSPageById)
        !cmsData && setCmsValue(data.getCMSPageById)
      }
    }
  })

  const [EditCmsMutation, { loading: editSeoLoader }] = useMutation(EDIT_CMS, {
    onCompleted: (data) => {
      if (data && data.editCMSPage) {
        uploadData({ ...getValues().oSeo, sSlug: getValues().oSeo.sSlug }, 'cms', data.editCMSPage.oData._id, true, {
          query: GET_CMS_BY_ID,
          variable: { input: { _id: data.editCMSPage.oData._id } },
          getKeyName: 'getCMSPageById'
        })
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editCMSPage.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        // history.push(allRoutes.cms)
      }
    },
    update: (cache, { data }) => {
      data && data.editCMSPage && updateCacheData(GET_CMS_BY_ID, { input: { _id: id } }, data.editCMSPage.oData, 'getCMSPageById')
    }
  })

  const [AddCmsMutation, { loading }] = useMutation(ADD_CMS, {
    onCompleted: (data) => {
      if (data && data.addCMSPage) {
        uploadData({ ...getValues().oSeo, sSlug: getValues().oSeo.sSlug }, 'cms', data.addCMSPage.oData._id, false, {
          query: GET_CMS_BY_ID,
          variable: { input: { _id: data.addCMSPage.oData._id } },
          getKeyName: 'getCMSPageById'
        })
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.addCMSPage.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
      }
    },
    update: (cache, { data }) => {
      data.addCMSPage && addCacheData(GET_CMS_BY_ID, { input: { _id: data.addCMSPage.oData._id } }, data.addCMSPage.oData, 'getCMSPageById')
    }
  })

  useEffect(() => {
    id && getCms({ variables: { input: { _id: id } } })
  }, [id])

  useEffect(() => {
    if (seoSuccess) {
      history.push(allRoutes.cms)
    }
  }, [seoSuccess])

  async function prepareSeoData(value) {
    const inputValue = {
      sTitle: value?.sTitle,
      sContent: wrapTable(value?.sContent || '')
    }
    if (id) {
      EditCmsMutation({ variables: { input: { oInput: inputValue, _id: id } } })
    } else {
      AddCmsMutation({ variables: { input: { oInput: inputValue } } })
    }
  }

  function setCmsValue(value) {
    reset({
      sTitle: value?.sTitle,
      sContent: value?.sContent,
      oSeo: {
        sTitle: value?.oSeo?.sTitle,
        sSlug: value?.oSeo?.sSlug,
        sDescription: value?.oSeo?.sDescription,
        aKeywords: value?.oSeo?.aKeywords ? value?.oSeo?.aKeywords.join(', ') : '',
        sCUrl: value?.oSeo?.sCUrl,
        sRobots: value?.oSeo?.sRobots,
        oFB: value?.oSeo?.oFB ? removeTypeName(value?.oSeo?.oFB) : '',
        oTwitter: value?.oSeo?.oTwitter ? removeTypeName(value?.oSeo?.oTwitter) : ''
      }
    })
  }

  const onAddSeo = (data) => {
    prepareSeoData(data)
  }
  function handleUpdateData(data) {
    setCmsData(data)
  }
  return (
    <>
      <Form onSubmit={handleSubmit(onAddSeo)}>
        <Row>
          <Col xxl="8">
            <AddEditCms
              data={seoDataId && seoDataId?.getCMSPageById}
              register={register}
              errors={seoErrors}
              control={control}
              reset={reset}
              nameChanged={(e) => setName(e)}
            />
            <CommonSEO
              register={register}
              errors={seoErrors}
              values={getValues()}
              setError={setError}
              clearErrors={clearErrors}
              previewURL={cmsData?.oSeo?.oFB?.sUrl || cmsData?.oSeo?.oTwitter?.sUrl}
              fbImg={cmsData?.oSeo?.oFB?.sUrl}
              twitterImg={cmsData?.oSeo?.oTwitter?.sUrl}
              setValue={setValue}
              control={control}
              id={id}
              slugType={'cms'}
              slug={name}
              hidden
              defaultData={cmsData}
              onUpdateData={(e) => handleUpdateData(e)}
            />
          </Col>
          <div className="btn-bottom add-border mt-4 ">
            <Button
              variant="outline-secondary"
              disabled={loading || editSeoLoader}
              onClick={() => {
                reset({})
              }}
            >
              <FormattedMessage id="clear" />
            </Button>
            <Button variant="primary" type="submit" className="m-2" disabled={loading || editSeoLoader || seoLoading}>
              <FormattedMessage id={id ? 'update' : 'add'} />
              {(loading || editSeoLoader || seoLoading) && <Spinner animation="border" size="sm" />}
            </Button>
          </div>
        </Row>
      </Form>
    </>
  )
}

export default AddEditCmsView
