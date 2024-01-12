import React from 'react'
import PropTypes from 'prop-types'
import { Button, Row, Col, Form } from 'react-bootstrap'
import { useFieldArray, useWatch } from 'react-hook-form'
import { FormattedMessage } from 'react-intl'

import TeamPreview from '../team-preview'
import TeamSelection from '../team-selection'
import { teamFields } from '../playing-xi'
import Loading from 'shared/components/loading'

function TeamCard({ register, errors, control, colOne, colTwo, players, index, setValue, articleData, disabled, changeRating, loading }) {
  const team = useWatch({
    control,
    name: `aLeague[${index}].aTeam`
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: `aLeague[${index}].aTeam`
  })
  function deleteTeam(k) {
    remove(k)
  }
  function copyTeam(k) {
    const teamValue = JSON.parse(JSON.stringify(team[k]))
    append(teamValue)
  }
  function addTeam() {
    append(teamFields(articleData?.oMatch?.oTeamScoreA?.oTeam, articleData?.oMatch?.oTeamScoreB?.oTeam))
  }
  return fields.map((t, k) => {
    return (
      <div
        className={
          `inner-box team-box ${errors?.aLeague && errors?.aLeague[index] && errors?.aLeague[index]?.aTeam && errors?.aLeague[index]?.aTeam[k] ? 'error' : ''
          }`}
        key={t?.id}
      >
        <h3 className="team-name">
          <FormattedMessage id="team" /> {k + 1}
        </h3>
        <div className="right-btn">
          <Button disabled={disabled} onClick={addTeam} variant="link" size="sm" className="square icon-btn">
            <i className="icon-add d-block" />
          </Button>
          <Button disabled={disabled} onClick={() => copyTeam(k)} variant="link" size="sm" className="square icon-btn">
            <i className="icon-copy d-block" />
          </Button>
          {fields.length !== 1 && (
            <Button disabled={disabled} onClick={() => deleteTeam(k)} variant="link" size="sm" className="square icon-btn">
              <i className="icon-delete d-block" />
            </Button>
          )}
        </div>
        <Row className="gutter-9">
          <Col {...colOne}>
            <TeamSelection
              register={register}
              control={control}
              players={players}
              pIndex={index}
              cIndex={k}
              setValue={setValue}
              articleData={articleData}
              disabled={disabled}
              changeRating={changeRating}
            />
            {loading && <Loading />}
          </Col>
          <Col {...colTwo}>
            <TeamPreview pIndex={index} cIndex={k} control={control} />
          </Col>
        </Row>
        {/* {errors?.aLeague && errors?.aLeague[index] && errors?.aLeague[index]?.aTeam && errors?.aLeague[index]?.aTeam[k]?.iTPFanId && (
          <Form.Control.Feedback type="invalid">{errors.aLeague[index]?.aTeam[k]?.iTPFanId.message}</Form.Control.Feedback>
        )} */}
        {errors?.aLeague && errors?.aLeague[index] && errors?.aLeague[index]?.aTeam && errors?.aLeague[index]?.aTeam[k]?.iCapFanId && (
          <Form.Control.Feedback type="invalid">{errors.aLeague[index]?.aTeam[k]?.iCapFanId.message}</Form.Control.Feedback>
        )}
        {errors?.aLeague && errors?.aLeague[index] && errors?.aLeague[index]?.aTeam && errors?.aLeague[index]?.aTeam[k]?.iVCFanId && (
          <Form.Control.Feedback type="invalid">{errors.aLeague[index]?.aTeam[k]?.iVCFanId.message}</Form.Control.Feedback>
        )}
      </div>
    )
  })
}
TeamCard.propTypes = {
  register: PropTypes.func,
  colOne: PropTypes.object,
  colTwo: PropTypes.object,
  control: PropTypes.object,
  errors: PropTypes.object,
  players: PropTypes.array,
  index: PropTypes.number,
  setValue: PropTypes.func,
  changeRating: PropTypes.func,
  articleData: PropTypes.object,
  disabled: PropTypes.bool,
  loading: PropTypes.bool
}
export default TeamCard
