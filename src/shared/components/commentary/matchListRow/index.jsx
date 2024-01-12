import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import moment from 'moment'
import { Button, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import { dateCheck } from 'shared/utils'
import { allRoutes } from 'shared/constants/AllRoutes'

function MatchListRow({ match, onStatusChange }) {
  function onChange(id, flag) {
    onStatusChange(id, flag)
  }
  return (
    <tr>
      <td>
        <p>{match.sTitle}</p>
        <p className="fantasy-data">
          {match?.oSeries?.sTitle}
          <i className="round-separator ms-1"></i>
          <span className="ms-1">{match?.sSubtitle}</span>
          <i className="round-separator ms-1"></i>
          <span className="ms-1">{match?.oVenue?.sLocation}</span>
        </p>
        <p className="date mb-2">
          <span>
            <FormattedMessage id="d" />
          </span>
          {moment(dateCheck(match?.dStartDate)).format('DD MMM YYYY LT')}
        </p>
      </td>
      <td className="d-flex">
        <div>
          <Button variant="outline-secondary-min-radius" className="mx-1">
            <FormattedMessage id="enableCommentary" />
            <Form.Check
              type="switch"
              name={match?._id}
              className={`d-inline-block m-1 ${match?.bIsCommentary ? 'success' : 'danger'}`}
              checked={match?.bIsCommentary}
              onChange={() => onChange(match._id, match?.bIsCommentary)}
            />
          </Button>

          <div className="d-flex justify-content-left">
            {match?.bIsCommentary && (
              <Button as={Link} to={allRoutes.editCommentary(match?._id)} className="over-view mt-2 mx-1">
                <FormattedMessage id="editCommentary" />
              </Button>
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}

MatchListRow.propTypes = {
  match: PropTypes.object,
  selectedTab: PropTypes.string,
  onStatusChange: PropTypes.func
}

export default MatchListRow
