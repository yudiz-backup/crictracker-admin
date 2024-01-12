import React, { useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import { confirmAlert } from 'react-confirm-alert'
import { useMutation, useSubscription } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { useParams } from 'react-router'

import ArticleTab from 'shared/components/article-tab'
import UpdateCache from 'shared/components/cache/updateCache'
import CustomAlert from 'shared/components/alert'
import Loading from 'shared/components/loading'
import ArticleStatus from 'shared/components/article-add-edit-components/article-status'
import ArticleButtons from 'shared/components/article-add-edit-components/article-buttons'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { EDIT_FANTASY_ARTICLE, PICK_FANTASY_ARTICLE, UPDATE_FANTASY_PICK_ARTICLE } from 'graph-ql/fantasy-tips/mutation'
import { GET_FANTASY_ARTICLE } from 'graph-ql/fantasy-tips/query'
import { getCurrentUser, handleContentToArray, removeTypeName, wrapTable } from 'shared/utils'
import RedirectionPopup from 'shared/components/article-add-edit-components/redirection-popup'
import useModal from 'shared/hooks/useModal'
import { FANTASY_ARTICLE_TAKEOVER, FANTASY_ARTICLE_TAKEOVER_UPDATE } from 'graph-ql/fantasy-tips/subscription'
import ArticleTakeOverModal from 'shared/components/modal'

function FantasyPublish({
  register,
  handleSubmit,
  values,
  articleData,
  setValue,
  openComment,
  disabled,
  getArticle,
  getLoading,
  control,
  categoryURL,
  setFantasyData
}) {
  const { id } = useParams()
  const { updateCacheData } = UpdateCache()
  const { dispatch } = useContext(ToastrContext)
  const currentUser = getCurrentUser()
  const { isShowing, toggle } = useModal()
  const { isShowing: showReTakeOver, toggle: handleReOvertake, closeModal } = useModal()
  const intl = useIntl()

  const permission = {
    publish: 'FANTASY_PUBLISH_ARTICLE',
    pick: 'FANTASY_PICK_ARTICLE',
    overtake: 'FANTASY_OVERTAKE_ARTICLE',
    publishAfterSave: 'FANTASY_PUBLISH_SAVE_CHANGES',
    delete: 'FANTASY_DELETE_ARTICLE',
    deleteAfterPublish: 'FANTASY_PUBLISH_DELETE_ARTICLE',
    edit: 'FANTASY_EDIT_ARTICLE'
  }

  const [editArticle, { loading: editLoading }] = useMutation(EDIT_FANTASY_ARTICLE, {
    onCompleted: (data) => {
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: data.editFantasyArticle.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
      })
    },
    update: (cache, { data }) => {
      data?.editFantasyArticle &&
        updateCacheData(GET_FANTASY_ARTICLE, { input: { _id: id } }, data?.editFantasyArticle?.oData, 'getFantasyArticle')
    }
  })

  const [editFantasyPicArticle] = useMutation(UPDATE_FANTASY_PICK_ARTICLE, {
    update: (cache, { data }) => {
      data?.updatePickFantasyArticleData &&
        updateCacheData(GET_FANTASY_ARTICLE, { input: { _id: id } }, data?.updatePickFantasyArticleData?.oData, 'getFantasyArticle')
    }
  })

  const [pickArticle, { loading: pickLoading }] = useMutation(PICK_FANTASY_ARTICLE, {
    onCompleted: (data) => {
      if (data?.pickFantasyArticle) {
        getArticle(id)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.pickFantasyArticle.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
      }
    }
  })

  const { data: isFantasyArticleTakeOver } = useSubscription(FANTASY_ARTICLE_TAKEOVER, {
    variables: { input: { iAdminId: currentUser?._id, _id: id } },
    onSubscriptionData: (data) => {
      if (data) {
        handleReOvertake()
      }
    }
  })

  useSubscription(FANTASY_ARTICLE_TAKEOVER_UPDATE, {
    variables: { input: { iAdminId: currentUser?._id, _id: id } },
    onSubscriptionData: (data) => {
      if (data) {
        setFantasyData(null)
        getArticle(id)
      }
    }
  })

  function onSubmit(formValue, eState) {
    setValue('eState', eState)
    if (articleData?.eState === 'pub' && articleData?.slug !== categoryURL + formValue?.oSeo?.sSlug) {
      toggle()
    } else {
      prepareArticleData({ ...formValue, eState })
    }
  }

  function prepareArticleData(value) {
    const data = mapArticleDataAsPerApi(value)
    data.oSeo = { ...values().oSeo, eType: 'fa' }
    data.oSeo.sSlug = categoryURL + data.oSeo.sSlug
    if (id && !isFantasyArticleTakeOver?.fantasyArticleTakeOver) {
      editArticle({ variables: { input: { ...data, _id: id } } })
    } else if (id && isFantasyArticleTakeOver?.fantasyArticleTakeOver) {
      editFantasyPicArticle({ variables: { input: { ...data, _id: id } } })
    }
  }

  function onRedirectionSuccess() {
    prepareArticleData({ ...values() })
    toggle()
  }

  function handlePickArticle(type) {
    confirmAlert({
      title: intl.formatMessage({ id: 'confirmation' }),
      message: intl.formatMessage(
        { id: 'overtakeMessage' },
        { type: type === 'p' ? intl.formatMessage({ id: 'review' }) : intl.formatMessage({ id: 'overTake' }) }
      ),
      customUI: CustomAlert,
      buttons: [
        {
          label: intl.formatMessage({ id: 'confirm' }),
          onClick: async () => {
            await pickArticle({ variables: { input: { iArticleId: id, eType: type } } })
            closeModal()
          }
        },
        {
          label: intl.formatMessage({ id: 'cancel' })
        }
      ]
    })
  }

  function mapArticleDataAsPerApi(value) {
    const data = JSON.parse(JSON.stringify(value))
    // delete data.oSeo
    delete data.frontSlug
    delete data.oImg.fSUrl
    delete data.articleFtImg
    data.oTImg && delete data.oTImg.fSUrl
    data.iAuthorDId = data.iAuthorDId._id
    data.eVisibility = data.eVisibility.value
    data.iCategoryId = data.iCategoryId._id
    data.sMatchPreview = wrapTable(data?.sMatchPreview)
    data.aMatchPreview = handleContentToArray(wrapTable(data?.sMatchPreview))
    data.sMustPick = data?.sMustPick ? wrapTable(data?.sMustPick) : data?.sMustPick
    data.aMustPick = data?.sMustPick ? handleContentToArray(wrapTable(data?.sMustPick)) : null
    if (id) data.nViewCount = data.nViewCount ? Number(data?.nViewCount) : 0
    data.aPlayer = data.aPlayer ? data.aPlayer.map((e) => e._id) : []
    data.aSeries = data.aSeries ? data.aSeries.map((e) => e._id) : []
    data.aTags = data.aTags ? data.aTags.map((e) => e._id) : []
    data.aTeam = data.aTeam ? data.aTeam.map((e) => e._id) : []
    if (data.aAvoidPlayerFan[data.aAvoidPlayerFan?.length - 1]?.iPlayerFanId) {
      data.aAvoidPlayerFan = data.aAvoidPlayerFan.map((e) => {
        delete e.oPlayer
        return { ...removeTypeName(e), iPlayerFanId: e.iPlayerFanId?._id }
      })
    } else {
      data.aAvoidPlayerFan = []
    }
    data.aBudgetPicksFan = data.aBudgetPicksFan.map((e) => {
      delete e.oPlayer
      return { ...removeTypeName(e), iPlayerFanId: e.iPlayerFanId?._id }
    })
    data.aTopicPicksFan = data.aTopicPicksFan.map((e) => {
      delete e.oPlayer
      return { ...removeTypeName(e), iPlayerFanId: e.iPlayerFanId?._id }
    })
    data.aCVCFan = data.aCVCFan.map((e) => {
      delete e.oPlayer
      return { ...removeTypeName(e), eType: e.eType.value, iPlayerFanId: e.iPlayerFanId?._id }
    })
    data.aLeague = data.aLeague.map((e) => {
      return {
        eLeague: e.eLeague.value,
        aTeam: e.aTeam.map((t) => {
          delete t.oInfo
          delete t.oTP
          delete t.oCap
          delete t.oVC
          delete t?.oTeamA?.sTitle
          delete t?.oTeamB?.sTitle
          // if (articleData.ePlatformType === 'de') delete t.iTPFanId
          return {
            ...t,
            aSelectedPlayerFan: articleData.ePlatformType === 'de' ? t.aSelectedPlayerFan : [...t.aSelectedPlayerFan]
          }
        })
      }
    })
    data.aPollId = data?.aPolls ? data?.aPolls?.map(poll => poll?._id) : []
    data.aQuizId = data?.aQuizId ? data?.aQuizId?.map((poll) => poll?._id) : []
    delete data?.aPolls
    return data
  }

  useEffect(() => {
    if (isFantasyArticleTakeOver?.fantasyArticleTakeOver) {
      // ?.fantasyArticleTakeOver && addUpdateArticle(values())
      prepareArticleData(values())
    }
  }, [isFantasyArticleTakeOver])

  return (
    <ArticleTab title="Publish" event={0}>
      <ArticleTakeOverModal
        show={showReTakeOver}
        name={isFantasyArticleTakeOver?.fantasyArticleTakeOver?.sFName}
        permission={permission}
        pickHandler={handlePickArticle}
      />
      {id && <input type="hidden" name="dPublishDate" {...register('dPublishDate')} />}
      {(!id || (id && articleData)) && (
        <>
          <ArticleStatus
            articleData={articleData}
            openComment={openComment}
            disabled={disabled}
            register={register}
            control={control}
            handleSubmit={handleSubmit}
            submitHandler={onSubmit}
            displayAuthorType={'fa'}
            type="fa"
          />
          <div className="footer d-flex justify-content-between">
            <ArticleButtons
              submitHandler={onSubmit}
              articleData={articleData}
              handleSubmit={handleSubmit}
              setValue={setValue}
              values={values}
              pickHandler={handlePickArticle}
              permission={permission}
              disabled={disabled}
              tokenType="gfa"
            />
          </div>
          <RedirectionPopup
            sNewUrl={categoryURL + values()?.oSeo?.sSlug}
            sOldUrl={articleData?.slug}
            show={isShowing}
            onSuccess={onRedirectionSuccess}
            onClose={toggle}
          />
        </>
      )}
      {(pickLoading || editLoading || getLoading) && <Loading />}
    </ArticleTab>
  )
}
FantasyPublish.propTypes = {
  register: PropTypes.func,
  handleSubmit: PropTypes.func,
  values: PropTypes.func,
  articleData: PropTypes.object,
  setValue: PropTypes.func,
  openComment: PropTypes.func,
  disabled: PropTypes.bool,
  getArticle: PropTypes.func,
  getLoading: PropTypes.bool,
  control: PropTypes.object,
  categoryURL: PropTypes.string,
  setFantasyData: PropTypes.func
}
export default FantasyPublish
