import React, { useEffect, useState, useContext, useRef } from 'react'
import { Form, Row, Col, Button, Spinner } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { useParams, useHistory } from 'react-router-dom'

import { ToastrContext } from 'shared/components/toastr'
import EditTeam from 'shared/components/edit-team'
import { removeTypeName, debounce } from 'shared/utils'
import CommonSEO from 'shared/components/common-seo'
import UpdateCache from 'shared/components/cache/updateCache'
import SeoMutation from 'shared/components/common-seo/seo-mutation'
import { TOAST_TYPE } from 'shared/constants'
import { allRoutes } from 'shared/constants/AllRoutes'
import { GET_TEAM_BY_ID, EDIT_TEAM_MUTATION } from 'graph-ql/management/team'
import { GET_COUNTRY_LIST } from 'graph-ql/management/player'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'

function EditTeamView() {
  const [teamData, setTeamData] = useState()
  const history = useHistory()
  // const [name, setName] = useState()
  const { id } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const { data: seoSuccess, uploadData, loading: seoLoading } = SeoMutation()
  const { updateCacheData } = UpdateCache()
  const [requestParams, setRequestParams] = useState({ nSkip: 1, nLimit: 10, sSearch: '' })
  const totalCountry = useRef(0)
  const isBottomReached = useRef(false)
  const [countryList, setCountryList] = useState()
  const [teamUrl, setTeamUrl] = useState()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors: teamErrors },
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
  const close = useIntl().formatMessage({ id: 'close' })
  const { data } = useQuery(GET_TEAM_BY_ID, {
    variables: { input: { _id: id } },
    onCompleted: (data) => {
      if (data && data.getTeamById) {
        setTeamData(getTeamSlug(data.getTeamById))
        !teamData && setTeamValue(getTeamSlug(data.getTeamById))
      }
    }
  })

  const { loading: loadingCountry } = useQuery(GET_COUNTRY_LIST, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      if (isBottomReached.current) {
        setCountryList([...countryList, ...data.listCountry.aResults])
      } else {
        setCountryList(data.listCountry.aResults)
      }
      totalCountry.current = data.listCountry.nTotal
      isBottomReached.current = false
    }
  })

  const [editTeam, { loading: teamLoading }] = useMutation(EDIT_TEAM_MUTATION, {
    onCompleted: (data) => {
      if (data && data.editTeam) {
        uploadData({ ...getValues().oSeo, sSlug: teamUrl ? teamUrl + getValues().oSeo.sSlug : getValues().oSeo.sSlug }, 't', id, true, {
          query: GET_TEAM_BY_ID,
          variable: { input: { _id: id } },
          getKeyName: 'getTeamById'
        })
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editTeam.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
      }
    },
    update: (cache, { data }) => {
      data && data.editTeam && updateCacheData(GET_TEAM_BY_ID, { input: { _id: id } }, data.editTeam.oData, 'getTeamById')
    }
  })

  useEffect(() => {
    if (seoSuccess) {
      history.push(allRoutes.teams)
    }
  }, [seoSuccess])

  function prepareTeamData(value) {
    delete value.oImg.fSUrl
    const data = JSON.parse(JSON.stringify(value))
    const inputValue = {
      sTitle: data?.sTitle,
      sAbbr: data?.sAbbr,
      eTeamType: data?.sTeamType?.value,
      sCountry: data?.sCountry?.sISO,
      _id: id,
      oImg: { ...value.oImg }
    }
    editTeam({ variables: { input: inputValue } })
  }

  function setTeamValue(value) {
    reset({
      sTitle: value?.sTitle,
      sAbbr: value?.sAbbr,
      sTeamType: { label: value?.sTeamType, value: value?.sTeamType },
      sCountry: { sISO: value?.sCountry, sTitle: value?.sCountryFull },
      oImg: { ...removeTypeName(value.oImg) },
      oSeo: {
        sTitle: value?.oSeo?.sTitle,
        sSlug: value?.oSeo?.sSlug,
        sDescription: value?.oSeo?.sDescription,
        aKeywords: value?.oSeo?.aKeywords ? value.oSeo.aKeywords.join(', ') : '',
        sCUrl: value?.oSeo?.sCUrl,
        sRobots: value?.oSeo?.sRobots,
        oFB: removeTypeName(value?.oSeo?.oFB),
        oTwitter: removeTypeName(value?.oSeo?.oTwitter)
      }
    })
  }
  function onEditTeam(formValue) {
    prepareTeamData(formValue)
  }
  function handleScrollCountry() {
    if (totalCountry.current > requestParams.nSkip * 10) {
      setRequestParams({ ...requestParams, nSkip: requestParams.nSkip + 1 })
      isBottomReached.current = true
    }
  }
  const optimizedSearch = debounce((value, action) => {
    if (action.action !== 'input-blur') {
      setRequestParams({ ...requestParams, sSearch: value, nSkip: 1 })
    }
  })
  function getTeamSlug(data) {
    const exceptLastSlash = data.oSeo.sSlug?.lastIndexOf('/')
    setTeamUrl(data.oSeo.sSlug ? data.oSeo.sSlug.substring(0, exceptLastSlash) + '/' : '')
    return {
      ...data,
      oSeo: {
        ...data.oSeo,
        sSlug: data.oSeo.sSlug?.substring(exceptLastSlash + 1)
      }
    }
  }
  function handleDeleteImg(key) {
    id && setTeamData({ ...teamData, [key]: { ...teamData[key], sUrl: '' } })
  }
  function handleUpdateData(data) {
    setTeamData(data)
  }
  return (
    <>
      <Form onSubmit={handleSubmit(onEditTeam)}>
        <Row>
          <Col sm="8">
            <EditTeam
              data={data && data.getTeamById}
              register={register}
              errors={teamErrors}
              handleSubmit={handleSubmit}
              reset={reset}
              watch={watch}
              setError={setError}
              setValue={setValue}
              clearErrors={clearErrors}
              control={control}
              values={getValues()}
              // nameChanged={(e) => setName(e)}
              handleScrollCountry={handleScrollCountry}
              optimizedSearch={optimizedSearch}
              loadingCountry={loadingCountry}
              countryList={countryList}
            />
            <CommonSEO
              register={register}
              errors={teamErrors}
              values={getValues()}
              setError={setError}
              clearErrors={clearErrors}
              previewURL={teamData?.oSeo?.oFB?.sUrl || teamData?.oSeo?.oTwitter?.sUrl}
              fbImg={teamData?.oSeo?.oFB?.sUrl}
              twitterImg={teamData?.oSeo?.oTwitter?.sUrl}
              setValue={setValue}
              control={control}
              slugType={'t'}
              // slug={name}
              hidden
              defaultData={teamData}
              categoryURL={teamUrl}
              onUpdateData={(e) => handleUpdateData(e)}
            />
          </Col>
          <Col sm="4" className="add-article">
            <div className="sticky-column">
              <CategoryPlayerTeamImage
                register={register}
                setValue={setValue}
                reset={reset}
                values={getValues()}
                errors={teamErrors}
                data={teamData}
                onDelete={handleDeleteImg}
                clearErrors={clearErrors}
              />
            </div>
          </Col>
          <div className="btn-bottom add-border mt-4 ">
            <Button
              variant="outline-secondary"
              disabled={teamLoading}
              onClick={() => {
                reset()
              }}
            >
              <FormattedMessage id="clear" />
            </Button>
            <Button variant="primary" type="submit" className="m-2" disabled={teamLoading || seoLoading}>
              <FormattedMessage id={id ? 'update' : 'add'} />
              {(teamLoading || seoLoading) && <Spinner animation="border" size="sm" />}
            </Button>
          </div>
        </Row>
      </Form>
    </>
  )
}

export default EditTeamView
