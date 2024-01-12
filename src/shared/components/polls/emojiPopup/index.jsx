import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Modal } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'

import EmojiList from '../emojiList'
import { EmojiGroup } from 'shared/constants'

function EmojiPopup({ show, handleHide, handleEmoji }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [emojiGroup, setEmojiGroup] = useState('smileys-emotion')
  const [emojis, setEmojis] = useState()

  useEffect(() => {
    getEmojis().then((emo) => {
      setEmojis(emo)
    })
  }, [])

  function getEmojis() {
    return fetch('/emojis.json').then((res) => res.json())
  }

  const handleEmojiSelection = (selectedEmoji) => {
    handleEmoji(selectedEmoji)
    handleHide()
  }

  const filteredEmojis = emojis?.filter((emoji) => {
    const isInGroup = emoji.group.toLowerCase().includes(emojiGroup.toLowerCase())
    const matchesSearch = emoji.unicodeName.toLowerCase().includes(searchTerm.toLowerCase())
    return isInGroup && matchesSearch
  })

  return (
    <Modal
      className="media-modal emoji-container"
      show={show}
      onHide={() => {
        setSearchTerm('')
        handleHide()
      }}
      centered
      dialogClassName="modal-50w"
      aria-labelledby="example-custom-modal-styling-title"
    >
      <Modal.Header closeButton>
        <Modal.Title id="example-custom-modal-styling-title">
          <FormattedMessage id="addEmoji" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="emojiPopUp">
        <Form.Group className={'form-group'}>
          <Form.Control
            type="search"
            placeholder={useIntl().formatMessage({ id: 'search' }) + '...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            label="Emoji"
          />
        </Form.Group>

        <div className="emoji-group d-flex p-1 text-center justify-content-between position-sticky">
          {EmojiGroup?.map((emoji, i) => {
            return (
              <div className={emoji.gName === emojiGroup ? 'selected-group' : 'group'} key={i} onClick={() => setEmojiGroup(emoji.gName)}>
                {emoji?.value}
              </div>
            )
          })}
        </div>

        <div className='d-flex flex-wrap text-center'>
          {filteredEmojis?.map((emoji, index) => (
            <EmojiList key={index} emoji={emoji} handleHide={handleHide} handleEmoji={handleEmojiSelection} />
          ))}
        </div>
      </Modal.Body>
    </Modal>
  )
}

EmojiPopup.propTypes = {
  show: PropTypes.bool,
  handleHide: PropTypes.func,
  handleEmoji: PropTypes.func,
  emojis: PropTypes.array
}

export default EmojiPopup
