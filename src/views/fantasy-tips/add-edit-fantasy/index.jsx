import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Col, Form, Row } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { useForm } from 'react-hook-form'
import { useLazyQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import CountInput from 'shared/components/count-input'
import Permalink from 'shared/components/article-add-edit-components/permalink'
import CommonSEO from 'shared/components/common-seo'
import FeaturedImage from 'shared/components/article-add-edit-components/featured-image'
import EditorNotes from 'shared/components/article-add-edit-components/editor-notes'
import AdvancedFeatures from 'shared/components/article-add-edit-components/advanced-features'
import OtherInfo from 'shared/components/fantasy-tips-add-edit-components/other-info'
import FantasyTipsMatchPreview from 'shared/components/fantasy-tips-add-edit-components/fantasy-tips-match-preview'
import Picks from 'shared/components/fantasy-tips-add-edit-components/picks'
import CaptainsSelection from 'shared/components/fantasy-tips-add-edit-components/captains-selection'
import TagYourContent from 'shared/components/article-add-edit-components/tag-your-content'
import PlayingXI, { playingXIFields } from 'shared/components/fantasy-tips-add-edit-components/playing-xi'
import ArticleViewCount from 'shared/components/article-add-edit-components/article-view-count'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { GET_FANTASY_ARTICLE, GET_FANTASY_PLAYER_LIST } from 'graph-ql/fantasy-tips/query'
import { dateCheck, getCurrentUser, removeTypeName } from 'shared/utils'
import { ARTICLE_VISIBILITY, URL_REGEX, E_CVC, FANTASY_LEAGUE_TYPE, FANTASY_PLATFORM } from 'shared/constants'
import FantasyPublish from 'shared/components/fantasy-tips-add-edit-components/fantasy-publish'
import ArticleComments from 'shared/components/article-comments'
import UserComment from 'shared/components/user-comments'
import CommonInput from 'shared/components/common-input'

function AddEditFantasy({ userPermission }) {
  const { id } = useParams()
  const [sTitle, setTitle] = useState()
  const [fantasyData, setFantasyData] = useState(null)
  const [isDisable, setIsDisabled] = useState()
  const [catURL, setCatUrl] = useState('')
  const [players, setPlayers] = useState([])
  const [isCommentOpen, setIsCommentOpen] = useState(false)
  const currentUser = getCurrentUser()
  const falsySlug = useRef()

  const [getPlayer] = useLazyQuery(GET_FANTASY_PLAYER_LIST, {
    onCompleted: (data) => {
      if (data?.listFantasyPlayersInfo) {
        setPlayers(data?.listFantasyPlayersInfo)
        setValue('aLeague', setLeagueData(fantasyData.aLeague, fantasyData?.oMatch, data?.listFantasyPlayersInfo))
      }
    }
  })

  const [getFantasyArticle, { loading }] = useLazyQuery(GET_FANTASY_ARTICLE, {
    onCompleted: (data) => {
      if (data?.getFantasyArticle) {
        !players.length &&
          getPlayer({
            variables: {
              input: {
                iMatchId: data.getFantasyArticle?.iMatchId,
                ePlatformType: data?.getFantasyArticle?.ePlatformType
              }
            }
          })
        setFantasyData(getCategorySlog(data.getFantasyArticle))
        !fantasyData && setArticleData(getCategorySlog(data.getFantasyArticle))
        setIsDisabled(getEditPermission(data.getFantasyArticle))
      }
    }
  })

  useEffect(() => {
    id && getArticleData(id)
  }, [id])

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    getValues,
    watch,
    control,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'all',
    defaultValues: {
      iAuthorDId: { ...currentUser, sFName: useIntl().formatMessage({ id: 'you' }) },
      eVisibility: ARTICLE_VISIBILITY[0],
      aCVCFan: [{ eType: '', iPlayerFanId: '', sDescription: '' }],
      aTopicPicksFan: [{ iPlayerFanId: '', sDescription: '' }],
      aAvoidPlayerFan: [{ iPlayerFanId: '', sDescription: '' }],
      aBudgetPicksFan: [{ iPlayerFanId: '', sDescription: '' }],
      aLeague: [playingXIFields()],
      oSeo: { eSchemaType: 'nar' }
    }
  })

  function getCategorySlog(data) {
    if (data?.ePlatformType || data?.oSeo?.sSlug) {
      setCatUrl(FANTASY_PLATFORM[data?.ePlatformType])
      return {
        ...data,
        slug: data.oSeo.sSlug,
        oSeo: {
          ...data.oSeo,
          sSlug: data.oSeo?.sSlug ? data?.oSeo?.sSlug.replace(FANTASY_PLATFORM[data?.ePlatformType], '') : ''
        }
      }
    } else {
      setCatUrl('')
      return data
    }
  }

  function getArticleData(id) {
    getFantasyArticle({ variables: { input: { _id: id } } })
  }

  function handleDeleteImg(key) {
    id && setFantasyData({ ...fantasyData, [key]: { ...fantasyData[key], sUrl: '' } })
  }

  function setCategoryUrl(e) {
    if (fantasyData?.eState !== 'pub') {
      setCatUrl(e)
    }
  }

  function setArticleData(data) {
    reset({
      sTitle: data.sTitle,
      sSubtitle: data.sSubtitle,
      sSrtTitle: data.sSrtTitle,
      sVideoUrl: data.sVideoUrl,
      frontSlug: data.oSeo.sSlug,
      eState: data.eState,
      sMatchPreview: data.sMatchPreview,
      sMustPick: data.sMustPick,
      nViewCount: data?.nViewCount,
      aCVCFan: replacePlayerId(data.aCVCFan, true),
      aTopicPicksFan: replacePlayerId(data.aTopicPicksFan, false),
      aBudgetPicksFan: replacePlayerId(data.aBudgetPicksFan, false),
      aAvoidPlayerFan: replacePlayerId(data.aAvoidPlayerFan, false),
      oOtherInfo: removeTypeName(data.oOtherInfo),
      dPublishDisplayDate: dateCheck(data.dPublishDisplayDate) || dateCheck(data.dPublishDate) || new Date(),
      aLeague: [playingXIFields()],
      oSeo: {
        sTitle: data.oSeo.sTitle,
        sSlug: data.oSeo.sSlug,
        sDescription: data.oSeo.sDescription,
        aKeywords: data.oSeo.aKeywords ? data.oSeo.aKeywords.join(', ') : '',
        sCUrl: data.oSeo.sCUrl,
        sRobots: data.oSeo.sRobots,
        eSchemaType: data.oSeo.eSchemaType || 'nar',
        oFB: data.oSeo ? removeTypeName(data.oSeo.oFB) : {},
        oTwitter: data.oSeo ? removeTypeName(data.oSeo.oTwitter) : {}
      },
      bPriority: data.bPriority,
      eVisibility: ARTICLE_VISIBILITY.filter((e) => e.value === data.eVisibility)[0],
      iAuthorDId: {
        _id: data.iAuthorDId || currentUser._id,
        sFName: currentUser._id === data.iAuthorDId ? <FormattedMessage id="you" /> : data.oDisplayAuthor.sFName,
        sUrl: data.oDisplayAuthor.sUrl
      },
      oAdvanceFeature: removeTypeName(data.oAdvanceFeature),
      oImg: { ...removeTypeName(data.oImg) },
      oTImg: data.oTImg && { ...removeTypeName(data.oTImg) },
      sEditorNotes: data.sEditorNotes,
      iCategoryId: data.oCategory,
      aSeries: data.aSeriesCategory,
      aTeam: data.aTeamTag,
      aPlayer: data.aPlayerTag,
      aTags: data.aTagsData,
      aPolls: data?.aPoll,
      aQuizId: data?.aQuiz
    })
  }

  function setLeagueData(data, oMatch, selectedPlayers) {
    if (data.length) {
      return data.map((l) => {
        return {
          eLeague: FANTASY_LEAGUE_TYPE.filter((e) => e.value === l.eLeague)[0],
          aTeam: l.aTeam.map((t) => {
            let credits = 100
            const sp = []
            t?.aSelectedPlayerFan.forEach((p) => {
              if (p._id !== t.oTPFan?._id) sp.push(p._id)
            })
            return {
              iCapFanId: t.oCapFan?._id,
              iVCFanId: t.oVCFan?._id,
              // iTPFanId: t.oTPFan?._id,
              // oTeamA: removeTypeName(t.oTeamA),
              oTeamA: { sTitle: t?.oTeamA?.oTeam?.sAbbr, iTeamId: t?.oTeamA?.oTeam?._id, nCount: t?.oTeamA?.nCount },
              oTeamB: { sTitle: t?.oTeamB?.oTeam?.sAbbr, iTeamId: t?.oTeamB?.oTeam?._id, nCount: t?.oTeamB?.nCount },
              aSelectedPlayerFan: sp,
              oInfo: {
                selectedPlayer: selectedPlayers?.filter((p) => {
                  if (sp.includes(p?._id)) {
                    credits -= p.nRating
                    return p
                  } else if (t.oTPFan?._id === p?._id) {
                    return p
                  } else return null
                }),
                nCredits: credits
              }
            }
          })
        }
      })
    } else {
      return [playingXIFields(oMatch?.oTeamScoreA?.oTeam, oMatch?.oTeamScoreB?.oTeam)]
    }
  }

  function replacePlayerId(data = [], isCVC) {
    if (data.length) {
      return data.map((e) => {
        const val = {
          sDescription: e.sDescription,
          iPlayerFanId: e?.oPlayerFan
        }
        if (isCVC) val.eType = E_CVC.filter((t) => t.value === e.eType)[0]
        return val
      })
    } else {
      const val = [{ iPlayerFanId: '', sDescription: '' }]
      if (isCVC) val[0].eType = ''
      return val
    }
  }

  function getEditPermission(data) {
    if (data.eState === 'p' && data.iReviewerId === currentUser._id) return false
    if ((data.eState === 'p' || data.eState === 'd') && !data.iReviewerId && data.iAuthorId === currentUser._id) return false
    if (data.eState === 'cr' || (data.eState === 'd' && data.iAuthorId === currentUser._id)) return false
    if (data.eState === 'cs' && data.iReviewerId === currentUser._id) return false
    if (data.eState === 'pub' && data.iReviewerId === currentUser._id) return false
    // if ((data.eState === 't' && data?.iAuthorId === currentUser?._id) || userPermission.includes('FANTASY_EDIT_ARTICLE')) return false
    return true
  }

  function handleTitleChange(e) {
    falsySlug.current = e.target.value
    !errors.sTitle && fantasyData?.eState !== 'pub' && setTitle(e.target.value)
    !getValues()?.oSeo?.sTitle && setValue('oSeo.sTitle', e.target.value)
  }

  function handleUpdateData(data) {
    setFantasyData(data)
  }

  return (
    <>
      {fantasyData?.iReviewerId && (currentUser?._id === fantasyData?.iAuthorId || currentUser?._id === fantasyData?.iReviewerId) && (
        <ArticleComments articleData={fantasyData} isOpen={isCommentOpen} type="fa" handleChange={() => setIsCommentOpen(!isCommentOpen)} />
      )}
      <Form className="add-article">
        <Row>
          <Col md="8">
            <CountInput
              maxWord={200}
              label={`${useIntl().formatMessage({ id: 'title' })}*`}
              name="sTitle"
              error={errors}
              currentLength={getValues()?.sTitle?.length}
              register={register('sTitle', {
                required: validationErrors.required,
                maxLength: { value: 200, message: validationErrors.rangeLength(10, 200) },
                minLength: { value: 10, message: validationErrors.rangeLength(10, 200) }
              })}
              disabled={isDisable}
              onBlur={handleTitleChange}
            />
            <Permalink
              register={register}
              errors={errors}
              falsySlug={falsySlug.current}
              values={getValues()}
              setValue={setValue}
              setError={setError}
              clearErrors={clearErrors}
              sTitle={sTitle}
              categoryURL={catURL}
              slugType="nar"
              disabled={isDisable}
              defaultSlug={fantasyData?.oSeo?.sSlug}
            />
            <CountInput
              textarea
              maxWord={200}
              label={`${useIntl().formatMessage({ id: 'subTitle' })}*`}
              name="sSubtitle"
              currentLength={getValues()?.sSubtitle?.length}
              error={errors}
              register={register('sSubtitle', {
                required: validationErrors.required,
                maxLength: { value: 200, message: validationErrors.rangeLength(10, 200) },
                minLength: { value: 10, message: validationErrors.rangeLength(10, 200) }
              })}
              disabled={isDisable}
            />
            <CountInput
              maxWord={60}
              label={`${useIntl().formatMessage({ id: 'shortTitle' })}*`}
              name="sSrtTitle"
              currentLength={getValues()?.sSrtTitle?.length}
              error={errors}
              register={register('sSrtTitle', {
                required: validationErrors.required,
                maxLength: { value: 60, message: validationErrors.rangeLength(10, 60) },
                minLength: { value: 10, message: validationErrors.rangeLength(10, 60) }
              })}
              disabled={isDisable}
            />
            <CommonInput
              type="text"
              register={register}
              errors={errors}
              className={errors.sVideoUrl && 'error'}
              name="sVideoUrl"
              label="videoUrl"
              validation={{ pattern: { value: URL_REGEX, message: validationErrors.url } }}
            />
            <FantasyTipsMatchPreview
              disabled={isDisable}
              articleData={fantasyData}
              control={control}
              errors={errors}
              fieldName="sMatchPreview"
              title={useIntl().formatMessage({ id: 'FantasyMatchPreview' })}
              required
              // useCommonMatchPreview
            />
            <CaptainsSelection
              setValue={setValue}
              disabled={isDisable}
              control={control}
              register={register}
              errors={errors}
              players={players}
            />
            <Picks
              control={control}
              register={register}
              errors={errors}
              fieldName="aTopicPicksFan"
              title={useIntl().formatMessage({ id: 'topPicks' })}
              players={players}
              disabled={isDisable}
              isRequired
              setValue={setValue}
            />
            <Picks
              control={control}
              register={register}
              errors={errors}
              fieldName="aBudgetPicksFan"
              title={useIntl().formatMessage({ id: 'budgetPicks' })}
              players={players}
              isRequired
              disabled={isDisable}
              setValue={setValue}
            />
            <Picks
              control={control}
              register={register}
              errors={errors}
              fieldName="aAvoidPlayerFan"
              title={useIntl().formatMessage({ id: 'playersToAvoid' })}
              players={players}
              disabled={isDisable}
              isRequired
              setValue={setValue}
            />
            <FantasyTipsMatchPreview
              disabled={isDisable}
              articleData={fantasyData}
              control={control}
              errors={errors}
              fieldName="sMustPick"
              title={useIntl().formatMessage({ id: 'mustPickForFantasy' })}
            />
            <OtherInfo disabled={isDisable} register={register} errors={errors} />
            <PlayingXI
              register={register}
              errors={errors}
              control={control}
              players={players}
              setValue={setValue}
              articleData={fantasyData}
              disabled={isDisable}
            />
            <CommonSEO
              register={register}
              errors={errors}
              values={getValues()}
              setError={setError}
              clearErrors={clearErrors}
              setValue={setValue}
              control={control}
              fbImg={fantasyData?.oSeo?.oFB?.sUrl || fantasyData?.oTImg?.sUrl || fantasyData?.oImg?.sUrl}
              twitterImg={fantasyData?.oSeo?.oTwitter?.sUrl || fantasyData?.oTImg?.sUrl || fantasyData?.oImg?.sUrl}
              previewURL={fantasyData?.oTImg?.sUrl || fantasyData?.oImg?.sUrl}
              schemaType
              title
              slugType={'nar'}
              extraSlug={'frontSlug'}
              disabled={isDisable}
              categoryURL={catURL}
              defaultData={fantasyData}
              onUpdateData={(e) => handleUpdateData(e)}
            />
          </Col>
          <Col md="4">
            <div className="sticky-column">
              {fantasyData?.eState === 'pub' && fantasyData?.nCommentCount !== 0 && (
                <UserComment type="fa" commentCount={fantasyData.nCommentCount} />
              )}
              <FantasyPublish
                register={register}
                handleSubmit={handleSubmit}
                setValue={setValue}
                values={getValues}
                articleData={fantasyData}
                openComment={() => setIsCommentOpen(!isCommentOpen)}
                disabled={isDisable}
                getArticle={getArticleData}
                getLoading={loading}
                control={control}
                categoryURL={catURL}
                setFantasyData={setFantasyData}
              />
              <FeaturedImage
                register={register}
                setValue={setValue}
                articleData={fantasyData}
                onDelete={handleDeleteImg}
                disabled={isDisable}
                values={getValues()}
                errors={errors}
                clearErrors={clearErrors}
              />
              <TagYourContent
                control={control}
                values={getValues()}
                disabled={isDisable}
                watch={watch}
                setValue={setValue}
                addCategoryURL={setCategoryUrl}
                errors={errors}
                isCategoryDisabled
              />
              {id && (
                <ArticleViewCount errors={errors} register={register} disabled={isDisable} />
              )}
              <EditorNotes errors={errors} register={register} setValue={setValue} disabled={isDisable} />
              <AdvancedFeatures register={register} disabled={isDisable} isFantasy/>
            </div>
          </Col>
        </Row>
      </Form>
    </>
  )
}
AddEditFantasy.propTypes = {
  userPermission: PropTypes.array
}
export default AddEditFantasy
