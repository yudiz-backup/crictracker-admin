import React, { useState, useEffect } from 'react'
import { Col } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import { S3_PREFIX } from 'shared/constants'

const MediaFooter = ({ data, isGif, resetSelection }) => {
  const [imageData, setImageData] = useState()
  const handleClear = () => {
    setImageData('')
    resetSelection()
  }

  useEffect(() => {
    setImageData(data)
  }, [data])
  return (
    <>
      {imageData && (
        <>
          <Col xs={8} className="m-0">
            <div className="d-flex">
              <div>
                <h6>
                  1 <FormattedMessage id="itemSelected" />
                </h6>
                <button onClick={handleClear} className="modify-button-blue">
                  <FormattedMessage id="clear" />
                </button>
              </div>
              <div className="ms-4">
                <img className="footer-image" src={isGif ? imageData?.images?.preview_gif?.url : `${imageData?.sUrl && S3_PREFIX + imageData?.sUrl}`} />
              </div>
            </div>
          </Col>
        </>
      )}
    </>
  )
}

MediaFooter.propTypes = {
  data: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  isGif: PropTypes.bool,
  resetSelection: PropTypes.func
}

export default MediaFooter
