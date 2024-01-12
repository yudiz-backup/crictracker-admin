import React from 'react'
import PropTypes from 'prop-types'
import { Button, Badge } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import { convertDate, colorBadge, getArticleState, getDesignation } from 'shared/utils'
import { allRoutes } from 'shared/constants/AllRoutes'

function ArticleItemRowCommon({ article }) {
  return (
    <>
      <tr>
        <td>
          <div className="icons">
            {article?.oAdvanceFeature?.bBrandedContent && <i className="icon-campaign" />}
            <Badge bg={colorBadge(article?.eState)}>
              <FormattedMessage id={getArticleState(article.eState)} />
            </Badge>
          </div>
          <p className="title">{article?.sTitle}</p>
          <p className="date">
            <span>
              {article.eState === 's' ? (
                <FormattedMessage id="sd" />
              ) : article.eState === 'pub' ? (
                <FormattedMessage id="pd" />
              ) : (
                <FormattedMessage id="d" />
              )}
            </span>
            {article.eState === 's' || article.eState === 'pub' ? convertDate(article?.dPublishDate) : convertDate(article?.dCreated)}
            <span>{article.eState === 's' ? '' : <FormattedMessage id="lm" />}</span>
            {article.eState === 's' ? '' : convertDate(article?.dUpdated)}
          </p>
          <div className="btn-b">
            <Button variant="link" as={Link} to={allRoutes.editArticle(article?._id)} className="square hover-none" size="sm">
              <FormattedMessage id="edit" />
            </Button>
            <Button variant="link" className="square hover-none" size="sm">
              <FormattedMessage id="preview" />
            </Button>
          </div>
        </td>
        <td>
          <p className="cat">{article?.oAuthor?.sUName ? article?.oAuthor?.sUName : ' - '}</p>
          <p>{article?.oAuthor?.eDesignation ? getDesignation(article?.oAuthor?.eDesignation) : ' - '}</p>
        </td>
        <td>
          <p className="cat">
            <span>{article?.oCategories?.aCategoryId.map((item, index) => (index ? ', ' : '') + item.sName) || '-'}</span>
          </p>
        </td>
        <td>
          <p className="keyword">
            {article?.oSeo?.aKeywords?.length ? <span className="bg-success"></span> : ''}
            {article?.oSeo?.aKeywords?.length ? article?.oSeo?.aKeywords.join(', ') : ' - '}
          </p>
        </td>
      </tr>
    </>
  )
}
ArticleItemRowCommon.propTypes = {
  article: PropTypes.object
}
export default ArticleItemRowCommon
