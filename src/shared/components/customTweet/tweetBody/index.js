import React from 'react'
import PropTypes from 'prop-types'
import QuotedTweet from '../quotedTweet'
function TweetBody({ postContent, media, isRepliedPost, isRepliedQuoted, isQuoted, quotedPost, isQuotedTweet }) {
  return (
    <div className={`tweetBody ${(isQuotedTweet || isRepliedPost) && 'quotedTweetBody'} ${isQuotedTweet || isRepliedPost ? 'my-2' : 'my-3'} d-flex px-2`}>
    {
        isRepliedPost && <div className="tweetBody-verticle-rule d-flex align-items-center justify-content-center">
          <div className="vr"></div>
        </div>
    }
        <div className={`w-100 ${isRepliedPost && 'mx-4'}`}>
          <div className={isRepliedPost || isQuoted ? 'mb-2' : ''}>
            {
              postContent && <div dangerouslySetInnerHTML={{ __html: postContent }} />
            }
          </div>
          {
            media?.length > 0 && <div className={`imgCount${media?.length} tweetImgList d-flex flex-wrap justify-content-between ${isQuotedTweet ? 'mt-2' : 'my-2'} overflow-hidden`}>
              {
                media?.map((image, index) => {
                  if (image?.eType === 'video' || image?.eType === 'animated_gif') {
                    const isAnimatedGif = image?.eType === 'animated_gif'
                    return <div key={index} className="tweetImg tweetVideo flex-grow-1 d-block">
                              <video
                                preload="none"
                                className="d-flex w-100"
                                autoPlay={isAnimatedGif}
                                muted={isAnimatedGif}
                                loop={isAnimatedGif}
                                poster={image?.sPosterUrl}
                                controls={!isAnimatedGif}
                              >
                                <source src={image?.sUrl} type="video/mp4" />
                                {/* Your browser does not support the video tag. */}
                              </video>
                            </div>
                  } else {
                    return <img key={index} className='tweetImg flex-grow-1 d-block' src={image?.sUrl} alt="tweet-post" loading="lazy" />
                  }
                })
              }
            </div>
          }
        {
          isQuoted && <QuotedTweet quotedData={quotedPost} isRepliedQuoted={isRepliedQuoted}/>
        }
        </div>
      </div>
  )
}

TweetBody.propTypes = {
  type: PropTypes.string,
  postContent: PropTypes.object,
  quotedPost: PropTypes.object,
  isRepliedPost: PropTypes.bool,
  isRepliedQuoted: PropTypes.bool,
  isQuotedTweet: PropTypes.bool,
  isQuoted: PropTypes.bool,
  media: PropTypes.array,
  categoryId: PropTypes.string,
  articleId: PropTypes.string
}

export default TweetBody
