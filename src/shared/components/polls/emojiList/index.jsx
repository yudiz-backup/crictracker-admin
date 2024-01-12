import React from 'react'
import PropTypes from 'prop-types'

const EmojiList = ({ emoji, handleHide, handleEmoji }) => {
  function handleData(data, e) {
    handleEmoji({
      sMediaUrl: data.character
    })
    handleHide()
  }

  return (
    <>
        <div className="emoji" onClick={(e) => handleData(emoji, e)}>
          {emoji.character}
        </div>
    </>
  )
}

EmojiList.propTypes = {
  emoji: PropTypes.object,
  handleHide: PropTypes.func,
  handleEmoji: PropTypes.func
}

export default React.memo(EmojiList)
