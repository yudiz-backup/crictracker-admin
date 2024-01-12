import React from 'react'
import PropTypes from 'prop-types'

import { S3_PREFIX } from 'shared/constants'
import PermissionProvider from 'shared/components/permission-provider'
import { Button } from 'react-bootstrap'

function QuePollView({ poll, toggle }) {
  return (
    <div className="common-poll-p p-3 position-relative mb-2 w-100" style={{ backgroundImage: `url(${S3_PREFIX + poll?.oBgImgUrl?.sUrl})` }}>
      <div className='d-flex justify-content-between w-100 align-items-center'>
      <h3 className="title w-100 position-relative">{poll?.sTitle}</h3>
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
      <div className="option-list img-list position-relative fs-6 text-center d-flex flex-wrap mt-2">
        {poll?.aField?.map((o) => {
          const percentage = Math.trunc(poll?.nTotalVote >= o?.nVote ? (o?.nVote * 100) / poll?.nTotalVote : 0) || 0
          return (
            <div key={o?._id} className="item w-50 mb-2 px-1 mb-2">
              <div className="option ratio ratio-1x1 position-relative overflow-hidden p-0">
                {o?.eMediaType === 'i' && o?.oMediaUrl?.sUrl && (
                  <img
                    src={S3_PREFIX + o?.oMediaUrl?.sUrl}
                    alt={o?.oMediaUrl?.sAttribute || o?.oMediaUrl?.sText}
                  />
                )}
                {o?.eMediaType === 'v' && o?.oMediaUrl?.sUrl && (
                  <iframe
                    className='d-block'
                    width="560"
                    height="315"
                    src={o?.oMediaUrl?.sUrl}
                    title="YouTube video player"
                    allow="autoplay"
                  />
                )}
                <span className="result position-absolute w-100 start-0 bottom-0" style={{ height: `${percentage}%` }}></span>
                <span className="value position-absolute bottom-0 w-100 start-0 mb-4 text-white h-auto fs-6">{percentage}%</span>
              </div>
              <span className="d-block mt-1">{o?.sTitle}</span>
            </div>
          )
        })}
      </div>
        <span className='d-flex position-relative justify-content-start mt-3'>Total Vote : {poll?.nTotalVote}</span>
    </div>
  )
}
QuePollView.propTypes = {
  poll: PropTypes.object,
  toggle: PropTypes.bool
}
export default QuePollView
