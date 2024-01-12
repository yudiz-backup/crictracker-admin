import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { useWatch } from 'react-hook-form'

function TeamPreview({ pIndex, cIndex, control }) {
  const team = useWatch({
    control,
    name: `aLeague[${pIndex}].aTeam[${cIndex}]`
  })
  const players = team.oInfo.selectedPlayer
  const iCapId = team.iCapFanId
  // const iTPId = team.iTPFanId
  const iVCId = team.iVCFanId

  return (
    <div className="team-preview">
      {players?.filter((e) => e.eRole === 'wk').length ? (
        <div className="team-main">
          <h3 className="title">
            <FormattedMessage id="wicketKeepers" />
          </h3>
          <div className="p-list d-flex align-items-center justify-content-evenly">
            {players
              ?.filter((e) => e.eRole === 'wk')
              .map((p) => {
                return (
                  <div className="p-box" key={p?.oPlayer?._id}>
                    {iCapId === p?._id && (
                      <span className="c_vc">
                        <FormattedMessage id="c" />
                      </span>
                    )}
                    {iVCId === p?._id && (
                      <span className="c_vc">
                        <FormattedMessage id="vc" />
                      </span>
                    )}
                    {/* {iTPId === p?._id && <span className="c_vc">12</span>} */}
                    <div className="p-img">
                      {p?.oPlayer?.sThumbUrl ? (
                        <img src={p?.oPlayer?.sThumbUrl} alt={p?.oPlayer?.sFirstName} className="cover" />
                      ) : (
                        <i className="icon-account-fill" />
                      )}
                    </div>
                    <p className="p-name">{p?.oPlayer?.sFullName || p?.oPlayer?.sFirstName}</p>
                    <p className="credit">{p.nRating}</p>
                  </div>
                )
              })}
          </div>
        </div>
      ) : (
        ''
      )}
      {players?.filter((e) => e.eRole === 'bat').length ? (
        <div className="team-main">
          <h3 className="title">
            <FormattedMessage id="batter" />
          </h3>
          <div className="p-list d-flex align-items-center justify-content-evenly">
            {players
              ?.filter((e) => e.eRole === 'bat')
              .map((p) => {
                return (
                  <div className="p-box" key={p?.oPlayer?._id}>
                    {iCapId === p?._id && (
                      <span className="c_vc">
                        <FormattedMessage id="c" />
                      </span>
                    )}
                    {iVCId === p?._id && (
                      <span className="c_vc">
                        <FormattedMessage id="vc" />
                      </span>
                    )}
                    {/* {iTPId === p?._id && <span className="c_vc">12</span>} */}
                    <div className="p-img">
                      {p?.oPlayer?.sThumbUrl ? (
                        <img src={p?.oPlayer?.sThumbUrl} alt={p?.oPlayer?.sFirstName} className="cover" />
                      ) : (
                        <i className="icon-account-fill" />
                      )}
                    </div>
                    <p className="p-name">{p?.oPlayer?.sFullName || p?.oPlayer?.sFirstName}</p>
                    <p className="credit">{p.nRating}</p>
                  </div>
                )
              })}
          </div>
        </div>
      ) : (
        ''
      )}
      {players?.filter((e) => e.eRole === 'all').length ? (
        <div className="team-main">
          <h3 className="title">
            <FormattedMessage id="allRounders" />
          </h3>
          <div className="p-list d-flex align-items-center justify-content-evenly">
            {players
              ?.filter((e) => e.eRole === 'all')
              .map((p) => {
                return (
                  <div className="p-box" key={p?.oPlayer?._id}>
                    {iCapId === p?._id && (
                      <span className="c_vc">
                        <FormattedMessage id="c" />
                      </span>
                    )}
                    {iVCId === p?._id && (
                      <span className="c_vc">
                        <FormattedMessage id="vc" />
                      </span>
                    )}
                    {/* {iTPId === p?._id && <span className="c_vc">12</span>} */}
                    <div className="p-img">
                      {p?.oPlayer?.sThumbUrl ? (
                        <img src={p?.oPlayer?.sThumbUrl} alt={p?.oPlayer?.sFirstName} className="cover" />
                      ) : (
                        <i className="icon-account-fill" />
                      )}
                    </div>
                    <p className="p-name">{p?.oPlayer?.sFullName || p?.oPlayer?.sFirstName}</p>
                    <p className="credit">{p.nRating}</p>
                  </div>
                )
              })}
          </div>
        </div>
      ) : (
        ''
      )}
      {players?.filter((e) => e.eRole === 'bowl').length ? (
        <div className="team-main">
          <h3 className="title">
            <FormattedMessage id="bowlers" />
          </h3>
          <div className="p-list d-flex align-items-center justify-content-evenly">
            {players
              ?.filter((e) => e.eRole === 'bowl')
              .map((p) => {
                return (
                  <div className="p-box" key={p?.oPlayer?._id}>
                    {iCapId === p?._id && (
                      <span className="c_vc">
                        <FormattedMessage id="c" />
                      </span>
                    )}
                    {iVCId === p?._id && (
                      <span className="c_vc">
                        <FormattedMessage id="vc" />
                      </span>
                    )}
                    {/* {iTPId === p?._id && <span className="c_vc">12</span>} */}
                    <div className="p-img">
                      {p?.oPlayer?.sThumbUrl ? (
                        <img src={p?.oPlayer?.sThumbUrl} alt={p?.oPlayer?.sFirstName} className="cover" />
                      ) : (
                        <i className="icon-account-fill" />
                      )}
                    </div>
                    <p className="p-name">{p?.oPlayer?.sFullName || p?.oPlayer?.sFirstName}</p>
                    <p className="credit">{p.nRating}</p>
                  </div>
                )
              })}
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  )
}
TeamPreview.propTypes = {
  pIndex: PropTypes.number,
  cIndex: PropTypes.number,
  control: PropTypes.object
}
export default React.memo(TeamPreview)
