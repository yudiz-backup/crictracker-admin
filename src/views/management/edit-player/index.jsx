import React, { useEffect, useState, useContext, useRef } from 'react'
import { Form, Row, Col, Button, Spinner } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { useParams, useHistory } from 'react-router-dom'

import { ToastrContext } from 'shared/components/toastr'
import EditPlayer from 'shared/components/edit-player'
import { removeTypeName, debounce, wrapTable } from 'shared/utils'
import CommonSEO from 'shared/components/common-seo'
import UpdateCache from 'shared/components/cache/updateCache'
import SeoMutation from 'shared/components/common-seo/seo-mutation'
import { TOAST_TYPE, ROLES } from 'shared/constants'
import { allRoutes } from 'shared/constants/AllRoutes'
import { GET_PLAYER_BY_ID, EDIT_PLAYER_MUTATION, GET_COUNTRY_LIST } from 'graph-ql/management/player'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'

function EditPlayerView() {
  const [playerData, setPlayerData] = useState()
  const [countryList, setCountryList] = useState()
  const history = useHistory()
  // const [name, setName] = useState()
  const { id } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const { data: seoSuccess, uploadData, loading: seoLoading } = SeoMutation()
  const { updateCacheData } = UpdateCache()
  const [requestParams, setRequestParams] = useState({ nSkip: 1, nLimit: 10, sSearch: '' })
  const totalCountry = useRef(0)
  const isBottomReached = useRef(false)
  const [playerUrl, setPlayerUrl] = useState()
  const close = useIntl().formatMessage({ id: 'close' })
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors: playerErrors },
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

  const { data } = useQuery(GET_PLAYER_BY_ID, {
    variables: { input: { _id: id } },
    onCompleted: (data) => {
      if (data && data.getPlayerById) {
        setPlayerData(getPlayerSlug(data.getPlayerById))
        !playerData && setPlayerValue(getPlayerSlug(data.getPlayerById))
      }
    }
  })

  const [EditPlayerMutation, { loading: playerLoading }] = useMutation(EDIT_PLAYER_MUTATION, {
    onCompleted: (data) => {
      if (data && data.editPlayer) {
        uploadData({ ...getValues().oSeo, sSlug: playerUrl ? playerUrl + getValues().oSeo.sSlug : getValues().oSeo.sSlug }, 'p', id, true, {
          query: GET_PLAYER_BY_ID,
          variable: { input: { _id: id } },
          getKeyName: 'getPlayerById'
        })
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editPlayer.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
      }
    },
    update: (cache, { data }) => {
      if (data && data.editPlayer) {
        updateCacheData(GET_PLAYER_BY_ID, { input: { _id: id } }, data?.editPlayer?.oData, 'getPlayerById')
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

  useEffect(() => {
    if (seoSuccess) {
      history.push(allRoutes.players)
    }
  }, [seoSuccess])

  function preparePlayerData(value) {
    const data = JSON.parse(JSON.stringify(value))
    delete data?.oSeo
    const inputValue = {
      ...data,
      sFullName: data?.sFullName,
      sPlayingRole: data?.sPlayingRole?.value,
      sCountry: data?.sCountry?.sISO,
      sContent: data?.sContent ? wrapTable(data?.sContent) : '',
      _id: id,
      oImg: { ...value.oImg }
    }
    EditPlayerMutation({ variables: { input: inputValue } })
  }

  function setPlayerValue(value) {
    reset({
      sFullName: value?.sFullName,
      sFirstName: value?.sFirstName,
      sLastName: value?.sLastName,
      sNickName: value?.sNickName,
      sContent: value?.sContent,
      sBirthPlace: value?.sBirthPlace,
      sFieldingPosition: value?.sFieldingPosition,
      sBattingStyle: value?.sBattingStyle,
      sBowlingStyle: value?.sBowlingStyle,
      sSex: value?.sSex,
      dBirthDate: value?.dBirthDate,
      sCountry: { sISO: value?.sCountry, sTitle: value?.sCountryFull },
      sPlayingRole: ROLES.filter((e) => e.value === value?.sPlayingRole)[0],
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

  function onEditPlayer(formValue) {
    preparePlayerData(formValue)
  }
  function handleScrollCountry() {
    if (totalCountry.current > requestParams.nSkip * 10) {
      setRequestParams({ ...requestParams, nSkip: requestParams.nSkip + 1 })
      isBottomReached.current = true
    }
  }
  const optimizedSearch = debounce((txt, { action, prevInputValue }) => {
    if (action === 'input-change') {
      if (txt) setRequestParams({ ...requestParams, sSearch: txt, nSkip: 1 })
    }
    if (action === 'set-value') {
      prevInputValue && setRequestParams({ ...requestParams, sSearch: '', nSkip: 1 })
    }
    if (action === 'menu-close') {
      prevInputValue && setRequestParams({ ...requestParams, sSearch: '', nSkip: 1 })
    }
  })
  function getPlayerSlug(data) {
    const exceptLastSlash = data.oSeo.sSlug?.lastIndexOf('/')
    setPlayerUrl(data.oSeo.sSlug ? data.oSeo.sSlug.substring(0, exceptLastSlash) + '/' : '')
    return {
      ...data,
      oSeo: {
        ...data.oSeo,
        sSlug: data.oSeo.sSlug?.substring(exceptLastSlash + 1)
      }
    }
  }
  function handleDeleteImg(key) {
    id && setPlayerData({ ...playerData, [key]: { ...playerData[key], sUrl: '' } })
  }

  function handleUpdateData(data) {
    setPlayerData(data)
  }

  return (
    <>
      <Form onSubmit={handleSubmit(onEditPlayer)}>
        <Row>
          <Col sm="8">
            <EditPlayer
              data={data && data?.getPlayerById}
              register={register}
              errors={playerErrors}
              handleSubmit={handleSubmit}
              reset={reset}
              watch={watch}
              setError={setError}
              setValue={setValue}
              clearErrors={clearErrors}
              control={control}
              values={getValues()}
              // nameChanged={(e) => setName((ps) => (ps || e))}
              countryList={countryList}
              loadingCountry={loadingCountry}
              handleScrollCountry={handleScrollCountry}
              optimizedSearch={optimizedSearch}
            />
            <CommonSEO
              register={register}
              errors={playerErrors}
              values={getValues()}
              setError={setError}
              clearErrors={clearErrors}
              previewURL={playerData?.oSeo?.oFB?.sUrl || playerData?.oSeo?.oTwitter?.sUrl}
              fbImg={playerData?.oSeo?.oFB?.sUrl}
              twitterImg={playerData?.oSeo?.oTwitter?.sUrl}
              setValue={setValue}
              control={control}
              slugType={'p'}
              // slug={name}
              hidden
              defaultData={playerData}
              categoryURL={playerUrl}
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
                errors={playerErrors}
                data={playerData}
                onDelete={handleDeleteImg}
                clearErrors={clearErrors}
              />
            </div>
          </Col>
          <div className="btn-bottom add-border mt-4 ">
            <Button
              variant="outline-secondary"
              disabled={playerLoading}
              onClick={() => {
                reset({})
              }}
            >
              <FormattedMessage id="clear" />
            </Button>
            <Button variant="primary" type="submit" className="m-2" disabled={playerLoading || seoLoading}>
              <FormattedMessage id={id ? 'update' : 'add'} />
              {(playerLoading || seoLoading) && <Spinner animation="border" size="sm" />}
            </Button>
          </div>
        </Row>
      </Form>
    </>
  )
}

export default EditPlayerView
