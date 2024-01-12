import React from 'react'
import PropTypes from 'prop-types'

import { S3_PREFIX } from 'shared/constants'
import PermissionProvider from 'shared/components/permission-provider'
import { Button } from 'react-bootstrap'

function SimplePollView({ poll, toggle }) {
  return (
    <div className="common-poll-p p-3 position-relative mb-2 w-100" style={{ backgroundImage: `url(${S3_PREFIX + poll?.oBgImgUrl?.sUrl})` }}>
      <div className='d-flex align-items-center justify-content-between w-100'>
      <h4 className="position-relative" style={{ zIndex: '10' }}>{poll?.sTitle}</h4>
      <PermissionProvider isAllowedTo="EDIT_POLL">
        <Button
          // disabled={isPermitted}
          variant="link"
          className="square icon-btn"
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
          className="poll-media my-3 position-relative"
          src={S3_PREFIX + poll?.oMediaUrl?.sUrl}
          alt={poll?.oMediaUrl?.sAttribute || poll?.oMediaUrl?.sText}
        />
      )}
      {poll?.eMediaType === 'v' && poll?.oMediaUrl?.sUrl && (
        <div className="ratio ratio-16x9 poll-media my-3 position-relative overflow-hidden">
          <iframe
            className='d-block'
            width="560"
            height="315"
            src={poll?.oMediaUrl?.sUrl}
            title="YouTube video player"
            allow="autoplay"
          />
        </div>
      )}
      <div className="option-list position-relative fs-6 text-center mt-2">
        {poll?.aField?.map((o) => {
          const percentage = Math.trunc(poll?.nTotalVote >= o?.nVote ? (o?.nVote * 100) / poll?.nTotalVote : 0)
          return (
            <div key={o?._id} className="option my-1 position-relative overflow-hidden">
              <span className="result position-absolute h-100 start-0 top-0" style={{ width: `${percentage}%` }}></span>
              <span className="position-relative">{o?.sTitle}</span>
            </div>
          )
        })}
      </div>
        <span className='d-flex position-relative justify-content-start mt-3'>Total Vote : {poll?.nTotalVote}</span>
    </div>
  )
}
SimplePollView.propTypes = {
  poll: PropTypes.object,
  toggle: PropTypes.func
}
export default SimplePollView
