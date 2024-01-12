import { useLazyQuery } from '@apollo/client'
import React, { useContext, useEffect, useState } from 'react'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { FormattedMessage, useIntl } from 'react-intl'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min'

import { GET_WEB_STORY_BY_ID, UPDATE_WEB_STORY } from 'graph-ql/web-story/query'
import { ToastrContext } from 'shared/components/toastr'
import { ARTICLE_VISIBILITY, TOAST_TYPE } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { dateCheck, getCurrentUser, removeTypeName } from 'shared/utils'
import CommonSEO from 'shared/components/common-seo'
import CountInput from 'shared/components/count-input'
import ToolTip from 'shared/components/tooltip'
import CoverImage from 'shared/components/web-story/coverImage'
import StoryPublish from 'shared/components/web-story/story-publish'

function EditWebStory() {
  const { id } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const currentUser = getCurrentUser()
  const [storyData, setStoryData] = useState()
  const [isDisable, setIsDisabled] = useState(!!id)
  const catURL = 'web-stories/'

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    getValues,
    control,
    reset,
    formState: { errors }
  } = useForm({
    mode: 'all'
  })

  useEffect(() => {
    if (id) {
      getWebStoryData(id)
    }
  }, [id])

  function getWebStoryData(id) {
    getWebStory({ variables: { input: { _id: id } } })
  }

  function updateStoryFromApi(id) {
    updateStory({ variables: { input: { iWPId: id } } })
  }

  const [getWebStory, { loading }] = useLazyQuery(GET_WEB_STORY_BY_ID, {
    onCompleted: (data) => {
      if (data?.getWebStory) {
        const story = getWebStorySlug(data?.getWebStory)
        setStoryData(story)
        !storyData && setStoryValue(story)
        setIsDisabled(getEditPermission(data?.getWebStory))
      }
    }
  })

  const [updateStory] = useLazyQuery(UPDATE_WEB_STORY, {
    onCompleted: (data) => {
      if (data) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.fetchWebStory.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
      }
    }
  })

  function getWebStorySlug(data) {
    if (data.oSeo.sSlug) {
      const newSlug = data?.oSeo?.sSlug.replace(/^web-stories\//, '')
      return {
        ...data,
        oSeo: {
          ...data.oSeo,
          sSlug: newSlug
        }
      }
    } else {
      return {
        ...data,
        oSeo: {
          ...data.oSeo,
          sSlug: data?.oSeo?.sSlug
        }
      }
    }
  }

  function getEditPermission(data) {
    if (data.eState === 'd' || data.eState === 'pub') return false
    return true
  }

  function setStoryValue(data) {
    reset({
      sTitle: data.sTitle,
      dPublishDate: dateCheck(data.dUpdated),
      oCoverImg: data.oCoverImg,
      oLogoImg: data.oLogoImg,
      iAuthorId: data.iAuthorId,
      eVisibility: ARTICLE_VISIBILITY.filter((e) => e.value === data.eVisibility)[0],
      iAuthorDId: {
        _id: data.iAuthorDId || currentUser?._id,
        sFName: currentUser?._id === data.iAuthorDId ? <FormattedMessage id="you" /> : data.oDisplayAuthor.sFName,
        sUrl: data.oDisplayAuthor.sUrl
      },
      oSeo: {
        sTitle: data.oSeo.sTitle,
        sSlug: data.oSeo.sSlug,
        sDescription: data.oSeo.sDescription,
        aKeywords: data.oSeo.aKeywords ? data.oSeo.aKeywords.join(', ') : '',
        sCUrl: data.oSeo.sCUrl,
        sRobots: data.oSeo.sRobots,
        oFB: data.oSeo ? removeTypeName(data.oSeo.oFB) : {},
        oTwitter: data.oSeo ? removeTypeName(data.oSeo.oTwitter) : {}
      }
    })
  }

  function handleUpdateData(data) {
    setStoryData(data)
  }

  function handleDeleteImg(key) {
    id && setStoryData({ ...storyData, [key]: { ...storyData[key], sUrl: '' } })
  }
  const fetchUpdatedStory = useIntl().formatMessage({ id: 'fetchUpdatedStory' })

  return (
    <>
      <Form className="edit-webStory add-article">
      {storyData?.eState === 'pub' || storyData?.eState === 'd' ? <div className='update-story-btn'>
        <ToolTip toolTipMessage={fetchUpdatedStory}>
          <Button className={'icon-refresh' && 'left-icon'} onClick={() => updateStoryFromApi(storyData?.iWPId)}>
            <i className="icon-refresh"></i>
            {fetchUpdatedStory}
          </Button>
        </ToolTip>
        </div> : ''
     }
        <Row className="mt-4">
          <Col md={8}>
            <CountInput
              maxWord={90}
              label={`${useIntl().formatMessage({ id: 'title' })}*`}
              name="sTitle"
              error={errors}
              currentLength={getValues()?.sTitle?.length}
              register={register('sTitle', {
                required: validationErrors.required,
                maxLength: { value: 90, message: validationErrors.rangeLength(4, 90) },
                minLength: { value: 4, message: validationErrors.rangeLength(4, 90) }
              })}
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
              fbImg={storyData?.oSeo?.oFB?.sUrl || storyData?.oCoverImg?.sUrl}
              twitterImg={storyData?.oSeo?.oTwitter?.sUrl || storyData?.oCoverImg?.sUrl}
              previewURL={storyData?.oCoverImg?.sUrl}
              title
              slugType={'ws'}
              disabled={isDisable}
              categoryURL={catURL}
              defaultData={storyData}
              onUpdateData={(e) => handleUpdateData(e)}
            />
          </Col>
          <Col md="4">
            <StoryPublish
              storyData={storyData}
              setValue={setValue}
              values={getValues}
              register={register}
              handleSubmit={handleSubmit}
              control={control}
              categoryURL={catURL}
              getLoading={loading}
              disabled={isDisable}
              getWebStoryData={getWebStoryData}
            />
            <CoverImage
              titleName="coverImage"
              objectName="oCoverImg"
              register={register}
              setValue={setValue}
              storyData={storyData}
              onDelete={handleDeleteImg}
              disabled={isDisable}
              errors={errors}
              clearErrors={clearErrors}
            />
            <CoverImage
              titleName="logoImage"
              objectName="oLogoImg"
              register={register}
              setValue={setValue}
              storyData={storyData}
              onDelete={handleDeleteImg}
              disabled={isDisable}
              errors={errors}
              clearErrors={clearErrors}
            />
          </Col>
        </Row>
      </Form>
    </>
  )
}

export default EditWebStory
