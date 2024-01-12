import React, { useContext, useEffect, useState, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, Form, Col, Row, Spinner } from 'react-bootstrap'
import { useMutation, useLazyQuery } from '@apollo/client'
import { useHistory, useParams } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl'

import CommonSEO from 'shared/components/common-seo'
import { TOAST_TYPE, META_ROBOTS } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { parseParams, removeTypeName, wrapTable } from 'shared/utils'
import { GET_SEOS_BY_ID } from 'graph-ql/settings/seo'
import { GENERATE_PRE_SIGNED } from 'graph-ql/generate-pre-signed-url'
import { getPreSignedData, uploadImage } from 'shared/functions/PreSignedData'
import { UPDATE_SEO } from 'graph-ql/add-update-seo/mutation'
import { validationErrors } from 'shared/constants/ValidationErrors'
import Select from 'react-select'
import AddEditSeriesSeo from 'shared/components/add-edit-series-seo'
import RedirectionPopup from 'shared/components/article-add-edit-components/redirection-popup'
import useModal from 'shared/hooks/useModal'
import { ENUM_SERIES_CATEGORY_PAGES, STATS_PAGE_ENUM } from 'shared/enum/series'

function AddEditSeoSeriesView() {
  const [seoData, setSeoData] = useState({})
  const [seoTabData, setSeoTabData] = useState({})
  const [stats, setStats] = useState([])
  const { id, type } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const [isDisabled, setIsDisabled] = useState(false)
  const existSeoType = useRef()
  const { isShowing, toggle } = useModal()
  const close = useIntl().formatMessage({ id: 'close' })
  const history = useHistory()
  const params = parseParams(location.search)
  const activeStatTab = { label: <FormattedMessage id="Stats" defaultMessage="Stats" />, eSubType: 'st' }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: seoErrors },
    setError,
    clearErrors,
    setValue,
    control,
    watch,
    getValues
  } = useForm({
    mode: 'all',
    defaultValues: {
      sCustomSlug: '',
      oSeo: {
        oFB: { sPicture: '' },
        oTwitter: { sPicture: '' },
        sDTitle: '',
        sContent: ''
      }
    }
  })
  const [generatePreSignedUrl] = useMutation(GENERATE_PRE_SIGNED)
  const [getSeo, { data: seoDataId }] = useLazyQuery(GET_SEOS_BY_ID, {
    onCompleted: (data) => {
      if (data && data?.getSeosById) {
        setSeoData(data.getSeosById)
        let tabData = {}
        data.getSeosById?.forEach((cat) => {
          if (cat?.eSubType === (params?.stat || params.tab || 'n')) {
            tabData = cat
          }
        })
        setSeoValue(tabData)
        setSeoTabData(tabData)
        if (params?.stat) {
          setValue('seriesTabs', activeStatTab)
          setValue('seriesStatsTabs', tabData)
        } else {
          setValue('seriesTabs', tabData)
        }
      }
    }
  })

  useEffect(() => {
    console.log(seoDataId)
    seoDataId?.getSeosById?.length && params?.tab === 'st' && setStats(seoDataId?.getSeosById?.filter(seoData => STATS_PAGE_ENUM[seoData?.eSubType]))
  }, [params?.tab, seoDataId?.getSeosById])

  const handleChange = (tab) => {
    let tabData = {}
    seoData?.forEach((cat) => {
      if (cat?.eSubType === tab.eSubType) {
        tabData = cat
      }
    })
    history.push({ search: `?tab=${tabData?.eSubType}` })
    setSeoValue(tabData)
    setSeoTabData(tabData)
    setValue('seriesTabs', tab)
  }

  const handleStatsChange = (tab) => {
    setSeoValue(tab)
    setSeoTabData(tab)
    history.push({ search: `?tab=st&stat=${tab?.eSubType}` })
    setValue('seriesStatsTabs', tab)
    setValue('seriesTabs', activeStatTab)
  }

  const [updateSeoMutation, { loading: updateSeoLoader }] = useMutation(UPDATE_SEO, {
    onCompleted: (data) => {
      if (data && data.editSeo) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editSeo.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
      }
    }
  })

  useEffect(() => {
    id && getSeo({ variables: { input: { iId: id } } })
  }, [id])

  const SERIES_TABS = [
    { label: <FormattedMessage id="News" defaultMessage="News" />, eSubType: 'n' },
    { label: <FormattedMessage id="Videos" defaultMessage="Videos" />, eSubType: 'v' },
    { label: <FormattedMessage id="Fixtures" defaultMessage="Fixtures" />, eSubType: 'f' },
    { label: <FormattedMessage id="Standings" defaultMessage="Standings" />, eSubType: 's' },
    { label: <FormattedMessage id="Stats" defaultMessage="Stats" />, eSubType: 'st' },
    { label: <FormattedMessage id="Teams" defaultMessage="Teams" />, eSubType: 't' },
    { label: <FormattedMessage id="Squads" defaultMessage="Squads" />, eSubType: 'sq' },
    { label: <FormattedMessage id="Archives" defaultMessage="Archives" />, eSubType: 'ar' },
    { label: <FormattedMessage id="FantasyTips" defaultMessage="Fantasy Tips" />, eSubType: 'ft' }
  ]

  async function prepareSeoData(value) {
    const inputValue = {
      seoInput: {
        aKeywords: value?.oSeo?.aKeywords,
        oFB: value?.oSeo?.oFB,
        oTwitter: value?.oSeo?.oTwitter,
        sCUrl: value?.oSeo?.sCUrl,
        sDescription: value?.oSeo?.sDescription,
        sRobots: value?.oSeo?.sRobots,
        sSlug: value?.customSlug,
        sDTitle: value?.oSeo?.sDTitle,
        sContent: wrapTable(value?.oSeo?.sContent),
        sTitle: value?.oSeo?.sTitle,
        eType: seoTabData?.eType || 'ct'
      }
    }
    const formData = inputValue.seoInput
    if (
      (formData.oFB?.fSUrl && formData.oFB.fSUrl[0] instanceof File) ||
      (formData.oTwitter?.fSUrl && formData.oTwitter.fSUrl[0] instanceof File)
    ) {
      const { value, data: latestFormData } = getPreSignedData(formData)
      const allData = latestFormData
      const { data } = await generatePreSignedUrl({ variables: { generatePreSignedUrlInput: value } })
      if (data && data.generatePreSignedUrl) {
        const uploadData = []
        const urls = data.generatePreSignedUrl
        urls.forEach((e) => {
          if (e.sType === 'fb') {
            uploadData.push({ sUploadUrl: e.sUploadUrl, file: allData.oFB.fSUrl[0] })
            allData.oFB.sUrl = e.sS3Url
          } else {
            uploadData.push({ sUploadUrl: e.sUploadUrl, file: allData.oTwitter.fSUrl[0] })
            allData.oTwitter.sUrl = e.sS3Url
          }
        })
        uploadImage(uploadData)
          .then((res) => {
            addUpdateSeo({
              ...allData
            })
          })
          .catch((err) => {
            console.error('err', err)
          })
      }
    } else {
      addUpdateSeo({
        ...formData
      })
    }
  }
  function addUpdateSeo(value) {
    const data = { ...value, eSubType: params?.stat || params?.tab || 'n', oFB: { ...value.oFB }, oTwitter: { ...value.oTwitter } }
    data.aKeywords = data.aKeywords ? data.aKeywords.split(',').map((w) => w.trim()) : []
    if (!data.sRobots) data.sRobots = META_ROBOTS[0]
    delete data.fb
    delete data.twitter
    delete data.oFB.fSUrl
    delete data.oTwitter.fSUrl
    if (id) {
      updateSeoMutation({ variables: { input: { ...data, iId: id } } })
      setSeoValue(data)
    }
  }
  function setSeoValue(value) {
    reset({
      seriesTabs: params.stat ? activeStatTab : value,
      seriesStatsTabs: params?.stat && value,
      customSlug: value?.sSlug,
      oSeo: {
        sContent: value?.sContent || '',
        sDTitle: value?.sDTitle || '',
        sTitle: value?.sTitle,
        sSlug: value?.sSlug,
        eSubType: params?.stat || params?.tab || 'n',
        eType: value?.eType,
        sDescription: value?.sDescription,
        aKeywords: value?.aKeywords ? value.aKeywords.join(', ') : '',
        sCUrl: value?.sCUrl,
        sRobots: value?.sRobots,
        oFB: value.oFB ? removeTypeName(value.oFB) : '',
        oTwitter: value.oTwitter ? removeTypeName(value.oTwitter) : ''
      }
    })
  }

  const onAddSeo = (data) => {
    if (seoTabData?.sSlug !== data?.customSlug) {
      toggle()
    } else {
      prepareSeoData(data)
    }
  }

  function handleUpdateData(data) {
    setSeoTabData(data)
  }

  function onRedirectionSuccess() {
    prepareSeoData({ ...getValues() })
    toggle()
  }

  return (
    <>
      <Form onSubmit={handleSubmit(onAddSeo)}>
        <Row>
          <Col sm="8">
            <Form.Group className="form-group">
              <Form.Label>
                <FormattedMessage id="Tabs" />*
              </Form.Label>
              <Controller
                name="seriesTabs"
                control={control}
                rules={{ required: validationErrors.required }}
                render={({ field: { onChange, value = [], ref } }) => {
                  return <Select
                    ref={ref}
                    value={value}
                    options={SERIES_TABS}
                    getOptionLabel={(option) => ENUM_SERIES_CATEGORY_PAGES[option?.eSubType]}
                    getOptionValue={(option) => option?.eSubType}
                    className="react-select"
                    classNamePrefix="select"
                    isSearchable
                    onChange={(e) => {
                      handleChange(e)
                      onChange(e)
                    }}
                  />
                }}
              />
            </Form.Group>
            {
              params?.tab === 'st' && <Form.Group className="form-group">
                <Form.Label>
                  <FormattedMessage id="Stats" />
                </Form.Label>
                <Controller
                  name="seriesStatsTabs"
                  control={control}
                  // rules={{ required: validationErrors.required }}
                  render={({ field: { onChange, value = [], ref } }) => {
                    return <Select
                      ref={ref}
                      value={value}
                      options={stats}
                      getOptionLabel={(option) => STATS_PAGE_ENUM[option?.eSubType]}
                      getOptionValue={(option) => option?.eSubType}
                      className="react-select"
                      classNamePrefix="select"
                      isSearchable
                      onChange={(e) => {
                        // setStatsTab(e)
                        handleStatsChange(e)
                        onChange(e)
                      }}
                    />
                  }}
                />
              </Form.Group>
            }
            <AddEditSeriesSeo
              defaultSlug={seoTabData?.sSlug}
              register={register}
              errors={seoErrors}
              setValue={setValue}
              control={control}
              watch={watch}
              reset={reset}
              setError={setError}
              values={getValues()}
              slugType="nar"
              disabled={isDisabled}
            />
            <CommonSEO
              register={register}
              errors={seoErrors}
              values={getValues()}
              setError={setError}
              clearErrors={clearErrors}
              previewURL={seoTabData?.oFB?.sUrl || seoTabData?.oTwitter?.sUrl}
              fbImg={seoTabData?.oFB?.sUrl}
              twitterImg={seoTabData?.oTwitter?.sUrl}
              setValue={setValue}
              control={control}
              id={id}
              slugType="cu"
              hidden
              defaultData={seoTabData}
              disabled={type === 'detail-seo'}
              onUpdateData={(e) => handleUpdateData(e)}
              hideCustomSlug
            />
          </Col>
          <RedirectionPopup
            sNewUrl={getValues()?.customSlug}
            sOldUrl={seoTabData?.sSlug || seoTabData?.oSeo?.sSlug}
            show={isShowing}
            onSuccess={onRedirectionSuccess}
            onClose={toggle}
          />
          {type !== 'detail-seo' && (
            <div className="btn-bottom add-border mt-4 ">
              <Button
                variant="outline-secondary"
                disabled={updateSeoLoader}
                onClick={() => {
                  reset({})
                  setIsDisabled(false)
                }}
              >
                <FormattedMessage id="clear" />
              </Button>
              <Button variant="primary" type="submit" className="m-2" disabled={updateSeoLoader}>
                <FormattedMessage id={id || existSeoType.current ? 'update' : 'add'} />
                {(updateSeoLoader) && <Spinner animation="border" size="sm" />}
              </Button>
            </div>
          )}
        </Row>
      </Form>
    </>
  )
}

export default AddEditSeoSeriesView
