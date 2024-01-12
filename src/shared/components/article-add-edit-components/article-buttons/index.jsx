import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'

import { getCurrentUser } from 'shared/utils'
import { useParams } from 'react-router'
import PermissionProvider from 'shared/components/permission-provider'
import ScheduleModal from '../schedule-modal'
import ArticleShare from '../article-share'
import { confirmAlert } from 'react-confirm-alert'
import CustomAlert from 'shared/components/alert'
import { URL_PREFIX } from 'shared/constants'

const Drawer = React.lazy(() => import('shared/components/drawer'))
const ArticlePreview = React.lazy(() => import('../article-preview'))

function ArticleButtons({ articleData, handleSubmit, setValue, values, submitHandler, pickHandler, permission, disabled, tokenType }) {
  const [isOpen, setIsOpen] = useState(false)
  const { id } = useParams()
  const currentUser = getCurrentUser()

  const labels = {
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }

  function handleDelete() {
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.confirmationMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            handleSubmit((d) => submitHandler(d, 't'))()
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }

  return (
    <>
      <div className="left">
        {/* When status is draft */}
        {(!id || (id && articleData?.eState === 'd')) && (
          <>
            <Button size="sm" disabled={disabled} variant="primary" onClick={handleSubmit((d) => submitHandler(d, 'p'))}>
              <FormattedMessage id="submitForReview" />
            </Button>
            <Button variant="outline-secondary" disabled={disabled} size="sm" onClick={handleSubmit((d) => submitHandler(d, 'd'))}>
              <FormattedMessage id="saveDraft" />
            </Button>
          </>
        )}
        {/* When status is pending */}
        {articleData?.eState === 'p' && (
          <>
            {currentUser._id === articleData.iReviewerId && (
              <PermissionProvider isAllowedTo={permission.publish}>
                <Dropdown as={ButtonGroup}>
                  <Button size="sm" variant="primary" onClick={handleSubmit((d) => submitHandler(d, 'pub'))}>
                    <FormattedMessage id="publish" />
                  </Button>
                  <Dropdown.Toggle size="sm" split variant="primary" />
                  <Dropdown.Menu>
                    <ScheduleModal setValue={setValue} formSubmit={submitHandler} articleSubmit={handleSubmit} />
                  </Dropdown.Menu>
                </Dropdown>
              </PermissionProvider>
            )}
            {!articleData.iReviewerId && (
              <PermissionProvider isAllowedTo={permission.pick}>
                <Button size="sm" variant="primary" onClick={() => pickHandler('p')}>
                  <FormattedMessage id="review" />
                </Button>
              </PermissionProvider>
            )}
            {articleData.iReviewerId && currentUser._id !== articleData.iReviewerId && (
              <PermissionProvider isAllowedTo={permission.overtake}>
                <Button size="sm" variant="primary" onClick={() => pickHandler('o')}>
                  <FormattedMessage id="overTake" />
                </Button>
              </PermissionProvider>
            )}
            {!articleData.iReviewerId && currentUser._id === articleData.iAuthorId && (
              <Button size="sm" variant="primary" onClick={handleSubmit((d) => submitHandler(d, 'p'))}>
                &nbsp;
                <FormattedMessage id="edit" />
                &nbsp;
              </Button>
            )}
            {currentUser._id === articleData.iReviewerId && (
              <Button variant="outline-secondary" size="sm" onClick={handleSubmit((d) => submitHandler(d, 'p'))}>
                <FormattedMessage id="save" /> <FormattedMessage id="changes" />
              </Button>
            )}
          </>
        )}
        {/* When status is changes remaining */}
        {articleData?.eState === 'cr' && (
          <>
            {currentUser._id === articleData?.iAuthorId && (
              <>
                <Button size="sm" variant="primary" onClick={handleSubmit((d) => submitHandler(d, 'cs'))}>
                  <FormattedMessage id="resubmitChanges" />
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={handleSubmit((d) => submitHandler(d, 'cr'))}>
                  <FormattedMessage id="save" /> <FormattedMessage id="changes" />
                </Button>
              </>
            )}
            {/* {articleData.iReviewerId && currentUser._id !== articleData.iReviewerId && (
              <PermissionProvider isAllowedTo={permission.overtake}>
                <Button size="sm" variant="primary" onClick={() => pickHandler('o')}>
                  <FormattedMessage id="overTake" />
                </Button>
              </PermissionProvider>
            )} */}
          </>
        )}
        {/* When status is changes submitted */}
        {articleData?.eState === 'cs' && (
          <>
            {currentUser._id === articleData.iReviewerId && (
              <>
                <PermissionProvider isAllowedTo={permission.publish}>
                  <Dropdown as={ButtonGroup}>
                    <Button size="sm" variant="primary" onClick={handleSubmit((d) => submitHandler(d, 'pub'))}>
                      <FormattedMessage id="publish" />
                    </Button>
                    <Dropdown.Toggle size="sm" split variant="primary" />
                    <Dropdown.Menu>
                      <ScheduleModal setValue={setValue} formSubmit={submitHandler} articleSubmit={handleSubmit} />
                    </Dropdown.Menu>
                  </Dropdown>
                </PermissionProvider>
                <Button variant="outline-secondary" size="sm" onClick={handleSubmit((d) => submitHandler(d, 'cs'))}>
                  <FormattedMessage id="save" /> <FormattedMessage id="changes" />
                </Button>
              </>
            )}
          </>
        )}
        {/* When state is schedule */}
        {articleData?.eState === 's' && (
          <PermissionProvider isAllowedTo={permission.publish}>
            <Button size="sm" variant="primary" onClick={handleSubmit((d) => submitHandler(d, 'p'))}>
              <FormattedMessage id="cancel" />
            </Button>
          </PermissionProvider>
        )}
        {/* When status is published */}
        {articleData?.eState === 'pub' && (
          <>
            {currentUser._id !== articleData?.iReviewerId && (
              <PermissionProvider isAllowedTo={permission.publishAfterSave}>
                <Button size="sm" variant="primary" onClick={() => pickHandler('o')}>
                  <FormattedMessage id="overTake" />
                </Button>
              </PermissionProvider>
            )}
            {currentUser._id === articleData?.iReviewerId && (
              <PermissionProvider isAllowedTo={permission.publishAfterSave}>
                <Button size="sm" variant="primary" onClick={handleSubmit((d) => submitHandler(d, 'pub'))}>
                  <FormattedMessage id="save" /> <FormattedMessage id="changes" />
                </Button>
              </PermissionProvider>
            )}
            <Button
              variant="outline-secondary"
              size="sm"
              target="_blank"
              href={`${URL_PREFIX}${articleData?.slug || articleData?.oSeo?.sSlug}`}
            >
              <FormattedMessage id="view" />
            </Button>
          </>
        )}
        {/* When status is trash */}
        {articleData?.eState === 't' && (
          <PermissionProvider isAllowedTo={permission.edit}>
            <Button size="sm" variant="primary" onClick={handleSubmit((d) => submitHandler(d, 'd'))}>
              <FormattedMessage id="restoreToDraft" />
            </Button>
          </PermissionProvider>
        )}
        {articleData && articleData?.eState !== 'pub' && articleData?.oSeo?.sSlug && (
          <Button variant="outline-secondary" size="sm" onClick={() => setIsOpen(!isOpen)}>
            <FormattedMessage id="preview" />
          </Button>
        )}
      </div>
      <div className="right text-end">
        {/* {(articleData?.eState !== 'pub' && currentUser._id === articleData.iAuthorId) && ( */}
        {articleData && articleData?.eState !== 'pub' && (
          <ArticleShare slug={articleData?.slug || articleData?.oSeo?.sSlug} eType={tokenType} />
        )}
        {/* If status is not rejected  */}
        {id && !['r', 'pub', 't', 's'].includes(articleData?.eState) && (
          <PermissionProvider isAllowedTo={permission.delete}>
            <Button variant="link" className="square icon-btn" onClick={handleDelete}>
              <i className="icon-delete d-block text-danger" />
            </Button>
          </PermissionProvider>
        )}
        {/* When status is published */}
        {articleData?.eState === 'pub' && (
          <PermissionProvider isAllowedTo={permission.deleteAfterPublish}>
            <Button variant="link" className="square icon-btn" onClick={handleDelete}>
              <i className="icon-delete d-block text-danger" />
            </Button>
          </PermissionProvider>
        )}
      </div>
      <Drawer className="article-preview" isOpen={isOpen} onClose={() => setIsOpen(!isOpen)} title={<FormattedMessage id="preview" />}>
        <ArticlePreview slug={articleData?.slug || articleData?.oSeo?.sSlug} isAmp={values()?.oAdvanceFeature?.bAmp} />
      </Drawer>
    </>
  )
}
ArticleButtons.propTypes = {
  articleData: PropTypes.object,
  handleSubmit: PropTypes.func,
  setValue: PropTypes.func,
  values: PropTypes.func,
  submitHandler: PropTypes.func,
  pickHandler: PropTypes.func,
  permission: PropTypes.object,
  disabled: PropTypes.bool,
  tokenType: PropTypes.string
}
export default React.memo(ArticleButtons)
