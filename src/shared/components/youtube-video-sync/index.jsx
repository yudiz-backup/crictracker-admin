import React, { useContext } from 'react'
import { Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'

import { TOAST_TYPE } from 'shared/constants'
import { syncVideos } from 'shared/functions/Rest'
import { ToastrContext } from 'shared/components/toastr'
import PermissionProvider from '../permission-provider'

function YouTubeVideoSync({ refetch }) {
  const { dispatch } = useContext(ToastrContext)

  async function sync() {
    try {
      let x = await syncVideos()
      x = await x.json()
      if (x.status === 200) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: {
            message: <FormattedMessage id="PleaseWaitForSomeTimeAndRefreshThePage" />,
            type: TOAST_TYPE.Success,
            btnTxt: <FormattedMessage id="close" />
          }
        })
      } else {
        dispatch({
          type: 'SHOW_TOAST',
          payload: {
            message: <FormattedMessage id="somethingWentWrong" />,
            type: TOAST_TYPE.Error,
            btnTxt: <FormattedMessage id="close" />
          }
        })
      }
    } catch (error) {
      dispatch({
        type: 'SHOW_TOAST',
        payload: {
          message: error.message,
          type: TOAST_TYPE.Error,
          btnTxt: <FormattedMessage id="close" />
        }
      })
    }
  }

  return (
    <PermissionProvider isAllowedTo="FETCH_PLAYLIST">
      <Button
        className="left-icon"
        onClick={() => {
          sync()
        }}
      >
        <i className="icon-refresh" />
        <FormattedMessage id="sync" />
      </Button>
    </PermissionProvider>
  )
}
YouTubeVideoSync.propTypes = {
  refetch: PropTypes.func
}
export default YouTubeVideoSync
