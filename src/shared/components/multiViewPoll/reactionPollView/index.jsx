import React from 'react'
import PropTypes from 'prop-types'

import { S3_PREFIX } from 'shared/constants'
import PermissionProvider from 'shared/components/permission-provider'
import { Button } from 'react-bootstrap'

function ReactionPollView({ poll, toggle }) {
  return (
    <div
      className="common-poll-p p-3 position-relative mb-2 w-100"
      style={{ backgroundImage: `url(${S3_PREFIX + poll?.oBgImgUrl?.sUrl})` }}
    >
      <div className="d-flex justify-content-between w-100 align-items-center">
        <h4 className="title position-relative w-100" >{poll?.sTitle}</h4>
        <PermissionProvider isAllowedTo="EDIT_POLL">
          <Button
            // disabled={isPermitted}
            variant="link"
            className="square icon-btn "
            onClick={() => {
              toggle && toggle()
            }}
          >
            <i className="icon-create d-block" />
          </Button>
        </PermissionProvider>
      </div>

      {poll?.eMediaType === 'i' && poll?.oMediaUrl?.sUrl && (
        <img
          className="poll-media mb-3 mt-2 position-relative"
          src={S3_PREFIX + poll?.oMediaUrl?.sUrl}
          alt={poll?.oMediaUrl?.sAttribute || poll?.oMediaUrl?.sText}
        />
      )}
      {poll?.eMediaType === 'v' && poll?.oMediaUrl?.sUrl && (
        <div className="ratio ratio-16x9 poll-media mb-3 position-relative overflow-hidden">
          <iframe className="d-block" width="560" height="315" src={poll?.oMediaUrl?.sUrl} title="YouTube video player" allow="autoplay" />
        </div>
      )}
      <div className="option-list img-list position-relative fs-6 text-center d-flex">
        {poll?.aField?.map((o) => {
          const percentage = Math.trunc(poll?.nTotalVote >= o?.nVote ? (o?.nVote * 100) / poll?.nTotalVote : 0)
          return (
            <div key={o?._id} className="item w-50 px-1">
              <div className="option ratio ratio-1x1 position-relative overflow-hidden p-0 rounded-circle">
                <span className="emoji-option fs-3 position-absolute top-50 start-50 translate-middle w-auto h-auto">
                  {o?.oMediaUrl?.sUrl}
                </span>
                <span className="result position-absolute w-100 start-0 bottom-0" style={{ height: `${percentage}%` }}></span>
              </div>
              <span className="d-block mt-1">{percentage}%</span>
            </div>
          )
        })}
      </div>
      <span className='position-relative d-flex justify-content-start mt-4'>Total Vote : {poll?.nTotalVote}</span>
    </div>
  )
}
ReactionPollView.propTypes = {
  poll: PropTypes.object,
  toggle: PropTypes.bool
}
export default ReactionPollView
