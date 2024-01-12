import React, { Suspense, useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Badge } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import moment from 'moment'

import PermissionProvider from 'shared/components/permission-provider'
import CustomAlert from 'shared/components/alert'
import { allRoutes } from 'shared/constants/AllRoutes'
import { useMutation } from '@apollo/client'
import { confirmAlert } from 'react-confirm-alert'
import { ToastrContext } from 'shared/components/toastr'
import { UPDATE_ARTICLE_STATUS } from 'graph-ql/article/mutation'
import { TOAST_TYPE, URL_PREFIX } from 'shared/constants'
import { colorBadge, getArticleState, getDesignation, dateCheck } from 'shared/utils'

const ArticlePreview = React.lazy(() => import('shared/components/article-add-edit-components/article-preview'))
const Drawer = React.lazy(() => import('shared/components/drawer'))

function ArticleItemRowAll({ article, activeTab, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const { dispatch } = useContext(ToastrContext)
  const labels = {
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }

  const [deleteArticle] = useMutation(UPDATE_ARTICLE_STATUS, {
    onCompleted: (data) => {
      if (data.updateArticleStatus) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.updateArticleStatus.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  async function handleStatusChange(status) {
    if (status === 't') {
      confirmAlert({
        title: labels.confirmationTitle,
        message: labels.confirmationMessage,
        customUI: CustomAlert,
        buttons: [
          {
            label: labels.yes,
            onClick: async () => {
              const { data } = await deleteArticle({ variables: { input: { _id: article._id, eState: status } } })
              if (data.updateArticleStatus) {
                onChange(article._id, { eState: status })
              }
            }
          },
          {
            label: labels.no
          }
        ]
      })
    } else {
      const { data } = await deleteArticle({ variables: { input: { _id: article._id, eState: status } } })
      if (data.updateArticleStatus) {
        onChange(article._id, { eState: status })
      }
    }
  }

  function getDate() {
    if (article.eState === 's' || article.eState === 'pub') {
      return moment(dateCheck(article?.dPublishDate)).format('DD MMM YYYY LT')
    } else {
      return moment(dateCheck(article?.dCreated)).format('DD MMM YYYY LT')
    }
  }

  return (
    <>
      <tr>
        <td>
          <div className="icons">
            {article?.oAdvanceFeature?.bBrandedContent && <i className="icon-campaign" />}
            <Badge bg={colorBadge(article?.eState)}>
              <FormattedMessage id={getArticleState(article.eState)} />
            </Badge>
            {article?.bPriority && article?.eState !== 'pub' && <i className="icon-double-arrow-top danger" />}
          </div>
          <p className="title">{article?.sTitle}</p>
          <p className="date">
            <span>
              {article.eState === 's' ? (
                <FormattedMessage id="sd" />
              ) : article.eState === 'pub' ? (
                <FormattedMessage id="pd" />
              ) : (
                <FormattedMessage id="d" />
              )}
            </span>
            {getDate()}
            <span>{article.eState === 's' ? '' : <FormattedMessage id="lm" />}</span>
            {article.eState === 's' ? '' : moment(dateCheck(article?.dUpdated)).format('DD MMM YYYY LT')}
          </p>
          <div className="btn-b">
            <PermissionProvider isAllowedTo="EDIT_ARTICLE">
              <Button variant="link" as={Link} to={allRoutes.editArticle(article?._id)} className="square hover-none" size="sm">
                <FormattedMessage id="edit" />
              </Button>
            </PermissionProvider>
            {article?.eState !== 'pub' && (
              <Button variant="link" className="square hover-none" size="sm" onClick={() => setIsOpen(!isOpen)}>
                <FormattedMessage id="preview" />
              </Button>
            )}
            {article?.eState === 'pub' && (
              <Button variant="link" className="square hover-none" size="sm" target="_blank" href={`${URL_PREFIX}${article?.oSeo?.sSlug}`}>
                <FormattedMessage id="view" />
              </Button>
            )}
            {!['r', 'pub', 't', 's'].includes(article?.eState) && (
              <PermissionProvider isAllowedTo="DELETE_ARTICLE">
                <Button variant="link" className="square hover-none danger" size="sm" onClick={() => handleStatusChange('t')}>
                  <FormattedMessage id="trash" />
                </Button>
              </PermissionProvider>
            )}
            {article?.eState === 'pub' && (
              <PermissionProvider isAllowedTo="PUBLISH_DELETE_ARTICLE">
                <Button variant="link" className="square hover-none danger" size="sm" onClick={() => handleStatusChange('t')}>
                  <FormattedMessage id="trash" />
                </Button>
              </PermissionProvider>
            )}
            {article?.eState === 't' && (
              <PermissionProvider isAllowedTo="EDIT_ARTICLE">
                <Button variant="link" className="square hover-none" size="sm" onClick={() => handleStatusChange('d')}>
                  <FormattedMessage id="restoreToDraft" />
                </Button>
              </PermissionProvider>
            )}
          </div>
        </td>
        {activeTab !== 'all' && (
          <td>
            <a className="link" href={`${URL_PREFIX}authors/${article?.oAuthorSeo?.sSlug}`} target="_blank" rel="noreferrer">
              <p className="cat">{article?.oAuthor?.sUName ? article?.oAuthor?.sUName : ' - '}</p>
            </a>
            <p>{article?.oAuthor?.eDesignation ? getDesignation(article?.oAuthor?.eDesignation) : ' - '}</p>
          </td>
        )}
        <td>
          <p className="cat">
            <span>{article?.oCategory?.sName || '-'}</span>
          </p>
        </td>
        <td>
          <p className="keyword">
            {/* {article?.oSeo?.aKeywords?.length ? <span className="bg-success"></span> : ''} */}
            {article?.oSeo?.aKeywords?.length ? article?.oSeo?.aKeywords.join(', ') : ' - '}
          </p>
        </td>
      </tr>
      <Suspense>
        <Drawer className="article-preview" isOpen={isOpen} onClose={() => setIsOpen(!isOpen)} title={<FormattedMessage id="preview" />}>
          <ArticlePreview slug={article?.oSeo?.sSlug} />
        </Drawer>
      </Suspense>
    </>
  )
}
ArticleItemRowAll.propTypes = {
  article: PropTypes.object,
  activeTab: PropTypes.string,
  onChange: PropTypes.func
}
export default ArticleItemRowAll
