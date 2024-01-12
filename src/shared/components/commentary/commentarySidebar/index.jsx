import React, { forwardRef, useContext, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Spinner } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { useMutation, useQuery, useSubscription } from '@apollo/client'

import { appendParams, bottomReached } from 'shared/utils'
import ToolTip from 'shared/components/tooltip'
import InnerHTML from 'shared/components/innerHTML'
import { COMMENTARY_SUBSCRIPTION } from 'graph-ql/commentary/subscription'
import { GET_COMMENTARY_BY_ID } from 'graph-ql/commentary/query'
import PermissionProvider from 'shared/components/permission-provider'
import { DELETE_COMMENTARY } from 'graph-ql/commentary/mutation'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import CustomAlert from 'shared/components/alert'
import { confirmAlert } from 'react-confirm-alert'

function CommentarySidebar({ id, lastTotal, setValue, setType, reset, values }, ref) {
  const [commentaryData, setCommentaryData] = useState([])
  const isLoading = useRef(false)
  const { dispatch } = useContext(ToastrContext)
  const [payload, setPayload] = useState({ iMatchId: id, nLimit: 10 })

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }

  useEffect(() => {
    ref.current = (value) => {
      refetch({ input: value })
    }
  }, [])

  function handleScroll(e) {
    if (bottomReached(e, 200) && !isLoading.current && lastTotal.current === payload.nLimit) {
      isLoading.current = true
      const timeStamp = commentaryData[commentaryData.length - 1]?.nTimestamp
      const p = { ...payload, nTimestamp: timeStamp }
      setPayload(p)
    }
  }

  const { loading, refetch } = useQuery(GET_COMMENTARY_BY_ID, {
    variables: { input: payload },
    onCompleted: (data) => {
      if (data && data?.listMatchCommentariesV2) {
        const newData = data?.listMatchCommentariesV2
        if (isLoading.current) {
          setCommentaryData([...commentaryData, ...newData])
        } else {
          setCommentaryData(newData)
        }
        lastTotal.current = newData.length
      }
      isLoading.current = false
    }
  })

  useSubscription(COMMENTARY_SUBSCRIPTION, {
    variables: { input: { iMatchId: id } },
    onSubscriptionData: (data) => {
      if (data) {
        const newData = data?.subscriptionData?.data?.listMatchCommentaries
        setCommentaryData([...newData, ...commentaryData])
      }
    }
  })

  const [delCommentary] = useMutation(DELETE_COMMENTARY, {
    onCompleted: (data) => {
      refetch({ input: { iMatchId: id, nLimit: 10 } })
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: data?.deleteCustomCommentary?.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
      })
    }
  })

  function handleCommentary(data) {
    let ballNo
    if (data) {
      ballNo = data.sOver + (data.sBall ? '.' + data.sBall : '')
      appendParams({ id: data?._id, ball: ballNo, type: 'add', com: '' })
    } else {
      ballNo = 'Add First Commentary'
    }
    setType('add')
    setValue('sBall', ballNo === 'null' ? 'Custom Commentary' : ballNo)
    setValue('iBeforeCommId', data?._id)
  }

  function handleEditCommentary(data) {
    setType('edit')
    const ballNo = data.sOver + (data.sBall ? '.' + data.sBall : '')
    appendParams({ id: data?._id, ball: ballNo, type: 'edit', com: data?.sCommentary })
    setValue('sBall', ballNo)
    setValue('iCommId', data?._id)
    setValue('sCommentary', data?.sCommentary)
  }

  function handleDelete(id) {
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.confirmationMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            const defaultComId = values('iCommId')
            await delCommentary({ variables: { input: { iCommId: id } } })
            if (id === defaultComId) {
              reset({
                sCommentary: '',
                sBall: '',
                iBeforeCommId: ''
              })
              appendParams({ id: '', ball: '', type: '', com: '' })
              setType()
            }
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }

  return (
    <div className="position-relative">
      {loading && (
        <div className="live-events-sidebar-loader text-center position-absolute w-100 h-100 d-flex align-items-center justify-content-center">
          <Spinner animation="border" size="md" />
        </div>
      )}
      <div className="live-events-sidebar position-sticky" onScroll={handleScroll}>
        {!loading && commentaryData?.length === 0 && (
          <div className="w-100 h-100 d-flex align-items-center justify-content-center">
            <Button onClick={() => handleCommentary()} className='d-flex'>
              <FormattedMessage id="addCommentary" /><span className='m-1'><i className="icon-add d-block" /></span>
            </Button>
          </div>
        )}
        <div className="d-flex live-events-sidebar-content pb-3 w-100 mt-4">
          {commentaryData?.length > 0 && <div className="live-events-sidebar-timeline-hr-commentary"></div>}
          <div className="d-flex w-100 flex-column gap-2 live-events-sidebar-container">
            {commentaryData &&
              commentaryData?.length > 0 &&
              commentaryData?.map((commentary, index) => {
                return (
                  <div key={index} className="d-flex gap-3">
                    {commentary?.eEvent !== 'p11' && (
                      <>
                        <div className="d-flex flex-column align-items-end gap-2">
                          <ToolTip toolTipMessage={'add Commentary'} className="mx-1">
                            <PermissionProvider isAllowedTo="ADD_CUSTOM_COMMENTARY">
                              <Button className="live-events-label text-center commentary" onClick={() => handleCommentary(commentary)}>
                                <i className="icon-add d-block" />
                              </Button>
                            </PermissionProvider>
                          </ToolTip>
                        </div>

                        <div className="live-article-content d-flex flex-column gap-2 live-events-sidebar-editor-content">
                          <div className="w-100 d-flex align-items-start justify-content-between">
                            <div className="d-flex flex-column align-items-start">
                              <InnerHTML html={commentary?.sCommentary} />
                              {commentary?.sOver ? (
                                <p className="d-flex flex-column align-items-center mt-2">
                                  <FormattedMessage id="ball" /> {commentary?.sOver}
                                  {commentary?.sBall && `.${commentary?.sBall}`}
                                </p>
                              ) : (
                                ''
                              )}
                            </div>

                            <div className="d-flex align-items-center text-nowrap">
                              {commentary?.eEvent === 'c' && (
                                <>
                                  <PermissionProvider isAllowedTo="EDIT_CUSTOM_COMMENTARY">
                                    <Button variant="link" className="square icon-btn" onClick={() => handleEditCommentary(commentary)}>
                                      <i className="icon-create d-block" />
                                    </Button>
                                  </PermissionProvider>
                                  <PermissionProvider isAllowedTo="DELETE_CUSTOM_COMMENTARY">
                                    <Button
                                      variant="link"
                                      className="square text-danger icon-btn"
                                      onClick={() => handleDelete(commentary?._id)}
                                    >
                                      <i className="icon-delete d-block" />
                                    </Button>
                                  </PermissionProvider>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}

CommentarySidebar.propTypes = {
  lastTotal: PropTypes.object,
  setValue: PropTypes.func,
  setType: PropTypes.func,
  id: PropTypes.number,
  reset: PropTypes.func,
  values: PropTypes.func
}

export default forwardRef(CommentarySidebar)
