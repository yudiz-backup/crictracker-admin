import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'

import { convertDate } from 'shared/utils'
import { S3_PREFIX } from 'shared/constants'
import Team from 'assets/images/team-placeholder.jpg'
function FantasyMatchInfo({ data }) {
  return (
    <>
      <div className="match-info">
        <div className="match-head">
          <h3>
            <FormattedMessage id="matchInfo" />
          </h3>
        </div>
        <div className="content d-flex justify-content-between">
          <div className="team-name-logo">
            <div className="team d-flex align-items-center">
              <img src={`${data?.oTeamA?.oImg?.sUrl ? S3_PREFIX + data?.oTeamA?.oImg?.sUrl : Team}`} alt={data?.oTeamA?.oImg?.sText} />
              <h5>{data?.oTeamA?.sTitle}</h5>
            </div>
            <div className="team d-flex align-items-center">
              <img src={`${data?.oTeamB?.oImg?.sUrl ? S3_PREFIX + data?.oTeamB?.oImg?.sUrl : Team}`} alt={data?.oTeamB?.oImg?.sText} />
              <h5>{data?.oTeamB?.sTitle}</h5>
            </div>
          </div>
          <div className="team-info">
            <div>
              <p>
                <FormattedMessage id="match" />
              </p>
              <h6>{data?.oSeries?.sTitle}</h6>
            </div>
            <div className="last-child">
              <p>
                <FormattedMessage id="dateTimeAndVenue" />
              </p>
              <h6>
                {convertDate(data?.dStartDate)} | {data?.oVenue?.sName}
              </h6>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
FantasyMatchInfo.propTypes = {
  data: PropTypes.object
}
export default FantasyMatchInfo
