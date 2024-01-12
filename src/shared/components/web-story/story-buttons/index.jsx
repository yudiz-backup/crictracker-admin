import React from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router'
import { Button } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import { getCurrentUser } from 'shared/utils'
// import { URL_PREFIX } from 'shared/constants'
// import StoryShare from '../story-share'
import CustomAlert from 'shared/components/alert'
import PermissionProvider from 'shared/components/permission-provider'

function StoryButton({ storyData, disabled, handleSubmit, submitHandler, permission }) {
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
      {/* draft */}
      <div className="left">
        {(!id || (id && storyData?.eState === 'd')) && (
          <>
            <Button disabled={storyData?.nPage <= 1} size="sm" variant="primary" onClick={handleSubmit((d) => submitHandler(d, 'pub'))}>
              <FormattedMessage id="publish" />
            </Button>
            <Button variant="outline-secondary" disabled={disabled} size="sm" onClick={handleSubmit((d) => submitHandler(d, 'd'))}>
              <FormattedMessage id="saveDraft" />
            </Button>
          </>
        )}

        {/* published */}
        {storyData?.eState === 'pub' && (
          <>
            {currentUser._id && (
              <PermissionProvider isAllowedTo={permission.publishAfterSave}>
                <Button size="sm" variant="primary" onClick={handleSubmit((d) => submitHandler(d, 'pub'))}>
                  <FormattedMessage id="save" /> <FormattedMessage id="changes" />
                </Button>
              </PermissionProvider>
            )}
            {/* view */}
            {/* <Button
              variant="outline-secondary"
              size="sm"
              target="_blank"
              href={`${URL_PREFIX}${storyData?.slug || storyData?.oSeo?.sSlug}`}
            >
              <FormattedMessage id="view" />
            </Button> */}
          </>
        )}

        {/* trash */}
        {storyData?.eState === 't' && (
          <PermissionProvider isAllowedTo={permission.edit}>
            <Button size="sm" variant="primary" onClick={handleSubmit((d) => submitHandler(d, 'd'))}>
              <FormattedMessage id="restoreToDraft" />
            </Button>
          </PermissionProvider>
        )}
      </div>

      <div className="right text-end">
        {/* If Story Share  */}
        {/* {(storyData?.eState !== 'pub' && currentUser._id === storyData.iAuthorId) && ( */}
        {/* {storyData && storyData?.eState !== 'pub' && (
          <StoryShare slug={storyData?.slug || storyData?.oSeo?.sSlug} eType={tokenType} />
        )} */}

        {/* If status is not published  */}
        {id && !['pub', 't'].includes(storyData?.eState) && (
          <PermissionProvider isAllowedTo={permission.delete}>
            <Button variant="link" className="square icon-btn" onClick={handleDelete}>
              <i className="icon-delete d-block text-danger" />
            </Button>
          </PermissionProvider>
        )}

        {/* When status is published */}
        {storyData?.eState === 'pub' && (
          <PermissionProvider isAllowedTo={permission.deleteAfterPublish}>
            <Button variant="link" className="square icon-btn" onClick={handleDelete}>
              <i className="icon-delete d-block text-danger" />
            </Button>
          </PermissionProvider>
        )}
      </div>
    </>
  )
}

StoryButton.propTypes = {
  storyData: PropTypes.object,
  disabled: PropTypes.bool,
  handleSubmit: PropTypes.func,
  submitHandler: PropTypes.func,
  permission: PropTypes.object
}
export default StoryButton
