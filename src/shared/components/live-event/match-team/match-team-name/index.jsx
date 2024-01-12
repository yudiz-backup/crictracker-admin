import React from 'react'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import MatchTeamImage from '../match-team-image'

function MatchTeamName({ isNotPermitted, register, setValue, getValues, errors }) {
  return (
    <>
      <p className="text-uppercase mb-1">
        <Form.Label>
          <FormattedMessage id="addScoreManually" />
        </Form.Label>
      </p>
      <div className='d-flex gap-4 align-items-start justify-content-start'>
        <MatchTeamImage isNotPermitted={isNotPermitted} setValue={setValue} getValues={getValues} errors={errors} register={register} team="A"/>
        <h2>vs</h2>
        <MatchTeamImage isNotPermitted={isNotPermitted} setValue={setValue} getValues={getValues} errors={errors} register={register} team="B"/>
      </div>
    </>
  )
}
MatchTeamName.propTypes = {
  isNotPermitted: PropTypes.bool,
  register: PropTypes.func,
  setValue: PropTypes.func,
  getValues: PropTypes.func,
  errors: PropTypes.object
}
export default MatchTeamName
