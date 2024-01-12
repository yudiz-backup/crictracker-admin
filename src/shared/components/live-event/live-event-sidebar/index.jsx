import moment from 'moment'
import PropTypes from 'prop-types'
import React, { useContext, useEffect, useRef } from 'react'
import { Badge, Button, Nav, Spinner } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { useMutation } from '@apollo/client'
import { confirmAlert } from 'react-confirm-alert'
import { useHistory } from 'react-router-dom'

import { DELETE_LIVE_EVENT_CONTENT } from 'graph-ql/live-events/mutations'
import { convertDateWithTime, bottomReached } from 'shared/utils'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import CustomAlert from 'shared/components/alert'
import pollImg from 'assets/images/poll.svg'
import liveImg from 'assets/images/live.svg'
import Search from 'shared/components/search'
import MultiViewPoll from 'shared/components/multiViewPoll'
import InnerHTML from 'shared/components/innerHTML'

function LiveEventSideBar({ eContent, isPermitted, lastTotal, isLoading, loading, content, payload, setPayload, setContent, handleSearch }) {
  const { dispatch } = useContext(ToastrContext)
  const selectedTab = useRef('pb')
  const history = useHistory()

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    deleteMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }

  const [deleteLiveBlogContent] = useMutation(DELETE_LIVE_EVENT_CONTENT, {
    onCompleted: (data) => {
      if (data && data?.deleteLiveBlogContent) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.deleteLiveBlogContent?.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
      }
    }
  })

  function handleTab(aStatus) {
    selectedTab.current = aStatus?.toString()
    setPayload({ ...payload, aStatus, nSkip: 1 })
  }

  function handleUpdatePoll(data) {
    setContent((content) => content?.map((e) => e?.iPollId === data?.oData?._id ? ({ ...e, oPoll: data.oData }) : e))
  }

  function handleDelete(id) {
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.deleteMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            await deleteLiveBlogContent({ variables: { input: { _id: id } } })
            setContent(content?.filter((e) => e?._id !== id))
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }

  function handleScroll(e) {
    if (bottomReached(e, 200) && !isLoading.current && lastTotal.current === payload.nLimit) {
      isLoading.current = true
      const p = { ...payload, nSkip: payload?.nSkip + 1 }
      setPayload(p)
    }
  }

  useEffect(() => {
    if (eContent?.eStatus === selectedTab.current) {
      if (eContent?.eType === 'new') setContent([eContent?.oData, ...content])
      if (eContent?.eType === 'edit') {
        setContent(content.map((e) => {
          if (e?._id === eContent?.oData?._id) return eContent?.oData
          return e
        }))
      }
    }
  }, [eContent])

  return (
    <div className='position-relative'>
      {loading && (
        <div className='live-events-sidebar-loader text-center position-absolute w-100 h-100 d-flex align-items-center justify-content-center'>
          <Spinner animation="border" size="md" />
        </div>
      )}
      <div className='live-events-sidebar position-sticky' onScroll={handleScroll}>
        <Nav variant='tabs' className='fixed text-center w-100 text-uppercase position-sticky mx-0 live-events-sidebar-header top-0 d-flex align-items-center'>
          <Nav.Item className={`w-50 ${selectedTab.current === 'pb' && 'bg-primary'}`}>
            <Nav.Link as='button' className='w-100 border border-0 h6 text-light' onClick={() => handleTab(['pb'])}>
              <FormattedMessage id="published" />
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className={`w-50 ${selectedTab.current === 'dr,s' && 'bg-primary'}`}>
            <Nav.Link as='button' className='w-100 border border-0 h6 text-light' onClick={() => handleTab(['dr', 's'])}>
              <FormattedMessage id='draft' />
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <div className='w-100 p-3 mb-0'>
          <Search className="search-box only-border mb-0 w-100" searchEvent={(e) => handleSearch(e)} />
        </div>
        {!loading && content?.length === 0 && (
          <div className='w-100 h-100 d-flex align-items-center justify-content-center'>
            <h4>NO DATA</h4>
          </div>
        )}
        <div className='d-flex live-events-sidebar-content pb-3 w-100'>
          {content?.length > 0 && <div className='live-events-sidebar-timeline-hr'></div>}
          <div className='d-flex w-100 flex-column gap-2 live-events-sidebar-container'>
            {content && content?.length > 0 && content?.map((content, i) => {
              // if (content?.eType === 'poll') {
              //   console.log('con', content)
              //   return (
              //     <div key={i} className='d-flex gap-3'>
              //       <div className='d-flex flex-column align-items-center gap-1'>
              //         <label className="live-events-label">
              //           <img src={pollImg} alt="live" />
              //         </label>
              //         <p className='d-flex flex-column align-items-center'>
              //           <span className='text-center date-with-time'>{moment(convertDateWithTime(content?.dPublishDate)).format('MMM D')}</span>
              //           <span className='text-center date-with-time'>{moment(convertDateWithTime(content?.dPublishDate)).format('LT')}</span>
              //         </p>
              //       </div>
              //       {content?.iPollId && (
              //         <MultiViewPoll data={content?.oPoll} handleUpdatePoll={handleUpdatePoll} />
              //       )}
              //     </div>
              //   )
              // } else {
              return (
                <div key={i} className='d-flex gap-3'>
                  <div className='d-flex flex-column align-items-center gap-2'>
                    <label className="live-events-label">
                      <img src={content?.iPollId ? pollImg : liveImg} alt="live" />
                    </label>
                    <p className='d-flex flex-column align-items-center'>
                      <span className='text-center date-with-time'>{moment(convertDateWithTime(content?.dPublishDate)).format('MMM D')}</span>
                      <span className='text-center date-with-time'>{moment(convertDateWithTime(content?.dPublishDate)).format('LT')}</span>
                    </p>
                  </div>
                  <div className='live-article-content d-flex flex-column gap-2 live-events-sidebar-editor-content'>
                    <div className='w-100 d-flex align-items-start justify-content-between'>
                      <div className='d-flex flex-column align-items-start'>
                        {content?.eStatus !== 'pb' && (
                          <Badge bg='secondary' className='text-uppercase mb-2'>
                            {
                              content?.eStatus === 'dr' ? <FormattedMessage id="draft" /> : <FormattedMessage id="scheduled" />
                            }
                          </Badge>
                        )}
                        {content?.sTitle && <h5 className="text-uppercase mb-0">{content?.sTitle}</h5>}
                        <p className='text-muted text-uppercase mb-0'><FormattedMessage id="by" /> {content?.oAuthor?.sFName}</p>
                      </div>
                      <div className='d-flex align-items-center text-nowrap'>
                        <Button disabled={isPermitted} variant="link" className="square icon-btn" onClick={() => history.push({ search: `?editContent=${content?._id}` })}>
                          <i className="icon-create d-block" />
                        </Button>
                        <Button disabled={isPermitted} variant="link" className="square text-danger icon-btn" onClick={() => handleDelete(content?._id)}>
                          <i className="icon-delete d-block" />
                        </Button>
                      </div>
                    </div>
                    {content?.iPollId && (
                      <MultiViewPoll data={content?.oPoll} handleUpdatePoll={handleUpdatePoll} />
                    )}
                    <InnerHTML html={content?.sContent} />
                  </div>
                </div>
              )
              // }
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

LiveEventSideBar.propTypes = {
  eContent: PropTypes.object,
  isPermitted: PropTypes.bool,
  setIsPermitted: PropTypes.func,
  handleSearch: PropTypes.func,
  lastTotal: PropTypes.object,
  isLoading: PropTypes.object,
  loading: PropTypes.bool,
  content: PropTypes.array,
  payload: PropTypes.object,
  setPayload: PropTypes.func,
  setContent: PropTypes.func
}
export default LiveEventSideBar
