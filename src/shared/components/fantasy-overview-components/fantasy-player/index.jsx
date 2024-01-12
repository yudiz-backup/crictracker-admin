import React from 'react'
import { Button } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'

import { validationErrors } from 'shared/constants/ValidationErrors'
import { Draggable } from 'react-beautiful-dnd'

function FantasyPlayer({ player, type, setValue, values, register, watch, index }) {
  const fantasyPlayer = getFantasyPlayer()
  const captain = watch(`${type}.iC`)
  const viceCaptain = watch(`${type}.iVC`)
  const wicketKeeper = watch(`${type}.iWK`)

  function getFantasyPlayer() {
    if (player._id) {
      return [player._id, (player.sFullName || player.sFirstName), player.sPlayingRole]
    } else return player?.split(',')
  }

  function removePlayer(player, type) {
    setValue(
      `${type}.aPlayers`,
      values[type]?.aPlayers.filter((value) => value !== player)
    )
    if (values[type]?.iC === fantasyPlayer[0]) {
      setValue(`${type}.iC`, '')
    }
    if (values[type]?.iVC === fantasyPlayer[0]) {
      setValue(`${type}.iVC`, '')
    }
    if (values[type]?.iWK === fantasyPlayer[0]) {
      setValue(`${type}.iWK`, '')
    }
  }

  if (!index && index !== 0) return null

  return (
    <Draggable key={fantasyPlayer[0]} draggableId={fantasyPlayer[0]} index={index}>
      {(provided) => {
        return (
          <section className="player-box d-flex justify-content-between" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
            <div className="player-name">
              {fantasyPlayer[1]}
              {(fantasyPlayer[2] === 'bat' || 'wk' || 'all') && <i className="icon-bat" />}
              {(fantasyPlayer[2] === 'bowl' || 'all') && <i className="icon-baseball" />}
              {fantasyPlayer[2] === 'wk' && <i className="icon-wk" />}
            </div>
            <div>
              <input
                type="radio"
                className="d-none"
                checked={captain === fantasyPlayer[0]}
                {...register(`${type}.iC`, { required: validationErrors.captain })}
                id={`${player}iC`}
                value={fantasyPlayer[0]}
                name={`${type}.iC`}
                disabled={values[type].iVC === fantasyPlayer[0]}
              />
              <label className="fantasy-captain captain" htmlFor={`${player}iC`}>
                <FormattedMessage id="c" />
              </label>
              <input
                type="radio"
                className="d-none"
                checked={viceCaptain === fantasyPlayer[0]}
                {...register(`${type}.iVC`)}
                id={`${player}iVC`}
                value={fantasyPlayer[0]}
                name={`${type}.iVC`}
                disabled={values[type].iC === fantasyPlayer[0]}
              />
              <label className="fantasy-captain captain" htmlFor={`${player}iVC`}>
                <FormattedMessage id="vc" />
              </label>
              <input
                type="radio"
                className="d-none"
                checked={wicketKeeper === fantasyPlayer[0]}
                {...register(`${type}.iWK`)}
                id={`${player}iWK`}
                value={fantasyPlayer[0]}
                name={`${type}.iWK`}
              />
              <label className="fantasy-captain captain" htmlFor={`${player}iWK`}>
                <FormattedMessage id="wk" />
              </label>
            </div>
            <Button
              className="close-btn"
              onClick={() => {
                removePlayer(player, type)
              }}
            >
              <span className="icon-close"></span>
            </Button>
          </section>
        )
      }}
    </Draggable>
  )
}
FantasyPlayer.propTypes = {
  player: PropTypes.any,
  type: PropTypes.string,
  setValue: PropTypes.func,
  values: PropTypes.object,
  register: PropTypes.func,
  watch: PropTypes.func,
  index: PropTypes.number
}
export default FantasyPlayer
