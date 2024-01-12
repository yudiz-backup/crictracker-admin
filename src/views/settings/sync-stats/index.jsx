import React, { useContext, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { ToastrContext } from 'shared/components/toastr'
import { GLOBAL_WIDGET_BASE_URL, TOAST_TYPE } from 'shared/constants'

const SyncStats = () => {
  const [isUpdating, setIsUpdating] = useState()
  const { dispatch } = useContext(ToastrContext)
  const handleUpdateSquads = () => {
    setIsUpdating(true)
    fetch(`${GLOBAL_WIDGET_BASE_URL}/icc-ranking`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).then((data) => {
      return data.json()
    }).then((data) => {
      setIsUpdating(false)
      dispatch({
        type: 'SHOW_TOAST',
        payload: {
          message: <FormattedMessage id="iccRankingUpdateMsg" />,
          type: TOAST_TYPE.Success,
          btnTxt: close
        }
      })
    }).catch((err) => {
      setIsUpdating(false)
      dispatch({
        type: 'SHOW_TOAST',
        payload: {
          message: <FormattedMessage id="somethingWentWrong" />,
          type: TOAST_TYPE.Error,
          btnTxt: close
        }
      })
      console.error(err)
    })
  }
  return (
    <>
      <div className='d-flex flex-column align-items-start'>
        <h4>
          <FormattedMessage id="UpdateIcc" />
        </h4>
        <Button size="md" variant="primary" disabled={isUpdating} onClick={handleUpdateSquads}>
        {(isUpdating) ? <Spinner animation="border" size="sm" /> : <i className="icon-refresh" />}
        &nbsp;&nbsp;<FormattedMessage id="updateRanking" />
        </Button>
      </div>
    </>
  )
}

export default SyncStats
