import React from 'react'
import PropTypes from 'prop-types'
import TweetHead from '../tweetHead'
import TweetBody from '../tweetBody'
function QuotedTweet({ quotedData, isRepliedQuoted }) {
  return (
    <div className={`p-3 ${isRepliedQuoted ? 'mb-2' : 'mb-0'} quotedTweet`}>
      <TweetHead authorData={quotedData?.oAuthor} isQuotedTweet/>
      <TweetBody postContent={quotedData?.sContent} media={quotedData?.aMedia} isQuotedTweet/>
    </div>
  )
}

QuotedTweet.propTypes = {
  quotedData: PropTypes.object,
  isRepliedQuoted: PropTypes.bool
}

export default QuotedTweet
