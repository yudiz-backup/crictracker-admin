import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useForm } from 'react-hook-form'
import { Col, Form, Row } from 'react-bootstrap'
import { useLazyQuery } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { useParams } from 'react-router'

import CountInput from 'shared/components/count-input'
import CommonSEO from 'shared/components/common-seo'
import TinyEditor from 'shared/components/editor'
import ArticleComments from 'shared/components/article-comments'
import Permalink from 'shared/components/article-add-edit-components/permalink'
import Publish from 'shared/components/article-add-edit-components/publish'
import UserComment from 'shared/components/user-comments'
import FeaturedImage from 'shared/components/article-add-edit-components/featured-image'
import EditorNotes from 'shared/components/article-add-edit-components/editor-notes'
import AdvancedFeatures from 'shared/components/article-add-edit-components/advanced-features'
import TagYourContent from 'shared/components/article-add-edit-components/tag-your-content'
import ArticleViewCount from 'shared/components/article-add-edit-components/article-view-count'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { GET_ARTICLE_DETAIL } from 'graph-ql/article/query'
import { ARTICLE_VISIBILITY } from 'shared/constants'
import { removeTypeName, getCurrentUser, dateCheck } from 'shared/utils'
import DisplaySettings from 'shared/components/article-add-edit-components/display-settings'

function AddEditArticle({ userPermission }) {
  const { id } = useParams()
  const [sTitle, setTitle] = useState()
  const [catURL, setCatUrl] = useState('')
  const [articleData, setArticleData] = useState(null)
  const [isCommentOpen, setIsCommentOpen] = useState(false)
  const currentUser = getCurrentUser()
  const falsySlug = useRef()
  const [isDisable, setIsDisabled] = useState(!!id)

  const [getArticle, { loading }] = useLazyQuery(GET_ARTICLE_DETAIL, {
    onCompleted: (data) => {
      if (data?.getArticle) {
        setArticleData(getCategorySlog(data?.getArticle))
        !articleData && setArticleValue(getCategorySlog(data?.getArticle))
        setIsDisabled(getEditPermission(data?.getArticle))
      }
    }
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    getValues,
    control,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'all',
    defaultValues: {
      oSeo: { eSchemaType: 'nar' }
    }
  })

  useEffect(() => {
    if (id) {
      getArticleData(id)
    } else {
      reset({
        iAuthorDId: { ...currentUser, sFName: <FormattedMessage id="you" /> },
        eVisibility: ARTICLE_VISIBILITY[0],
        oSeo: { eSchemaType: 'nar' }
      })
    }
  }, [id])

  function getCategorySlog(data) {
    if (!data?.bOld && data?.oCategory?.oSeo?.sSlug && data?.oSeo?.sSlug) {
      setCatUrl(data.oCategory.oSeo.sSlug + '/')
      return {
        ...data,
        slug: data.oSeo.sSlug,
        oSeo: {
          ...data.oSeo,
          sSlug: data.oSeo.sSlug ? data.oSeo.sSlug.substring(data.oSeo.sSlug.lastIndexOf('/') + 1) : ''
        }
      }
    } else {
      setCatUrl('')
      return {
        ...data,
        slug: data.oSeo.sSlug
      }
    }
  }

  function getArticleData(id) {
    getArticle({ variables: { input: { _id: id } } })
  }

  function setArticleValue(data) {
    reset({
      aPolls: data.aPoll,
      sTitle: data.sTitle,
      sSubtitle: data.sSubtitle,
      sSrtTitle: data.sSrtTitle,
      iEventId: data.iEventId,
      sContent: data.sContent,
      eState: data.eState,
      aTags: data.aTags,
      aPlayer: data.aPlayer,
      aQuizId: data.aQuiz,
      aSecCategories: data.aSeries?.filter((series) => series?.eType !== 'as'),
      aSeries: data.aSeries?.filter((series) => series?.eType === 'as'),
      aTeam: data.aTeam,
      iCategoryId: data.oCategory,
      nViewCount: data?.nViewCount,
      oSticky: removeTypeName(data.oSticky),
      dPublishDisplayDate: dateCheck(data.dPublishDisplayDate) || dateCheck(data.dPublishDate),
      sEditorNotes: data.sEditorNotes,
      oAdvanceFeature: removeTypeName(data.oAdvanceFeature),
      oImg: { ...removeTypeName(data.oImg) },
      oTImg: data.oTImg && { ...removeTypeName(data.oTImg) },
      frontSlug: data.oSeo.sSlug,
      iAuthorDId: {
        _id: data.iAuthorDId || currentUser?._id,
        sFName: currentUser?._id === data.iAuthorDId ? <FormattedMessage id="you" /> : data.oDisplayAuthor.sFName,
        sUrl: data.oDisplayAuthor.sUrl
      },
      bPriority: data.bPriority,
      eVisibility: ARTICLE_VISIBILITY.filter((e) => e.value === data.eVisibility)[0],
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
      }
    })
  }

  function handleDeleteImg(key) {
    id && setArticleData({ ...articleData, [key]: { ...articleData[key], sUrl: '' } })
  }

  function setCategoryUrl(e) {
    if (!articleData?.bOld && articleData?.eState !== 'pub') {
      setCatUrl(e)
    }
  }

  function getEditPermission(data) {
    if (data.eState === 'p' && data.iReviewerId === currentUser._id) return false
    if ((data.eState === 'p' || data.eState === 'd' || data.eState === 'pub') && !data.iReviewerId && data.iAuthorId === currentUser._id) return false
    if (data.eState === 'cr' || (data.eState === 'd' && data.iAuthorId === currentUser._id)) return false
    if (data.eState === 'cs' && data.iReviewerId === currentUser._id) return false
    if (data.eState === 'pub' && data?.iReviewerId === currentUser?._id) return false
    return true
  }

  function handleTitleChange({ target: { value } }) {
    falsySlug.current = value
    !errors.sTitle && articleData?.eState !== 'pub' && setTitle(value)
    !getValues()?.oSeo?.sTitle && setValue('oSeo.sTitle', value)
  }

  function handleUpdateData(data) {
    setArticleData(data)
  }

  return (
    <>
      {articleData?.iReviewerId && (currentUser?._id === articleData?.iAuthorId || currentUser?._id === articleData?.iReviewerId) && (
        <ArticleComments articleData={articleData} type="a" isOpen={isCommentOpen} handleChange={() => setIsCommentOpen(!isCommentOpen)} />
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
              defaultSlug={articleData?.oSeo?.sSlug}
              disabled={isDisable}
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
            <Form.Group className="form-group">
              <Form.Label>
                <FormattedMessage id="content" />*
              </Form.Label>
              <TinyEditor
                className={'form-control'}
                name="sContent"
                control={control}
                setValue={setValue}
                values={getValues}
                initialValue={articleData?.sContent}
                required
                disabled={isDisable}
              />
              {errors.sContent && <Form.Control.Feedback type="invalid">{errors.sContent.message}</Form.Control.Feedback>}
            </Form.Group>
            <CommonSEO
              register={register}
              errors={errors}
              values={getValues()}
              setError={setError}
              clearErrors={clearErrors}
              setValue={setValue}
              control={control}
              fbImg={articleData?.oSeo?.oFB?.sUrl || articleData?.oTImg?.sUrl || articleData?.oImg?.sUrl}
              twitterImg={articleData?.oSeo?.oTwitter?.sUrl || articleData?.oTImg?.sUrl || articleData?.oImg?.sUrl}
              previewURL={articleData?.oTImg?.sUrl || articleData?.oImg?.sUrl}
              schemaType
              title
              slugType={'nar'}
              extraSlug={'frontSlug'}
              disabled={isDisable}
              categoryURL={catURL}
              defaultData={articleData}
              onUpdateData={(e) => handleUpdateData(e)}
            />
          </Col>
          <Col md="4">
            <div className="sticky-column">
              {articleData?.eState === 'pub' && articleData?.nCommentCount !== 0 && (
                <UserComment type="ar" commentCount={articleData.nCommentCount} />
              )}
              <Publish
                register={register}
                handleSubmit={handleSubmit}
                setValue={setValue}
                values={getValues}
                articleData={articleData}
                setArticleData={setArticleData}
                openComment={() => setIsCommentOpen(!isCommentOpen)}
                disabled={isDisable}
                getArticle={getArticleData}
                getLoading={loading}
                control={control}
                categoryURL={catURL}
              />
              <FeaturedImage
                register={register}
                setValue={setValue}
                articleData={articleData}
                onDelete={handleDeleteImg}
                disabled={isDisable}
                values={getValues()}
                errors={errors}
                reset={reset}
                clearErrors={clearErrors}
              />
              <TagYourContent
                setValue={setValue} watch={watch} control={control} values={getValues()} disabled={isDisable} addCategoryURL={setCategoryUrl} errors={errors} />
              {id && (
                <ArticleViewCount errors={errors} register={register} disabled={isDisable} />
              )}
              <EditorNotes errors={errors} register={register} setValue={setValue} disabled={isDisable} />
              {
                articleData?.eState === 'pub' && (
                  <DisplaySettings register={register} disabled={isDisable}/>
                )
              }
              <AdvancedFeatures register={register} disabled={isDisable} />
            </div>
          </Col>
        </Row>
      </Form>
    </>
  )
}
AddEditArticle.propTypes = {
  userPermission: PropTypes.array
}
export default AddEditArticle
