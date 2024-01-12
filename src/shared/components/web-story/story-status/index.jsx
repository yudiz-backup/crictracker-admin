/* eslint-disable no-unused-vars */
import React from 'react'
import { Badge, Button, Dropdown, ListGroup } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { FormattedMessage, useIntl } from 'react-intl'
import { useParams } from 'react-router'
import { colorBadge, getArticleState, getCurrentUser } from 'shared/utils'
import StoryVisibility from '../story-visibility'
import { S3_PREFIX } from 'shared/constants'
import DisplayAuthor from 'shared/components/article-add-edit-components/display-author'
import RejectModal from 'shared/components/article-add-edit-components/reject-modal'

function StoryStatus({ register, storyData, openComment, control, disabled, displayAuthorType, handleSubmit, submitHandler }) {
  const { id } = useParams()
  const intl = useIntl()
  const currentUser = getCurrentUser()
  return (
    <ListGroup variant="flush">
      <input type="hidden" name="eState" {...register('eState')} defaultValue="d" />
      <ListGroup.Item>
        <FormattedMessage id="status" />:
        <div className="st-box d-inline-block">
          <Badge bg={colorBadge(id ? storyData?.eState : 'd')} className="margin">
            {id ? <FormattedMessage id={getArticleState(storyData?.eState)} /> : '-'}
          </Badge>
        </div>
      </ListGroup.Item>
      <ListGroup.Item>
        <FormattedMessage id="visibility" />:
        <span className="margin">
          <StoryVisibility disabled={disabled} control={control} />
        </span>
      </ListGroup.Item>
      <ListGroup.Item>
        <FormattedMessage id="author" />:
        <span className="user margin">
          {storyData?.oAuthor?.sUrl ? (
            <img src={`${S3_PREFIX}${storyData.oAuthor.sUrl}`} alt={storyData?.oAuthor?.sFName} />
          ) : !id && currentUser?.sUrl ? (
            <img src={`${S3_PREFIX}${currentUser?.sUrl}`} alt={currentUser?.sFName} />
          ) : (
            <i className="icon-account-fill no-img" />
          )}
          {currentUser?._id === storyData?.iAuthorId ? (
            <FormattedMessage id="you" />
          ) : (
            storyData?.oAuthor?.sFName || <FormattedMessage id="you" />
          )}
        </span>
      </ListGroup.Item>
      <ListGroup.Item>
        <FormattedMessage id="displayAuthor" />:
        <span className="user margin">
          <DisplayAuthor control={control} disabled={false} articleData={storyData} type={displayAuthorType} />
        </span>
      </ListGroup.Item>
    </ListGroup>
  )
}

StoryStatus.propTypes = {
  register: PropTypes.func,
  openComment: PropTypes.func,
  storyData: PropTypes.object,
  control: PropTypes.object,
  displayAuthorType: PropTypes.string,
  disabled: PropTypes.bool,
  handleSubmit: PropTypes.func,
  submitHandler: PropTypes.func
}

export default StoryStatus
