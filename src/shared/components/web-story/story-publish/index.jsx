import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router'
import { useMutation } from '@apollo/client'
import { FormattedMessage } from 'react-intl'
import moment from 'moment'

import ArticleTab from 'shared/components/article-tab'
import StoryButton from '../story-buttons'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import useModal from 'shared/hooks/useModal'
import Loading from 'shared/components/loading'
import { EDIT_STORY } from 'graph-ql/web-story/mutation'
import RedirectionPopup from 'shared/components/article-add-edit-components/redirection-popup'
import ArticleStatus from 'shared/components/article-add-edit-components/article-status'

function StoryPublish({
  storyData,
  register,
  handleSubmit,
  control,
  disabled,
  getWebStoryData,
  setValue,
  values,
  getLoading,
  categoryURL
}) {
  const { dispatch } = useContext(ToastrContext)
  const { id } = useParams()
  const { isShowing, toggle } = useModal()

  const [editWebStory, { loading: editLoading }] = useMutation(EDIT_STORY, {
    onCompleted: (data) => {
      getWebStoryData(id)
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: data?.editWebStory?.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
      })
    }
  })

  const permission = {
    publish: 'PUBLISH_WEB_STORY',
    publishAfterSave: 'PUBLISH_SAVE_CHANGES_WEB_STORY',
    delete: 'DELETE_WEB_STORY',
    deleteAfterPublish: 'PUBLISH_DELETE_WEB_STORY',
    edit: 'EDIT_WEB_STORY'
  }

  function onSubmit(formValue, eState) {
    setValue('dPublishDate', moment.utc(formValue.dateTime).format() || null)
    setValue('eState', eState)
    if (formValue?.oSeo?.sSlug !== storyData?.oSeo?.sSlug && storyData?.eState === 'pub') {
      toggle()
    } else {
      prepareStoryData({ ...formValue, eState })
    }
  }

  function prepareStoryData(value) {
    const data = mapStoryData(value)
    data.oSeo.eType = 'ws'
    data.oSeo.sSlug = categoryURL + data.oSeo.sSlug
    if (id) {
      editWebStory({ variables: { input: { ...data, _id: id } } })
    } else {
      console.log('error')
    }
  }

  function mapStoryData(value) {
    const data = { ...value, oSeo: { ...value?.oSeo } }
    data.iAuthorDId = data.iAuthorDId._id
    data.dPublishDate = data.dPublishDisplayDate
    delete data.dPublishDisplayDate
    delete data.oCoverImg?.__typename
    delete data.oLogoImg?.__typename
    data.eVisibility = data.eVisibility?.value
    data.iCategoryId = data.iCategoryId?._id
    return data
  }

  function onRedirectionSuccess() {
    prepareStoryData({ ...values() })
    toggle()
  }
  return (
    <>
      <ArticleTab title="Publish" event={0}>
        {id && <input type="hidden" name="dPublishDate" {...register('dPublishDate')} />}
        {(!id || (id && storyData)) && (
          <>
            <ArticleStatus
              register={register}
              articleData={storyData}
              control={control}
              disabled={disabled}
              submitHandler={onSubmit}
              handleSubmit={handleSubmit}
              displayAuthorType={'ws'}
              type="ws"
            />
          </>
        )}
        <div className="footer d-flex justify-content-between">
          <StoryButton storyData={storyData} submitHandler={onSubmit} handleSubmit={handleSubmit} permission={permission} tokenType="gws" />
        </div>
        {(editLoading || getLoading) && <Loading />}
        <RedirectionPopup
          sNewUrl={categoryURL + values()?.oSeo?.sSlug}
          sOldUrl={categoryURL + storyData?.oSeo?.sSlug}
          show={isShowing}
          onSuccess={onRedirectionSuccess}
          onClose={toggle}
        />
      </ArticleTab>
    </>
  )
}

StoryPublish.propTypes = {
  storyData: PropTypes.object,
  setValue: PropTypes.func,
  register: PropTypes.func,
  handleSubmit: PropTypes.func,
  control: PropTypes.object,
  disabled: PropTypes.bool,
  getWebStoryData: PropTypes.func,
  values: PropTypes.func,
  getLoading: PropTypes.bool,
  categoryURL: PropTypes.string
}
export default StoryPublish
