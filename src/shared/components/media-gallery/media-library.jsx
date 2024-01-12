import React, { useContext, useEffect, useRef, useState } from 'react'
import { Button, Row, Col } from 'react-bootstrap'
import Select from 'react-select'
import Search from '../search'
import SingleImage from './single-image'
import PropTypes from 'prop-types'
import FeatureImageSidebar from './feature-image-sidebar'
import { FormattedMessage, useIntl } from 'react-intl'
import { useLazyQuery, useMutation } from '@apollo/client'
import { GET_GALLERY_IMAGES } from 'graph-ql/article/query'
import Loading from '../loading'
import { DiffMonthBetweenTwoDates, inverseMonth, bottomReached, getGiphyImage } from 'shared/utils'
import { NoData } from './noData'
import useMultiSelect from 'shared/hooks/useMultiSelect'
import { confirmAlert } from 'react-confirm-alert'
import CustomAlert from '../alert'
import { DELETE_IMAGE } from 'graph-ql/article/mutation'
import { ToastrContext } from '../toastr'
import { TOAST_TYPE } from 'shared/constants'
import PermissionProvider from '../permission-provider'

const MediaLibrary = ({ handleImage, onSubmit, isPlugin, gifsGalary, overRidePermission }) => {
  const { dispatch } = useContext(ToastrContext)
  const [payloads, setPayloads] = useState({ nSkip: 1, nLimit: 36, sSearch: null, oFilter: { dDate: null } })
  const totalRef = useRef(0)
  const [gifOffset, setGifOffset] = useState(0)
  const [open, setOpen] = useState(false)
  const [selectedImageId, setSelectedImageId] = useState()
  const [imageData, setImageData] = useState()
  const [gifImageData, setGifImageData] = useState([])
  const [gifLoading, setGifLoading] = useState(false)
  const [gifCategory, setGifCategory] = useState('trending')
  const [isBulkAction, setIsBulkAction] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loadBtn, setLoadBtn] = useState(true)
  const isBottomReached = useRef(false)
  const monthArrayRef = useRef()

  useEffect(() => {
    if (gifsGalary) {
      try {
        setGifLoading(true)
        getGiphyImage(gifCategory, gifOffset, searchTerm).then((data) => {
          setGifImageData([...data])
          setGifLoading(false)
        })
      } catch (e) {
        console.log(e)
      }
    } else {
      getGalaryImages()
    }
  }, [gifsGalary])

  const [deleteImage] = useMutation(DELETE_IMAGE, {
    onCompleted: (data) => {
      if (data) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.deleteImage.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
      }
    }
  })

  const [getGalaryImages, { loading, refetch }] = useLazyQuery(GET_GALLERY_IMAGES, {
    variables: { input: { ...payloads } },
    onCompleted: (data) => {
      if (data && data?.getImages.aResults) {
        if (isBottomReached.current) {
          if (!loadBtn) {
            setImageData([...imageData, ...data?.getImages?.aResults])
            totalRef.current = data.getImages.nTotal
            isBottomReached.current = false
          }
        } else {
          monthArrayRef.current = DiffMonthBetweenTwoDates(data?.getImages?.oRange?.dMax, data?.getImages?.oRange?.dMin)
          setImageData(data?.getImages?.aResults)
          totalRef.current = data?.getImages?.nTotal
        }
      }
    }
  })

  const handleAfterDelete = (id) => setImageData(imageData?.filter(imgData => imgData._id !== id))
  const handleMultipleDelete = (ids) => setImageData(imageData?.filter(imgData => !ids.includes(imgData?._id)))

  const handleLoadMore = () => {
    if (gifsGalary) {
      setGifLoading(true)
      setGifOffset(gifOffset + 20)
      getGiphyImage(gifCategory, gifOffset + 20, searchTerm).then((data) => {
        setGifImageData([...gifImageData, ...data])
        setGifLoading(false)
      })
    } else {
      setLoadBtn(false)
    }
  }

  function setPayload() {
    setPayloads({ ...payloads, nSkip: payloads.nSkip + 1 })
  }

  const handleId = (data) => {
    setSelectedImageId(data)
    handleImage(data)
  }

  const { onClick, resetSelected, selectedMultiItems } = useMultiSelect(imageData, { selector: (data) => data._id })

  const handleSideBar = () => {
    setOpen(true)
  }

  const handleSearch = (data) => {
    if (gifsGalary) {
      setGifLoading(true)
      setGifCategory('search')
      setGifOffset(0)
      setSearchTerm(data?.trim())
      getGiphyImage(data?.trim()?.length > 0 ? 'search' : 'trending', 0, data).then((data) => {
        setGifImageData(data)
        setGifLoading(false)
      })
    } else {
      setPayloads({ ...payloads, sSearch: data, nSkip: 1 })
    }
  }

  const handleFilter = (data) => {
    if (data?.value) {
      const mData = inverseMonth(data?.value)
      setPayloads({ ...payloads, oFilter: { dDate: mData }, nSkip: 1 })
    } else {
      setPayloads({ ...payloads, oFilter: { dDate: null }, nSkip: 1 })
    }
  }
  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteAllItem' })
  }

  function handleDeleteImage(e) {
    e.preventDefault()
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.confirmationMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            await deleteImage({ variables: { input: { aId: selectedMultiItems } } })
            handleMultipleDelete(selectedMultiItems)
            resetSelected()
            // ... delete api call here
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }

  function handleBulkActionEnable() {
    setSelectedImageId()
    setIsBulkAction(true)
    handleImage()
  }
  function handleBulkActionDisable() {
    resetSelected()
    setIsBulkAction(false)
  }

  function handleScroll(e) {
    if (!loadBtn) {
      if (bottomReached(e) && !isBottomReached.current && imageData.length < totalRef.current) {
        isBottomReached.current = true
        setPayload()
      }
    }
  }
  return (
    <>
      <Row>
        <Col className="mt-3">
          <Row className='my-2'>
            {
              !gifsGalary && (
                <Col className="d-flex" sm={5}>
                  <p className="text-center mt-1">
                    <FormattedMessage id="filterMedia" />
                  </p>
                  <Select
                    options={monthArrayRef.current?.map((e) => ({ label: e, value: e })).reverse()}
                    className="react-select only-border sm ms-4 month-selector"
                    classNamePrefix="select"
                    isSearchable={false}
                    isClearable={true}
                    onChange={(e) => {
                      handleFilter(e)
                    }}
                    defaultValue={'All Dates'}
                  />
                </Col>
              )
            }
            <Col>
              <Search className="search-box only-border m-0" searchEvent={(e) => handleSearch(e)} />
            </Col>
          </Row>
          <PermissionProvider isAllowedTo="EDIT_MEDIA_GALLERY">
            <Row className='mb-2'>
              {isBulkAction ? <Col>
                <Button size="sm" variant="danger" disabled={!selectedMultiItems?.length} className='square me-2' onClick={handleDeleteImage}>
                  <FormattedMessage id="deleteAllSelected" />
                </Button>
                <Button size="sm" variant="outline-info" className='square' onClick={handleBulkActionDisable}>
                  <FormattedMessage id="cancel" />
                </Button>
              </Col> : <Col>
                <Button size="sm" variant="outline-success" className='square' onClick={handleBulkActionEnable}>
                  <FormattedMessage id="bulkAction" />
                </Button>
              </Col>}
            </Row>
          </PermissionProvider>
          {
            gifsGalary && gifImageData && gifImageData?.length > 0 && (
              <div onClick={handleSideBar}>
                <Row className="media-list gx-1" onScroll={handleScroll}>
                  {gifImageData?.map((item) => {
                    return (
                      <SingleImage
                        key={item.id}
                        data={item}
                        handleId={handleId}
                        selectedImageId={selectedImageId}
                        overRidePermission={overRidePermission}
                        isGif
                      />
                    )
                  })}
                  {loadBtn && (imageData?.length > 0 || gifImageData?.length > 0) && (
                    <div className="mt-2 text-center">
                      <Button size="md" variant="primary" onClick={handleLoadMore}>
                        <FormattedMessage id="loadMore" />
                      </Button>
                    </div>
                  )}
                </Row>
              </div>
            )
          }
          {!gifsGalary && imageData?.length ? (
            <div onClick={handleSideBar}>
              <Row className="media-list gx-1" onScroll={handleScroll}>
                {imageData?.map((item, idx) => {
                  return (
                    <SingleImage
                      key={item._id}
                      data={item}
                      handleId={isBulkAction ? onClick : handleId}
                      isMulti={isBulkAction}
                      overRidePermission={overRidePermission}
                      selectedImageId={isBulkAction ? selectedMultiItems : selectedImageId}
                    />
                  )
                })}
                {loadBtn && (imageData?.length || gifImageData?.length) > 0 && (
                  <div className="mt-2 text-center">
                    <Button size="md" variant="primary" onClick={handleLoadMore}>
                      <FormattedMessage id="loadMore" />
                    </Button>
                  </div>
                )}
              </Row>
            </div>
          ) : (
            !gifsGalary && !loading && <NoData />
          )}
          {(loading || gifLoading) && <Loading />}
        </Col>
        <Col className="mt-4" md={3}>
          {open && selectedImageId && <FeatureImageSidebar refetch={refetch} afterDelete={handleAfterDelete} data={selectedImageId} onSubmit={onSubmit} isPlugin={isPlugin} gifsGalary={gifsGalary} />}
        </Col>
      </Row>
      {selectedMultiItems?.length ? <Row>
        <Col xs={8} className="mt-3">
          <div className="d-flex">
            <div>
              <h6>
                {selectedMultiItems?.length} <FormattedMessage id="itemSelected" />
              </h6>
              <button onClick={resetSelected} className="modify-button-blue">
                <FormattedMessage id="clear" />
              </button>
            </div>
          </div>
        </Col>
      </Row> : null}
    </>
  )
}

MediaLibrary.propTypes = {
  handleImage: PropTypes.func,
  isClearImage: PropTypes.bool,
  register: PropTypes.func,
  getValues: PropTypes.func,
  onSubmit: PropTypes.func,
  gifsGalary: PropTypes.bool,
  isPlugin: PropTypes.bool,
  overRidePermission: PropTypes.bool
}

export default MediaLibrary
