import React, { useState, useEffect, Fragment, useContext } from 'react'
import { Controller } from 'react-hook-form'
import { FormattedMessage } from 'react-intl'
import Select from 'react-select'
import PropTypes from 'prop-types'
import { Col, Row, Form, Button, Spinner } from 'react-bootstrap'
import { useLazyQuery } from '@apollo/client'

import { GET_FANTASY_PLAYER } from 'graph-ql/fantasy-tips/query'
import FantasyPlayer from '../fantasy-player'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { MATCH_MANAGEMENT_BASE_URL, TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { DragAndDrop, Drop } from 'shared/components/drag-and-drop'

function FantasyOverviewPlayingXI({ control, values, register, errors, setValue, watch, overviewData, defaultPlayer }) {
  const [players, setPlayers] = useState(defaultPlayer)
  const [requestParams, setRequestParams] = useState()
  const oTeam1 = watch('oTeam1.aPlayers') || []
  const oTeam2 = watch('oTeam2.aPlayers') || []
  const [isUpdatingSquads, setIsUpdatingSquads] = useState(false)
  const [isUpdatingMatch, setIsUpdatingMatch] = useState(false)
  const team1Captain = watch('oTeam1.iC')
  const team1ViceCaptain = watch('oTeam1.iVC')
  const team1WicketKeeper = watch('oTeam1.iWK')
  const team2Captain = watch('oTeam2.iC')
  const team2ViceCaptain = watch('oTeam2.iVC')
  const team2WicketKeeper = watch('oTeam2.iWK')
  const { dispatch } = useContext(ToastrContext)

  const teams = watch('teams')
  const isTeam1 = teams?.value === overviewData?.oMatch?.oTeamA?._id
  const teamOptions = [
    { label: overviewData?.oMatch?.oTeamA?.sTitle, value: overviewData?.oMatch?.oTeamA?._id },
    { label: overviewData?.oMatch?.oTeamB?.sTitle, value: overviewData?.oMatch?.oTeamB?._id }
  ]

  const [getPlayer, { loading }] = useLazyQuery(GET_FANTASY_PLAYER, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      if (data?.listFantasyPlayer) {
        setPlayers(data.listFantasyPlayer)
      }
    }
  })

  useEffect(() => {
    if (overviewData?.oMatch) {
      setRequestParams({
        iMatchId: overviewData?.oMatch?._id,
        iTeamId: overviewData?.oMatch?.oTeamA?._id
      })
      setValue('teams', { label: overviewData?.oMatch.oTeamA?.sTitle, value: overviewData?.oMatch?.oTeamA?._id })
    }
  }, [overviewData])

  useEffect(() => {
    if (requestParams && requestParams.iMatchId && requestParams.iTeamId) {
      getPlayer()
    }
  }, [requestParams])

  useEffect(() => {
    if (oTeam1 && oTeam1?.length < 11) {
      const team1 = oTeam1.map((oTeam) => oTeam.split(',')[0])

      if (!team1.includes(team1Captain)) setValue('oTeam1.iC', '')
      if (!team1.includes(team1ViceCaptain)) setValue('oTeam1.iVC', '')
      if (!team1.includes(team1WicketKeeper)) setValue('oTeam1.iWK', '')
    }
  }, [JSON.stringify(oTeam1)])

  useEffect(() => {
    if (oTeam2 && oTeam2.length < 11) {
      const team2 = oTeam2.map((oTeam) => oTeam.split(',')[0])

      if (!team2.includes(team2Captain)) setValue('oTeam2.iC', '')
      if (!team2.includes(team2ViceCaptain)) setValue('oTeam2.iVC', '')
      if (!team2.includes(team2WicketKeeper)) setValue('oTeam2.iWK', '')
    }
  }, [JSON.stringify(oTeam2)])

  useEffect(() => {
    setPlayers(defaultPlayer)
  }, [defaultPlayer])

  function handleChangeTeam(e) {
    setRequestParams({
      iMatchId: overviewData?.oMatch?._id,
      iTeamId: e.value
    })
  }

  const handleUpdateSquads = () => {
    setIsUpdatingSquads(true)
    fetch(`${MATCH_MANAGEMENT_BASE_URL}/series-squad`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ iMatchId: overviewData?.oMatch?._id, iSeriesId: overviewData?.oMatch?.oSeries?._id })
    }).then((data) => {
      return data.json()
    }).then((data) => {
      setIsUpdatingSquads(false)
      dispatch({
        type: 'SHOW_TOAST',
        payload: {
          message: <FormattedMessage id="updateSquadsTeamsMsg" />,
          type: TOAST_TYPE.Success,
          btnTxt: close
        }
      })
    }).catch((err) => {
      console.error(err)
    })
  }

  const handleDragEnd = (result, value, team) => {
    const { type, source, destination } = result
    if (!destination) return

    const reorder = (list, startIndex, endIndex) => {
      const result = Array.from(list)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return result
    }
    if (type === 'droppable-overview-team') {
      const updatedCategories = reorder(
        team,
        source.index,
        destination.index
      )
      setValue(value, updatedCategories)
    }
  }

  const handleUpdateMatch = () => {
    setIsUpdatingMatch(true)
    fetch(`${MATCH_MANAGEMENT_BASE_URL}/match-info`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ iMatchId: overviewData?.oMatch?._id, iSeriesId: overviewData?.oMatch?.oSeries?._id })
    }).then((data) => {
      return data.json()
    }).then((data) => {
      setIsUpdatingMatch(false)
      if (data?.status === 200) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: {
            message: <FormattedMessage id="MatchUpdateMsg" />,
            type: TOAST_TYPE.Success,
            btnTxt: close
          }
        })
      } else {
        dispatch({
          type: 'SHOW_TOAST',
          payload: {
            message: data?.message,
            type: TOAST_TYPE.Error,
            btnTxt: close
          }
        })
      }
    }).catch((err) => {
      console.error(err)
    })
  }

  return (
    <>
      <div className="probabel-xi">
        <div className="probabel-xi-head d-flex flex-column flex-md-row align-items-md-center justify-content-between">
          <h2>
            <FormattedMessage id="probablePlayingXI" />
          </h2>
          <div className='d-flex align-items-center'>
            <Button
              variant="primary"
              onClick={handleUpdateMatch}
              disabled={isUpdatingMatch}
              size='sm'
              className='mb-2'
            >
              {(isUpdatingMatch) ? <Spinner animation="border" size="sm" /> : <i className="icon-refresh" />}
              &nbsp;&nbsp;<FormattedMessage id="match" />
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateSquads}
              disabled={isUpdatingSquads}
              size='sm'
              className='mb-2 mx-2'
            >
              {(isUpdatingSquads) ? <Spinner animation="border" size="sm" /> : <i className="icon-refresh" />}
              &nbsp;&nbsp;<FormattedMessage id="updateSquadsTeams" />
            </Button>
          </div>
        </div>
        <Row>
          <Col lg="4">
            <div>
              <Form.Group className="form-group">
                <Form.Label>
                  <FormattedMessage id="selectPlayers" />
                </Form.Label>
                <Controller
                  name="teams"
                  control={control}
                  render={({ field: { onChange, value = [], ref } }) => (
                    <Select
                      ref={ref}
                      value={value || values?.oSeries}
                      options={teamOptions}
                      className="react-select"
                      classNamePrefix="select"
                      isLoading={loading}
                      onChange={(e) => {
                        onChange(e)
                        handleChangeTeam(e)
                      }}
                    />
                  )}
                />
              </Form.Group>
            </div>
            <Row>
              {players &&
                players?.length !== 0 &&
                players.map((player, index) => {
                  const playerIdNameRole = player._id + ',' + (player?.sFullName || player?.sFirstName) + ',' + player.sPlayingRole
                  return (
                    <Col sm="6" key={`${index}${player._id}`}>
                      <Form.Check
                        type="checkbox"
                        className="form-check"
                        name={isTeam1 ? 'oTeam1.aPlayers' : 'oTeam2.aPlayers'}
                        {...register(isTeam1 ? 'oTeam1.aPlayers' : 'oTeam2.aPlayers', {
                          required: validationErrors.required,
                          validate: (value) => value.length <= 11 || validationErrors.selectElevenPlayersOnly
                        })}
                        label={player?.sFullName || player?.sFirstName}
                        id={player._id}
                        disabled={
                          isTeam1 ? oTeam1?.length === 11 && !oTeam1?.includes(playerIdNameRole) : oTeam2?.length === 11 && !oTeam2?.includes(playerIdNameRole)
                        }
                        value={playerIdNameRole}
                      />
                    </Col>
                  )
                })}
              {players?.length === 0 && (
                <p>
                  <FormattedMessage id="playerNotAvailable" />
                </p>
              )}
            </Row>
            <div>
              {errors && errors?.oTeam1 && errors?.oTeam1?.aPlayers && (
                <Form.Control.Feedback type="invalid">{errors.oTeam1.aPlayers.message}</Form.Control.Feedback>
              )}
              {errors && errors?.oTeam2 && errors?.oTeam2?.aPlayers && (
                <Form.Control.Feedback type="invalid">{errors.oTeam2.aPlayers.message}</Form.Control.Feedback>
              )}
            </div>
            <div>
              <FormattedMessage id="selectedPlayersLastMatch" />
            </div>
          </Col>
          <Col lg="4" className="border-block">
            <h4>{overviewData?.oMatch?.oTeamA?.sTitle}</h4>
            <div>
              <DragAndDrop onDragEnd={(result) => handleDragEnd(result, 'oTeam1.aPlayers', oTeam1)}>
                <Drop id='droppable' type='droppable-overview-team'>
                  {oTeam1.length ? oTeam1?.map((player, index) => {
                    return (
                      <Fragment key={index}>
                        <FantasyPlayer player={player} type="oTeam1" setValue={setValue} index={index} values={values} register={register} watch={watch} />
                      </Fragment>
                    )
                  }) : []}
                </Drop>
              </DragAndDrop>
              {errors && errors?.oTeam1 && errors?.oTeam1?.iC && (
                <Form.Control.Feedback type="invalid">{errors?.oTeam1?.iC.message}</Form.Control.Feedback>
              )}

              {errors && errors?.oTeam1 && errors?.oTeam1?.iVC && (
                <Form.Control.Feedback type="invalid">{errors?.oTeam1?.iVC.message}</Form.Control.Feedback>
              )}

              {errors && errors?.oTeam1 && errors?.oTeam1?.iWK && (
                <Form.Control.Feedback type="invalid">{errors?.oTeam1?.iWK.message}</Form.Control.Feedback>
              )}
            </div>
          </Col>
          <Col lg="4" className="border-block">
            <h4>{overviewData?.oMatch?.oTeamB?.sTitle}</h4>
            <div>
              <DragAndDrop onDragEnd={(result) => handleDragEnd(result, 'oTeam2.aPlayers', oTeam2)}>
                <Drop id='droppable' type='droppable-overview-team'>

                  {typeof oTeam2 !== 'string' &&
                    oTeam2 &&
                    oTeam2?.length !== 0 ? oTeam2?.map((player, index) => {
                      return (
                        <Fragment key={index}>
                          <FantasyPlayer player={player} type="oTeam2" setValue={setValue} index={index} values={values} register={register} watch={watch} />
                        </Fragment>
                      )
                    }) : []}
                </Drop>
              </DragAndDrop>
              {errors && errors?.oTeam2 && errors?.oTeam2?.iC && (
                <Form.Control.Feedback type="invalid">{errors?.oTeam2?.iC.message}</Form.Control.Feedback>
              )}
              {errors && errors?.oTeam2 && errors?.oTeam2?.iVC && (
                <Form.Control.Feedback type="invalid">{errors?.oTeam2?.iVC.message}</Form.Control.Feedback>
              )}
              {errors && errors?.oTeam2 && errors?.oTeam2?.iWK && (
                <Form.Control.Feedback type="invalid">{errors?.oTeam2?.iWK.message}</Form.Control.Feedback>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </>
  )
}
FantasyOverviewPlayingXI.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  control: PropTypes.object,
  watch: PropTypes.func,
  values: PropTypes.object,
  setValue: PropTypes.func,
  overviewData: PropTypes.object,
  defaultPlayer: PropTypes.array
}

export default FantasyOverviewPlayingXI
