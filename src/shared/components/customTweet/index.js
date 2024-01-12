import React from 'react'
import PropTypes from 'prop-types'
import TweetHead from './tweetHead'
import TweetBody from './tweetBody'
import { abbreviateNumber } from 'shared/utils'
import { S3_PREFIX } from 'shared/constants'
import moment from 'moment'
function CustomTweet({ post }) {
  const isRepliedPost = post?.oReferenceTweet?.eType === 'replied_to'
  return (
    <div className="ctTweet p-2 p-md-3 my-3 mx-auto mceNonEditable border" id={post?.sTweetId}>
    {
      isRepliedPost && <>
        <TweetHead
          authorData={post?.oReferenceTweet?.oAuthor}
          showLogo={isRepliedPost}
          isRepliedPost={isRepliedPost}
        />
        <TweetBody
          postContent={post?.oReferenceTweet?.sHtml}
          media={post?.oReferenceTweet?.aMedia}
          isRepliedPost={isRepliedPost}
          isRepliedQuoted={post?.oReferenceTweet?.oReferenceTweet?.eType === 'quoted'}
          isQuoted={post?.oReferenceTweet?.oReferenceTweet?.eType === 'quoted'}
          quotedPost={post?.oReferenceTweet?.oReferenceTweet}
        />
      </>
    }
      <TweetHead
        authorData={post?.oAuthor}
        showLogo={post?.oReferenceTweet?.eType !== 'replied_to'}
      />
      <TweetBody
        postContent={post?.sHtml}
        media={post?.aMedia}
        isQuoted={post?.oReferenceTweet?.eType === 'quoted'}
        quotedPost={post?.oReferenceTweet}
      />
      <div className='tweetCreatedTime'>{moment(post?.dCreatedAt).format('hh:mm A · MMM DD, YYYY')}</div>
      <div className="tweetDivider my-1"></div>
      <div className="tweetFooter d-flex align-items-center">
        <span className="tweetFooterItem tweetLike mb-0 d-flex align-items-center me-3">
          <img className="tweetFooterIcon tLikeIcon mb-0" src={`${S3_PREFIX}static/twitter/like_heart.svg`} alt="like" width="20" height="20" loading='lazy'/>
          <span className="tweetCount ms-1">{abbreviateNumber(post?.oPublicMetrics?.nLikes)}</span>
        </span>
        <span className="tweetFooterItem tweetRetweet mb-0 d-flex align-items-center me-3">
          <img className="tweetFooterIcon tRetweetIcon mb-0" src={`${S3_PREFIX}static/twitter/retweet.svg`} alt="retweet" width="20" height="20" loading='lazy' />
          <span className="tweetCount ms-1">{abbreviateNumber(post?.oPublicMetrics?.nRetweet)}</span>
        </span>
      </div>
    </div>
  )
}

CustomTweet.propTypes = {
  type: PropTypes.string,
  data: PropTypes.object,
  post: PropTypes.tweetData,
  categoryId: PropTypes.string,
  articleId: PropTypes.string
}

export default CustomTweet
