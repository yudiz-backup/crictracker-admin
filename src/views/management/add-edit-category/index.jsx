import React, { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Form, Col, Spinner, Row } from 'react-bootstrap'
import { Link, useHistory, useParams } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl'
import { useMutation, useLazyQuery } from '@apollo/client'

import CommonSEO from 'shared/components/common-seo'
import AddCategory from 'shared/components/add-category'
import UpdateCache from 'shared/components/cache/updateCache'
import AddCache from 'shared/components/cache/addCache'
import { MATCH_MANAGEMENT_BASE_URL, META_ROBOTS, TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { ADD_CATEGORY_MUTATION, GET_CATEGORY_BY_ID, EDIT_CATEGORY_MUTATION } from 'graph-ql/management/category'
import { allRoutes } from 'shared/constants/AllRoutes'
import { removeTypeName, wrapTable } from 'shared/utils'
import CategoryPlayerTeamImage from 'shared/components/category-player-team-image'

function AddEditCategory() {
  const history = useHistory()
  const [categoryData, setCategoryData] = useState()
  const [name, setName] = useState()
  const [parentUrl, setParentUrl] = useState()

  const { id } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const { updateCacheData } = UpdateCache()
  const { addCacheData } = AddCache()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdatingSquads, setIsUpdatingSquads] = useState(false)
  const [isUpdatingMatch, setIsUpdatingMatch] = useState(false)
  const [isUpdatingTeams, setIsUpdatingTeams] = useState(false)
  const close = useIntl().formatMessage({ id: 'close' })
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors: categoryErrors },
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
  const eType = watch('eType')

  const [getCategory, { data }] = useLazyQuery(GET_CATEGORY_BY_ID, {
    onCompleted: (data) => {
      if (data && data.getCategoryById) {
        setCategoryData(checkAndSetParentUrl(data.getCategoryById))
        !categoryData && setCategoryValue(checkAndSetParentUrl(data.getCategoryById))
      }
    }
  })

  const setTitle = (seriesTitle, seriesYear) => {
    if (getValues().eType === 'as' && (!getValues().oSeo?.sTitle || !getValues().oSeo?.sTitle?.length)) {
      return `${seriesTitle} Live Score | ${seriesTitle} ${seriesYear} News, Updates & Scores`
    } else {
      return getValues().oSeo?.sTitle
    }
  }

  const setDescription = (seriesTitle, seriesYear) => {
    if (getValues().eType === 'as' && (!getValues().oSeo?.sDescription || !getValues().oSeo?.sDescription?.length)) {
      return `${seriesTitle} Live Score: Get all the latest ${seriesTitle} ${seriesYear} news, ${seriesTitle} scores, squads, fixtures, injury updates, match results & fantasy tips only on CricTracker`
    } else {
      return getValues().oSeo?.sDescription
    }
  }

  const [AddCategoryMutation, { loading }] = useMutation(ADD_CATEGORY_MUTATION, {
    onCompleted: (data) => {
      if (data && data.addCategory) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.addCategory.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        history.push(allRoutes.categories)
      }
    },
    update: (cache, { data }) => {
      data?.addCategory &&
        addCacheData(GET_CATEGORY_BY_ID, { input: { _id: data.addCategory.oData._id } }, data.addCategory.oData, 'getCategoryById')
    }
  })

  const [EditCategoryMutation, { loading: editCategoryLoader }] = useMutation(EDIT_CATEGORY_MUTATION, {
    onCompleted: (data) => {
      if (data && data.editCategory) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editCategory.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        history.push(allRoutes.categories)
      }
    },
    update: (cache, { data }) => {
      if (data?.editCategory) {
        updateCacheData(GET_CATEGORY_BY_ID, { input: { _id: id } }, data.editCategory?.oData, 'getCategoryById')
      }
    }
  })

  useEffect(() => {
    id && getCategory({ variables: { input: { _id: id } } })
  }, [id])

  function onAddCategory(formValue) {
    prepareCategoryData(formValue)
  }

  function prepareCategoryData(value) {
    delete value.oImg.fSUrl
    delete value.oImg.sAttribution
    const data = JSON.parse(JSON.stringify(value))
    const inputValue = {
      eType: data.eType,
      sName: data.sName,
      sSrtTitle: data?.sSrtTitle,
      bIsLeague: data?.bIsLeague,
      isBlockedMini: data?.isBlockedMini,
      sContent: data.sContent ? wrapTable(data.sContent) : '',
      iParentId: data?.oParentCategory?._id,
      iSeriesId: data?.oSeries?._id,
      oImg: { ...value.oImg },
      oSeo: {
        ...value.oSeo,
        sTitle: setTitle(data?.sSrtTitle || data?.sName, data?.oSeries?.sSeason),
        sDescription: setDescription(data?.sSrtTitle || data?.sName, data?.oSeries?.sSeason),
        eType: 'ct',
        sSlug: parentUrl ? parentUrl + data?.oSeo?.sSlug : data?.oSeo?.sSlug,
        sRobots: data?.oSeo?.sRobots || META_ROBOTS[0]
      }
    }
    if (id) {
      EditCategoryMutation({ variables: { input: { categoryInput: inputValue, _id: id } } })
    } else {
      AddCategoryMutation({ variables: { input: { categoryInput: inputValue } } })
    }
  }
  function setCategoryValue(value) {
    reset({
      eType: value?.eType,
      sName: value?.sName,
      sContent: value?.sContent,
      bIsLeague: value?.bIsLeague,
      isBlockedMini: value?.oSeries?.isBlockedMini,
      iParentId: data?.oParentCategory?._id,
      iSeriesId: data?.oSeries?._id,
      sSrtTitle: value?.oSeries?.sSrtTitle,
      oSeries: removeTypeName(value.oSeries),
      oParentCategory: removeTypeName(value.oParentCategory),
      oImg: { ...removeTypeName(value.oImg) },
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

  function checkAndSetParentUrl(data) {
    if (data.oParentCategory) {
      setParentUrl(data.oParentCategory.oSeo.sSlug + '/' || '')
      return {
        ...data,
        oSeo: {
          ...data.oSeo,
          sSlug: data?.oSeo?.sSlug?.substring(data.oSeo.sSlug.lastIndexOf('/') + 1)
        }
      }
    } else {
      return data
    }
  }

  const updatePayload = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ iSeriesId: data?.getCategoryById?.oSeries?._id })
  }

  const handleUpdateStandings = () => {
    setIsUpdating(true)
    try {
      fetch(`${MATCH_MANAGEMENT_BASE_URL}/series-statistics`, updatePayload)
        .then(() => {
          fetch(`${MATCH_MANAGEMENT_BASE_URL}/series-standing`, updatePayload)
        })
        .then((data) => {
          setIsUpdating(false)
          dispatch({
            type: 'SHOW_TOAST',
            payload: {
              message: <FormattedMessage id="updateStandingStatsMsg" />,
              type: TOAST_TYPE.Success,
              btnTxt: close
            }
          })
        })
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateSquads = () => {
    setIsUpdatingSquads(true)
    fetch(`${MATCH_MANAGEMENT_BASE_URL}/series-squad`, updatePayload)
      .then((data) => {
        return data.json()
      })
      .then((data) => {
        setIsUpdatingSquads(false)
        if (data?.status === 200) {
          dispatch({
            type: 'SHOW_TOAST',
            payload: {
              message: <FormattedMessage id="updateSquadsTeamsMsg" />,
              type: TOAST_TYPE.Success,
              btnTxt: close
            }
          })
        } else {
          dispatch({
            type: 'SHOW_TOAST',
            payload: {
              message: data?.message,
              type: TOAST_TYPE.Error,
              btnTxt: close
            }
          })
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }
  const handleUpdateTeams = () => {
    setIsUpdatingTeams(true)
    fetch(`${MATCH_MANAGEMENT_BASE_URL}/update-team`, updatePayload)
      .then((data) => {
        return data.json()
      })
      .then((data) => {
        setIsUpdatingTeams(false)
        dispatch({
          type: 'SHOW_TOAST',
          payload: {
            message: data?.message,
            type: data?.status === 200 ? TOAST_TYPE.Success : TOAST_TYPE.Error,
            btnTxt: close
          }
        })
      })
      .catch((err) => {
        setIsUpdatingTeams(false)
        dispatch({
          type: 'SHOW_TOAST',
          payload: {
            message: err.message,
            type: TOAST_TYPE.Error,
            btnTxt: close
          }
        })
      })
  }
  const handleUpdateMatch = () => {
    setIsUpdatingMatch(true)
    fetch(`${MATCH_MANAGEMENT_BASE_URL}/match-info`, updatePayload)
      .then((data) => {
        return data.json()
      })
      .then((data) => {
        setIsUpdatingMatch(false)
        if (data?.status === 200) {
          dispatch({
            type: 'SHOW_TOAST',
            payload: {
              message: <FormattedMessage id="MatchUpdateMsg" />,
              type: TOAST_TYPE.Success,
              btnTxt: close
            }
          })
        } else {
          dispatch({
            type: 'SHOW_TOAST',
            payload: {
              message: data?.message,
              type: TOAST_TYPE.Error,
              btnTxt: close
            }
          })
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }

  function handleDeleteImg(key) {
    id && setCategoryData({ ...categoryData, [key]: { ...categoryData[key], sUrl: '' } })
  }

  function handleUpdateData(data) {
    setCategoryData(data)
  }
  return (
    <>
      <Form onSubmit={handleSubmit(onAddCategory)}>
        <Row>
          <Col sm="8">
            <AddCategory
              data={data && data?.getCategoryById}
              register={register}
              errors={categoryErrors}
              setValue={setValue}
              control={control}
              nameChanged={(e) => setName(e)}
              watch={watch}
              reset={reset}
              values={getValues()}
              getParentUrl={setParentUrl}
            />
            <CommonSEO
              register={register}
              errors={categoryErrors}
              values={getValues()}
              setError={setError}
              clearErrors={clearErrors}
              previewURL={categoryData?.seo?.oFB?.sUrl || categoryData?.seo?.oTwitter?.sUrl}
              fbImg={categoryData?.seo?.oFB?.sUrl}
              twitterImg={categoryData?.seo?.oTwitter?.sUrl}
              setValue={setValue}
              control={control}
              id={id}
              slugType={'ct'}
              slug={name && parentUrl ? `${parentUrl}${name}` : name || undefined}
              hidden
              defaultData={categoryData}
              categoryURL={parentUrl}
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
                errors={categoryErrors}
                data={categoryData}
                onDelete={handleDeleteImg}
                clearErrors={clearErrors}
              />
            </div>
          </Col>
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between">
            <div className="btn-bottom add-border mt-4">
              <Button
                variant="outline-secondary"
                disabled={loading || editCategoryLoader}
                onClick={() => {
                  reset({})
                }}
              >
                <FormattedMessage id="clear" />
              </Button>
              <Button variant="primary" type="submit" className="m-2" disabled={loading || editCategoryLoader}>
                <FormattedMessage id={id ? 'update' : 'add'} />
                {(loading || editCategoryLoader) && <Spinner animation="border" size="sm" />}
              </Button>
            </div>
            {eType === 'as' && data?.getCategoryById?.oSeries?._id && (
              <div className="btn-bottom text-center text-md-left add-border mt-4">
                <Button variant="primary m-2" as={Link} to={allRoutes.manageSeo(id)}>
                  <FormattedMessage id="manageSeo" />
                </Button>
                <Button variant="primary" onClick={handleUpdateMatch} className="m-2" disabled={isUpdatingMatch}>
                  {isUpdatingMatch ? <Spinner animation="border" size="sm" /> : <i className="icon-refresh" />}
                  &nbsp;&nbsp;
                  <FormattedMessage id="match" />
                </Button>
                <Button variant="primary" onClick={handleUpdateSquads} className="m-2" disabled={isUpdatingSquads}>
                  {isUpdatingSquads ? <Spinner animation="border" size="sm" /> : <i className="icon-refresh" />}
                  &nbsp;&nbsp;
                  <FormattedMessage id="updateSquadsTeams" />
                </Button>
                <Button variant="primary" onClick={handleUpdateTeams} className="m-2" disabled={isUpdatingTeams}>
                  {isUpdatingTeams ? <Spinner animation="border" size="sm" /> : <i className="icon-refresh" />}
                  &nbsp;&nbsp;
                  <FormattedMessage id="updateTeams" />
                </Button>
                <Button variant="primary" onClick={handleUpdateStandings} className="m-2" disabled={isUpdating}>
                  {isUpdating ? <Spinner animation="border" size="sm" /> : <i className="icon-refresh" />}
                  &nbsp;&nbsp;
                  <FormattedMessage id="updateStandingStats" />
                </Button>
              </div>
            )}
          </div>
        </Row>
      </Form>
    </>
  )
}

export default AddEditCategory
