import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Carousel, Modal } from 'react-bootstrap'

import { S3_PREFIX } from 'shared/constants'

function ImagePopup({ isOpen, active, data, onClose }) {
  const [activeIndex, setActive] = useState(active)
  function handleSelect(i, c) {
    setActive(i)
  }
  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Body className="p-0 image-popup">
        <Carousel activeIndex={activeIndex} onSelect={handleSelect} indicators={false} pause={'hover'}>
          {data.map((e) => {
            return (
              <Carousel.Item key={e}>
                <img className="d-block w-100" src={S3_PREFIX + e} alt={e} />
              </Carousel.Item>
            )
          })}
        </Carousel>
      </Modal.Body>
    </Modal>
  )
}
ImagePopup.propTypes = {
  isOpen: PropTypes.bool,
  data: PropTypes.array,
  active: PropTypes.number,
  onClose: PropTypes.func
}
export default ImagePopup
