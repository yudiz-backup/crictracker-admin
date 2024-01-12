import React from 'react'
import { Col } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { S3_PREFIX } from 'shared/constants'
import BlueTick from 'assets/images/blue-tick.svg'
import PermissionProvider from '../permission-provider'

const SingleImage = ({ data, handleId, selectedImageId, isGif, isMulti, overRidePermission }) => {
  const handleClick = () => {
    if (isMulti) {
      handleId(data?._id)
    } else {
      handleId(data)
    }
  }
  function isSelectedImg() {
    if (!isMulti) return { className: selectedImageId?._id === data?._id ? 'selected' : '', isSelected: selectedImageId?._id === data?._id }
    const isSelected = selectedImageId?.find(sImg => sImg === data?._id)
    return { className: selectedImageId?.find(sImg => sImg === data?._id) ? 'selected' : '', isSelected }
  }

  const { className } = !isGif && isSelectedImg()

  return (
    <>
      {
        isGif ? (
          <Col xl={3} md={3} xs={3} className="mt-1">
            <div className={`media-item ${selectedImageId?.id === data?.id ? 'selected' : ''}`} id={data.id}>
              <img className="square-img" src={data?.images?.preview_gif?.url} onClick={overRidePermission ? handleClick : PermissionProvider({ children: handleClick, isAllowedTo: 'EDIT_MEDIA_GALLERY' })} />
              <div className="icon">
                <img src={BlueTick} />
              </div>
            </div>
          </Col>
        ) : (
          <Col xl={3} md={3} xs={3} className="mt-1">
            {/* <div className={`media-item ${className}`} id={data._id} onClick={PermissionProvider({ children: handleClick, isAllowedTo: 'EDIT_MEDIA_GALLERY' })}> */}
            <div className={`media-item ${className}`} id={data._id} onClick={overRidePermission ? handleClick : PermissionProvider({ children: handleClick, isAllowedTo: 'EDIT_MEDIA_GALLERY' })}>
              <div className="layer"></div>
              <img className="square-img" src={data?.sUrl && S3_PREFIX + data?.sUrl} />
              <div className="icon">
                <img src={BlueTick} />
              </div>
            </div>
          </Col>
        )
      }
    </>
  )
}

SingleImage.propTypes = {
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  handleId: PropTypes.func,
  isGif: PropTypes.bool,
  overRidePermission: PropTypes.bool,
  isMulti: PropTypes.bool,
  selectedImageId: PropTypes.object
}

export default SingleImage
