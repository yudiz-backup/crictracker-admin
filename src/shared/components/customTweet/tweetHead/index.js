import React from 'react'
import PropTypes from 'prop-types'
function TweetHead({ authorData, showLogo, isQuotedTweet }) {
  return (
    <div className={`tweetHeader ${isQuotedTweet && 'quotedTweetHead'} d-flex justify-content-between align-items-start`}>
      <div className="tweetUser d-flex justify-content-between align-items-center">
        <img className="tweetUserImg me-2 mb-0 rounded-circle overflow-hidden" src={authorData?.sProfilePic} alt={authorData?.sUsername} width="64" height="64" loading='lazy' />
        <div className='tweetUserInfo'>
          <span className="tweetUsername font-bold mb-0 d-flex flex-wrap align-items-center"><span className="me-1">{authorData?.sName}</span>
            {
              authorData?.bVerified && <img className="twitterVerified mb-0" src="https://media.crictracker.com/static/twitter/verified_badge.svg" alt="verified" width="15" height="15" loading='lazy' />
            }
          </span>
          <span className="tweetProfile text-secondary mb-0">@{authorData?.sUsername}</span>
        </div>
      </div>
      {
        showLogo && <div className="twitterLogo">
            <img className="mb-0" src="https://media.crictracker.com/static/twitter/twitter_logo.svg" alt="twitter-logo" width="20" height="20" loading='lazy' />
        </div>
      }
    </div>
  )
}

TweetHead.propTypes = {
  type: PropTypes.string,
  showLogo: PropTypes.bool,
  authorData: PropTypes.object,
  isQuotedTweet: PropTypes.bool,
  categoryId: PropTypes.string,
  articleId: PropTypes.string
}

export default TweetHead
