/* eslint-disable no-unused-vars */
/* eslint-disable no-trailing-spaces */
/* eslint-disable padded-blocks */
import React from 'react'
import PropTypes from 'prop-types'

import { S3_PREFIX } from 'shared/constants'
import { Button } from 'react-bootstrap'
import PermissionProvider from 'shared/components/permission-provider'

function VSPollView({ poll, toggle }) {

  return (
    <>
      <div className="common-poll-p p-0 vs-poll-p position-relative mb-2 w-100 d-flex ">

        <h3 className="position-absolute start-0 top-0 mt-3 px-2 w-100">{poll?.sTitle}</h3>
        <PermissionProvider isAllowedTo="EDIT_POLL">
          <Button
            // disabled={isPermitted}
            variant="link"
            className="square icon-btn position-absolute title mt-3 end-0 mx-3"
            onClick={() => {
              toggle && toggle()
            }}
          >
            <i className="icon-create d-block" />
          </Button>
        </PermissionProvider>

        <div className="items d-flex w-100 text-center">
          {poll?.aField?.map((o) => {
            const percentage = Math.trunc(poll?.nTotalVote >= o?.nVote ? (o?.nVote * 100) / poll?.nTotalVote : 0) || 0
            return (
              <div key={o?._id} className="item w-50 position-relative overflow-hidden c-pointer">
                <div className="option p-0 h-100 w-100 rounded-0 position-relative h-100">
                  {o?.eMediaType === 'i' && o?.oMediaUrl?.sUrl && (
                    <img
                      className="w-100 h-100 position-relative"
                      src={S3_PREFIX + o?.oMediaUrl?.sUrl}
                      alt={o?.oMediaUrl?.sAttribute || o?.oMediaUrl?.sText}
                    />
                  )}
                  {o?.eMediaType === 'v' && o?.oMediaUrl?.sUrl && (
                    <iframe
                      className="d-block"
                      width="560"
                      height="315"
                      src={o?.oMediaUrl?.sUrl}
                      title="YouTube video player"
                      allow="autoplay"
                    />
                  )}
                </div>
                <span className="result position-absolute w-100 start-0 bottom-0" style={{ height: `${percentage}%` }}></span>
                <span className="value position-absolute bottom-0 w-100 start-0 mb-4 top-50 text-white fs-6">{percentage}%</span>
              </div>
            )
          })}
        </div>
        <div className='d-flex justify-content-between align-items-center position-absolute bottom-0'>
          <span className='d-flex justify-content-start mx-4 mb-1'>Total Vote : {poll?.nTotalVote}</span>

        </div>
      </div>

    </>
  )
}
VSPollView.propTypes = {
  poll: PropTypes.object,
  toggle: PropTypes.bool
}
export default VSPollView
