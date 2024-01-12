import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import { Button, Tab, Nav } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { useWatch } from 'react-hook-form'
// import { useParams } from 'react-router-dom'

import { PLAYER_CREDITS, ROLES } from 'shared/constants'
import { teamFields } from '../playing-xi'
import { validationErrors } from 'shared/constants/ValidationErrors'

function TeamSelection({ register, control, players, pIndex, cIndex, setValue, articleData, disabled, changeRating }) {
  // For enable 12th math uncomment below line
  // const { type } = useParams()
  const type = false

  const oTeam = useWatch({
    control,
    name: `aLeague[${pIndex}].aTeam[${cIndex}]`
  })
  const aSelectedPlayer = oTeam.aSelectedPlayerFan || []
  const sPlayers = oTeam.oInfo.selectedPlayer
  const totalCredit = useRef(oTeam?.oInfo?.nCredits || 100)

  function handleClear() {
    setValue(
      `aLeague[${pIndex}].aTeam[${cIndex}]`,
      teamFields(articleData?.oMatch?.oTeamScoreA?.oTeam, articleData?.oMatch?.oTeamScoreB?.oTeam)
    )
    totalCredit.current = 100
  }

  function handlePlayer(p) {
    if (aSelectedPlayer.includes(p?._id)) {
      const removePlayer = sPlayers.filter((x) => x?._id !== p?._id)
      setValue(`aLeague[${pIndex}].aTeam[${cIndex}].oInfo.selectedPlayer`, removePlayer)
      playerSelectViseTeam(p, false)
      checkCredits(p.nRating, false)
    } else {
      const addPlayer = [...sPlayers, p]
      setValue(`aLeague[${pIndex}].aTeam[${cIndex}].oInfo.selectedPlayer`, addPlayer)
      playerSelectViseTeam(p, true)
      checkCredits(p.nRating, true)
    }
  }

  function playerSelectViseTeam(p, isAdding) {
    if (articleData?.oMatch?.oTeamScoreA?.oTeam?.sAbbr === p?.oTeam?.sAbbr) {
      setValue(`aLeague[${pIndex}].aTeam[${cIndex}].oTeamA.nCount`, oTeam?.oTeamA?.nCount + (isAdding ? 1 : -1))
    } else {
      setValue(`aLeague[${pIndex}].aTeam[${cIndex}].oTeamB.nCount`, oTeam?.oTeamB?.nCount + (isAdding ? 1 : -1))
    }
  }

  function checkCredits(rating, isAdding) {
    if (isAdding) {
      const left = totalCredit.current - rating
      setValue(`aLeague[${pIndex}].aTeam[${cIndex}].oInfo.nCredits`, left)
      totalCredit.current = left
    } else {
      const add = totalCredit.current + rating
      setValue(`aLeague[${pIndex}].aTeam[${cIndex}].oInfo.nCredits`, add)
      totalCredit.current = add
    }
  }

  function addThirdPlayer(p, oldId) {
    const addPlayer = [...sPlayers.filter((x) => x?._id !== oldId), p]
    setValue(`aLeague[${pIndex}].aTeam[${cIndex}].oInfo.selectedPlayer`, addPlayer)
  }

  return (
    <>
      <div className="team-selection">
        <input type="number" className="d-none" {...register(`aLeague[${pIndex}].aTeam[${cIndex}].oInfo.nCredits`)} />
        <div className="d-flex team-header">
          <div className="header-box">
            <p>
              <FormattedMessage id="selectedPlayers" />
            </p>
            <span>{aSelectedPlayer?.length}</span>
          </div>
          <div className="header-box">
            <input type="hidden" {...register(`aLeague[${pIndex}].aTeam[${cIndex}].oTeamA.nCount`)} />
            <p>{oTeam?.oTeamA?.sTitle || '-'}</p>
            <span>{oTeam?.oTeamA?.nCount}</span>
          </div>
          <div className="header-box">
            <input type="hidden" {...register(`aLeague[${pIndex}].aTeam[${cIndex}].oTeamB.nCount`)} />
            <p>{oTeam?.oTeamB?.sTitle || '-'}</p>
            <span>{oTeam?.oTeamB?.nCount}</span>
          </div>
          <div className="header-box">
            <p>
              <FormattedMessage id="creditsLeft" />
            </p>
            <span className={oTeam?.oInfo?.nCredits < 0 ? 'text-danger' : ''}>{oTeam?.oInfo?.nCredits}/100</span>
          </div>
          <div className="header-box">
            <p>
              <FormattedMessage id="clearAll" />
            </p>
            <Button variant="link" size="sm" className="square icon-btn" onClick={handleClear}>
              <i className="icon-cancel d-block" />
            </Button>
          </div>
        </div>
        <Tab.Container defaultActiveKey="WK">
          <Nav variant="tabs">
            <Nav.Item>
              <Nav.Link eventKey="allPlayers">
                <FormattedMessage id="all" />
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="WK">
                <FormattedMessage id="wk" /> - {sPlayers?.filter((e) => e.eRole === 'wk').length}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="ALLR">
                <FormattedMessage id="allr" /> - {sPlayers?.filter((e) => e.eRole === 'all').length}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="BATS">
                <FormattedMessage id="bats" /> - {sPlayers?.filter((e) => e.eRole === 'bat').length}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="BWL">
                <FormattedMessage id="bwl" /> - {sPlayers?.filter((e) => e.eRole === 'bowl').length}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="MORE">
                <FormattedMessage id="more" />
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="allPlayers">
              <table className="w-100 player-table">
                <thead>
                  <tr>
                    <th>
                      <FormattedMessage id="players" />
                    </th>
                    <th>
                      <FormattedMessage id="team" />
                    </th>
                    <th>
                      <FormattedMessage id="playingRole" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, i) => {
                    return (
                      <tr key={`all${p?.oPlayer?._id}${i}`}>
                        <td>
                          <div className="img-name d-flex align-items-center">
                            <div className="img">
                              {p?.oPlayer?.sThumbUrl ? (
                                <img src={p?.oPlayer?.sThumbUrl} alt={p?.oPlayer?.sFirstName} className="cover" />
                              ) : (
                                <i className="icon-account" />
                              )}
                            </div>
                            <span>{p?.oPlayer?.sFullName || p?.oPlayer?.sFirstName}</span>
                          </div>
                        </td>
                        <td>{p?.oTeam?.sAbbr || '-'}</td>
                        <td>
                          <div className="d-flex align-items-center player-credit">
                            <Select
                              defaultValue={ROLES.filter(e => e.value === p.eRole)[0]}
                              options={ROLES}
                              className={'react-select only-border ex-sm player-role'}
                              classNamePrefix="select"
                              isDisabled={disabled}
                              isSearchable={false}
                              styles={{ width: '115px' }}
                              onChange={(e) => {
                                changeRating(e, p, 'eRole')
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Tab.Pane>
            <Tab.Pane eventKey="WK">
              <table className="w-100 player-table">
                <thead>
                  <tr>
                    <th>
                      <FormattedMessage id="players" />
                    </th>
                    <th>
                      <FormattedMessage id="team" />
                    </th>
                    <th>
                      <FormattedMessage id="credits" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, i) => {
                    if (p.eRole === 'wk') {
                      return (
                        <tr key={`wk${p?.oPlayer?._id}${i}`}>
                          <td>
                            <div className="img-name d-flex align-items-center">
                              <div className="img">
                                {p?.oPlayer?.sThumbUrl ? (
                                  <img src={p?.oPlayer?.sThumbUrl} alt={p?.oPlayer?.sFirstName} className="cover" />
                                ) : (
                                  <i className="icon-account" />
                                )}
                              </div>
                              <span>{p?.oPlayer?.sFullName || p?.oPlayer?.sFirstName}</span>
                            </div>
                          </td>
                          <td>{p?.oTeam?.sAbbr || '-'}</td>
                          <td>
                            <div className="d-flex align-items-center player-credit">
                              <Select
                                defaultValue={{ label: p.nRating, value: p.nRating }}
                                options={PLAYER_CREDITS}
                                className={'react-select only-border ex-sm'}
                                classNamePrefix="select"
                                isDisabled={disabled}
                                isSearchable={false}
                                onChange={(e) => {
                                  changeRating(e, p, 'nRating')
                                }}
                              />
                              <input
                                type="checkbox"
                                className="d-none"
                                {...register(`aLeague[${pIndex}].aTeam[${cIndex}].aSelectedPlayerFan`, { required: true })}
                                value={p?._id}
                                id={`${pIndex}${p?.oPlayer?._id}${cIndex}`}
                                disabled={
                                  // disabled ||
                                  (!aSelectedPlayer.includes(p?._id) && aSelectedPlayer.length >= 11) || !p.nRating || false
                                }
                                checked={aSelectedPlayer.includes(p?._id)}
                              />
                              {aSelectedPlayer && (
                                <label
                                  onClick={() => handlePlayer(p)}
                                  htmlFor={`${pIndex}${p?.oPlayer?._id}${cIndex}`}
                                  className={`${aSelectedPlayer.includes(p?._id) ? 'icon-remove' : 'icon-add-circle1'} ${disabled ? 'pe-none opacity-50' : ''}`}
                                ></label>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    }
                    return null
                  })}
                </tbody>
              </table>
            </Tab.Pane>
            <Tab.Pane eventKey="ALLR">
              <table className="w-100 player-table">
                <thead>
                  <tr>
                    <th>
                      <FormattedMessage id="players" />
                    </th>
                    <th>
                      <FormattedMessage id="team" />
                    </th>
                    <th>
                      <FormattedMessage id="credits" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, i) => {
                    if (p.eRole === 'all') {
                      return (
                        <tr key={`allR${p?.oPlayer?._id}${i}`}>
                          <td>
                            <div className="img-name d-flex align-items-center">
                              <div className="img">
                                {p?.oPlayer?.sThumbUrl ? (
                                  <img src={p?.oPlayer?.sThumbUrl} alt={p?.oPlayer?.sFirstName} className="cover" />
                                ) : (
                                  <i className="icon-account" />
                                )}
                              </div>
                              <span>{p?.oPlayer?.sFullName || p?.oPlayer?.sFirstName}</span>
                            </div>
                          </td>
                          <td>{p?.oTeam?.sAbbr || '-'}</td>
                          <td>
                            <div className="d-flex align-items-center player-credit">
                              <Select
                                defaultValue={{ label: p.nRating, value: p.nRating }}
                                options={PLAYER_CREDITS}
                                className={'react-select only-border ex-sm'}
                                classNamePrefix="select"
                                isDisabled={disabled}
                                isSearchable={false}
                                onChange={(e) => {
                                  changeRating(e, p, 'nRating')
                                }}
                              />
                              <input
                                type="checkbox"
                                className="d-none"
                                value={p?._id}
                                id={`${pIndex}${p?.oPlayer?._id}${cIndex}`}
                                disabled={
                                  // disabled ||
                                  (!aSelectedPlayer.includes(p?._id) && aSelectedPlayer?.length >= 11) || !p.nRating || false
                                }
                                {...register(`aLeague[${pIndex}].aTeam[${cIndex}].aSelectedPlayerFan`, { required: true })}
                                checked={aSelectedPlayer.includes(p?._id)}
                              />
                              {aSelectedPlayer && (
                                <label
                                  onClick={() => handlePlayer(p)}
                                  htmlFor={`${pIndex}${p?.oPlayer?._id}${cIndex}`}
                                  className={`${aSelectedPlayer.includes(p?._id) ? 'icon-remove' : 'icon-add-circle1'} ${disabled ? 'pe-none opacity-50' : ''}`}
                                ></label>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    }
                    return null
                  })}
                </tbody>
              </table>
            </Tab.Pane>
            <Tab.Pane eventKey="BATS">
              <table className="w-100 player-table">
                <thead>
                  <tr>
                    <th>
                      <FormattedMessage id="players" />
                    </th>
                    <th>
                      <FormattedMessage id="team" />
                    </th>
                    <th>
                      <FormattedMessage id="credits" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, i) => {
                    if (p.eRole === 'bat') {
                      return (
                        <tr key={`bat${p?.oPlayer?._id}${i}`}>
                          <td>
                            <div className="img-name d-flex align-items-center">
                              <div className="img">
                                {p?.oPlayer?.sThumbUrl ? (
                                  <img src={p?.oPlayer?.sThumbUrl} alt={p?.oPlayer?.sFirstName} className="cover" />
                                ) : (
                                  <i className="icon-account" />
                                )}
                              </div>
                              <span>{p?.oPlayer?.sFullName || p?.oPlayer?.sFirstName}</span>
                            </div>
                          </td>
                          <td>{p?.oTeam?.sAbbr || '-'}</td>
                          <td>
                            <div className="d-flex align-items-center player-credit">
                              <Select
                                defaultValue={{ label: p.nRating, value: p.nRating }}
                                options={PLAYER_CREDITS}
                                className={'react-select only-border ex-sm'}
                                classNamePrefix="select"
                                isDisabled={disabled}
                                isSearchable={false}
                                onChange={(e) => {
                                  changeRating(e, p, 'nRating')
                                }}
                              />
                              <input
                                type="checkbox"
                                className="d-none"
                                value={p?._id}
                                id={`${pIndex}${p?.oPlayer?._id}${cIndex}`}
                                disabled={
                                  // disabled ||
                                  (!aSelectedPlayer.includes(p?._id) && aSelectedPlayer?.length >= 11) || !p.nRating || false
                                }
                                {...register(`aLeague[${pIndex}].aTeam[${cIndex}].aSelectedPlayerFan`, { required: true })}
                                checked={aSelectedPlayer.includes(p?._id)}
                              />
                              {aSelectedPlayer && (
                                <label
                                  onClick={() => handlePlayer(p)}
                                  htmlFor={`${pIndex}${p?.oPlayer?._id}${cIndex}`}
                                  className={`${aSelectedPlayer.includes(p?._id) ? 'icon-remove' : 'icon-add-circle1'} ${disabled ? 'pe-none opacity-50' : ''}`}
                                ></label>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    }
                    return null
                  })}
                </tbody>
              </table>
            </Tab.Pane>
            <Tab.Pane eventKey="BWL">
              <table className="w-100 player-table">
                <thead>
                  <tr>
                    <th>
                      <FormattedMessage id="players" />
                    </th>
                    <th>
                      <FormattedMessage id="team" />
                    </th>
                    <th>
                      <FormattedMessage id="credits" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p, i) => {
                    if (p.eRole === 'bowl') {
                      return (
                        <tr key={`bowl${p?.oPlayer?._id}${i}`}>
                          <td>
                            <div className="img-name d-flex align-items-center">
                              <div className="img">
                                {p?.oPlayer?.sThumbUrl ? (
                                  <img src={p?.oPlayer?.sThumbUrl} alt={p?.oPlayer?.sFirstName} className="cover" />
                                ) : (
                                  <i className="icon-account" />
                                )}
                              </div>
                              <span>{p?.oPlayer?.sFullName || p?.oPlayer?.sFirstName}</span>
                            </div>
                          </td>
                          <td>{p?.oTeam?.sAbbr || '-'}</td>
                          <td>
                            <div className="d-flex align-items-center player-credit">
                              <Select
                                defaultValue={{ label: p.nRating, value: p.nRating }}
                                options={PLAYER_CREDITS}
                                className={'react-select only-border ex-sm'}
                                classNamePrefix="select"
                                isDisabled={disabled}
                                isSearchable={false}
                                onChange={(e) => {
                                  changeRating(e, p, 'nRating')
                                }}
                              />
                              <input
                                type="checkbox"
                                className="d-none"
                                value={p?._id}
                                id={`${pIndex}${p?.oPlayer?._id}${cIndex}`}
                                disabled={
                                  // disabled ||
                                  (!aSelectedPlayer.includes(p?._id) && aSelectedPlayer?.length >= 11) || !p.nRating || false
                                }
                                {...register(`aLeague[${pIndex}].aTeam[${cIndex}].aSelectedPlayerFan`, { required: true })}
                                checked={aSelectedPlayer.includes(p?._id)}
                              />
                              {aSelectedPlayer && (
                                <label
                                  onClick={() => handlePlayer(p)}
                                  htmlFor={`${pIndex}${p?.oPlayer?._id}${cIndex}`}
                                  className={`${aSelectedPlayer.includes(p?._id) ? 'icon-remove' : 'icon-add-circle1'} ${disabled ? 'pe-none opacity-50' : ''}`}
                                ></label>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    }
                    return null
                  })}
                </tbody>
              </table>
            </Tab.Pane>
            <Tab.Pane eventKey="MORE">
              <table className="w-100 player-table cvc-s">
                <thead>
                  <tr>
                    <th>
                      <FormattedMessage id="players" />
                    </th>
                    <th>
                      <FormattedMessage id="team" />
                    </th>
                    {type === '11Wickets' && <th>12</th>}
                    <th>
                      <FormattedMessage id="c" />
                    </th>
                    <th>
                      <FormattedMessage id="vc" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sPlayers.map((p, i) => {
                    return (
                      <tr key={`more${p?.oPlayer?._id}${i}`}>
                        <td>
                          <div className="img-name d-flex align-items-center">
                            <div className="img">
                              {p?.oPlayer?.sThumbUrl ? (
                                <img src={p?.oPlayer?.sThumbUrl} alt={p?.oPlayer?.sFirstName} className="cover" />
                              ) : (
                                <i className="icon-account" />
                              )}
                            </div>
                            <span>{p?.oPlayer?.sFullName || p?.oPlayer?.sFirstName}</span>
                          </div>
                        </td>
                        <td>{p?.oTeam?.sAbbr || '-'}</td>
                        {type === '11Wickets' && (
                          <td>
                            <input
                              type="radio"
                              className="d-none"
                              {...register(`aLeague[${pIndex}].aTeam[${cIndex}].iTPFanId`, { required: validationErrors.thirdPlayer })}
                              id={`${pIndex}${p?.oPlayer?._id}${cIndex}iTPFanId`}
                              value={p?._id}
                              disabled={
                                // disabled ||
                                oTeam.iVCFanId === p?._id ||
                                oTeam.iCapFanId === p?._id ||
                                articleData.ePlatformType === 'de' ||
                                aSelectedPlayer.includes(p?._id)
                              }
                            />
                            <label
                              className={`s-p ${disabled ? 'pe-none opacity-50' : ''}`}
                              htmlFor={`${pIndex}${p?.oPlayer?._id}${cIndex}iTPFanId`}
                              onClick={() => addThirdPlayer(p, oTeam.iTPFanId)}
                            >
                              12
                            </label>
                          </td>
                        )}
                        <td>
                          <input
                            type="radio"
                            className="d-none"
                            {...register(`aLeague[${pIndex}].aTeam[${cIndex}].iCapFanId`, { required: validationErrors.captain })}
                            id={`${pIndex}${p?.oPlayer?._id}${cIndex}iCapFanId`}
                            value={p?._id}
                            disabled={
                              // disabled ||
                              oTeam.iVCFanId === p?._id ||
                              // oTeam.iTPFanId === p?._id ||
                              !aSelectedPlayer.includes(p?._id)
                            }
                          />
                          <label
                            className={`s-p ${disabled ? 'pe-none opacity-50' : ''}`}
                            htmlFor={`${pIndex}${p?.oPlayer?._id}${cIndex}iCapFanId`}>
                            <FormattedMessage id="c" />
                          </label>
                        </td>
                        <td>
                          <input
                            type="radio"
                            className="d-none"
                            {...register(`aLeague[${pIndex}].aTeam[${cIndex}].iVCFanId`, { required: validationErrors.viceCaptain })}
                            id={`${pIndex}${p?.oPlayer?._id}${cIndex}iVCFanId`}
                            value={p?._id}
                            disabled={
                              // disabled ||
                              oTeam.iCapFanId === p?._id ||
                              // oTeam.iTPFanId === p?._id ||
                              !aSelectedPlayer.includes(p?._id)
                            }
                          />
                          <label
                            className={`s-p ${disabled ? 'pe-none opacity-50' : ''}`}
                            htmlFor={`${pIndex}${p?.oPlayer?._id}${cIndex}iVCFanId`}>
                            <FormattedMessage id="vc" />
                          </label>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    </>
  )
}
TeamSelection.propTypes = {
  register: PropTypes.func,
  control: PropTypes.object,
  players: PropTypes.array,
  pIndex: PropTypes.number,
  cIndex: PropTypes.number,
  setValue: PropTypes.func,
  changeRating: PropTypes.func,
  articleData: PropTypes.object,
  disabled: PropTypes.bool
}
export default React.memo(TeamSelection)
// "61702760efd7a2c1fc76f323"
// 61702760efd7a2c1fc76f323
