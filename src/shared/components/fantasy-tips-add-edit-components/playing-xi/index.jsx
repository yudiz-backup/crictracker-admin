import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, useIntl } from 'react-intl'
import { Controller, useFieldArray, useWatch } from 'react-hook-form'
import Select from 'react-select'
import { useMutation } from '@apollo/client'

import TeamCard from '../team-card'
import ArticleTab from 'shared/components/article-tab'
import { Button, Form } from 'react-bootstrap'
import { FANTASY_LEAGUE_TYPE } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { EDIT_PLAYER_RATING } from 'graph-ql/fantasy-tips/mutation'

function PlayingXI({ register, errors, control, players, setValue, articleData, disabled }) {
  const [allPlayer, setAllPlayer] = useState(players)
  const [selectedLeague, setSelectedLeague] = useState([])
  const [changeRating, { loading }] = useMutation(EDIT_PLAYER_RATING)
  const aLeague = useWatch({
    control,
    name: 'aLeague'
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'aLeague'
  })

  function addLeague() {
    append(playingXIFields(articleData?.oMatch?.oTeamScoreA?.oTeam, articleData?.oMatch?.oTeamScoreB?.oTeam))
  }

  function copyLeague(i) {
    const data = JSON.parse(JSON.stringify(aLeague[i]))
    data.eLeague = ''
    append(data)
  }

  function deleteLeague(i) {
    remove(i)
    handleLeagueValidation()
  }

  function handleLeagueValidation() {
    setSelectedLeague(aLeague.map((e) => e.eLeague.value))
  }

  async function handlePlayerCreditChange(e, player, type) {
    const { data } = await changeRating({
      variables: {
        input: {
          ePlatform: articleData?.ePlatformType,
          iMatchId: articleData?.iMatchId,
          iPlayerId: player?.oPlayer?._id,
          nRating: type === 'nRating' ? e.value : player?.nRating,
          eRole: type === 'eRole' ? e.value : player?.eRole
        }
      }
    })
    if (data?.editPlayerRating) {
      setAllPlayer(
        allPlayer.map((p) => {
          if (p?.oPlayer?._id === player?.oPlayer?._id) {
            return {
              ...p,
              nRating: type === 'nRating' ? e.value : player?.nRating,
              eRole: type === 'eRole' ? e.value : player?.eRole
            }
          }
          return p
        })
      )
      const updatedP = aLeague?.map((l) => {
        return {
          ...l,
          aTeam: l.aTeam.map((t) => {
            let credits = 100
            return {
              ...t,
              oInfo: {
                ...t.oInfo,
                selectedPlayer: t?.oInfo?.selectedPlayer.map((p) => {
                  if (p?.oPlayer?._id === player?.oPlayer?._id) {
                    credits -= e.value
                    return {
                      ...p,
                      nRating: type === 'nRating' ? e.value : player?.nRating,
                      eRole: type === 'eRole' ? e.value : player?.eRole
                    }
                  } else {
                    credits -= p.nRating
                    return p
                  }
                }),
                nCredits: credits
              }
            }
          })
        }
      })
      setValue('aLeague', updatedP)
    }
  }

  useEffect(() => {
    setAllPlayer(players)
  }, [players])
  return (
    <div className="mb-4 big-title playing-xi">
      <ArticleTab title={useIntl().formatMessage({ id: 'suggestedPlayingXI' })}>
        {fields.map((e, i) => {
          return (
            <div className="league-box" key={e.id}>
              <Form.Group className="form-group">
                <Form.Label>
                  <FormattedMessage id="leagueName" />
                </Form.Label>
                <div className="d-flex w-100 select-league">
                  <Controller
                    name={`aLeague[${i}].eLeague`}
                    control={control}
                    rules={{ required: validationErrors.required }}
                    render={({ field: { onChange, value, ref } }) => (
                      <Select
                        ref={ref}
                        value={value || aLeague[i]?.eLeague}
                        options={FANTASY_LEAGUE_TYPE.map((s) => (selectedLeague.includes(s.value) ? { ...s, isDisabled: true } : s))}
                        isSearchable
                        className={`react-select ${errors?.aLeague && errors?.aLeague[i]?.eLeague && 'error'}`}
                        classNamePrefix="select"
                        isDisabled={disabled}
                        onChange={(e) => {
                          onChange(e)
                        }}
                        onBlur={handleLeagueValidation}
                      />
                    )}
                  />
                  {fields.length < FANTASY_LEAGUE_TYPE.length && (
                    <Button disabled={disabled} variant="link" className="square hover-none" size="sm" onClick={() => copyLeague(i)}>
                      <FormattedMessage id="duplicateLeague" />
                    </Button>
                  )}
                  {fields.length > 1 && (
                    <Button
                      disabled={disabled}
                      variant="link"
                      className="square text-danger hover-none"
                      size="sm"
                      onClick={() => deleteLeague(i)}
                    >
                      <FormattedMessage id="deleteLeague" />
                    </Button>
                  )}
                </div>
                {errors?.aLeague && errors?.aLeague[i] && errors?.aLeague[i]?.eLeague && (
                  <Form.Control.Feedback type="invalid">{errors?.aLeague[i]?.eLeague?.message}</Form.Control.Feedback>
                )}
              </Form.Group>
              <TeamCard
                register={register}
                control={control}
                index={i}
                colOne={{ md: 7 }}
                colTwo={{ md: 5 }}
                players={allPlayer}
                errors={errors}
                setValue={setValue}
                articleData={articleData}
                disabled={disabled}
                changeRating={handlePlayerCreditChange}
                loading={loading}
              />
            </div>
          )
        })}
        {fields.length < FANTASY_LEAGUE_TYPE.length && (
          <div className="add-league text-center">
            <Button variant="link" onClick={addLeague} disabled={disabled} className="left-icon square" size="sm">
              <i className="icon-add"></i>
              <FormattedMessage id="addMoreLeague" />
            </Button>
          </div>
        )}
      </ArticleTab>
    </div>
  )
}
PlayingXI.propTypes = {
  control: PropTypes.object,
  errors: PropTypes.object,
  register: PropTypes.func,
  players: PropTypes.array,
  setValue: PropTypes.func,
  articleData: PropTypes.object,
  disabled: PropTypes.bool
}
export default PlayingXI

export function playingXIFields(team1, team2) {
  return {
    eLeague: '',
    aTeam: [teamFields(team1, team2)]
  }
}

export function teamFields(team1, team2) {
  return {
    iVCFanId: '',
    // iTPFanId: '',
    iCapFanId: '',
    oTeamA: {
      sTitle: team1?.sAbbr || '',
      nCount: 0,
      iTeamId: team1?._id || ''
    },
    oTeamB: {
      sTitle: team2?.sAbbr || '',
      nCount: 0,
      iTeamId: team2?._id || ''
    },
    oInfo: {
      nCredits: 100,
      selectedPlayer: []
    },
    aSelectedPlayerFan: []
  }
}
