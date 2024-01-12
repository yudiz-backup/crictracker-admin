import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useFormContext } from 'react-hook-form'
import PropTypes from 'prop-types'
import MatchTeamName from './match-team-name'
import MatchInningsScore from './match-innings-score'
import SelectMatch from './select-match'
import { Form } from 'react-bootstrap'
import { validationErrors } from 'shared/constants/ValidationErrors'

function MatchTeam({ isNotPermitted, isMatchId, isLiveEvent, values, control }) {
  const { register, setValue, watch, getValues, formState: { errors } } = useFormContext()
  return (
    <div className='team-box mt-4'>
      <h3 className='mb-4 text-uppercase'><FormattedMessage id='score' /></h3>
      {
        (isMatchId || isLiveEvent) && (<p className='d-flex text-uppercase align-items-center gap-2'><i className="icon-info" /><FormattedMessage id='seleceScoreOrAddManually' /></p>)
      }
      <Form.Group className="form-group radio-group">
        <div className="d-flex">
          <Form.Check
            {...register('isCustomMatch', { required: validationErrors.required })}
            disabled={isNotPermitted}
            type="radio"
            value="selectMatch"
            label={useIntl().formatMessage({ id: 'selectMatch' })}
            className="mb-0 mt-0"
            name="isCustomMatch"
            id="selectMatch"
          />
          <Form.Check
            {...register('isCustomMatch', { required: validationErrors.required })}
            value="manualScore"
            type="radio"
            disabled={isNotPermitted}
            label={useIntl().formatMessage({ id: 'manualScore' })}
            className="mb-0 mt-0"
            name="isCustomMatch"
            id="manualScore"
          />
          <Form.Check
            {...register('isCustomMatch', { required: validationErrors.required })}
            value="none"
            type="radio"
            disabled={isNotPermitted}
            label={useIntl().formatMessage({ id: 'none' })}
            className="mb-0 mt-0"
            name="isCustomMatch"
            id="none"
          />
        </div>
      </Form.Group>
      {watch('isCustomMatch') === 'selectMatch' ? <SelectMatch values={values} control={control} errors={errors} /> : null}
      {(isLiveEvent) && watch('isCustomMatch') === 'manualScore' ? (
        <MatchTeamName setValue={setValue} getValues={getValues} isNotPermitted={isNotPermitted} register={register} errors={errors} />
      ) : null}
      {!isLiveEvent && isMatchId && (
        <MatchInningsScore isNotPermitted={isNotPermitted} register={register} errors={errors} />
      )}
    </div>
  )
}
MatchTeam.propTypes = {
  isNotPermitted: PropTypes.bool,
  isMatchId: PropTypes.bool,
  values: PropTypes.object,
  control: PropTypes.object,
  isLiveEvent: PropTypes.bool
}
export default MatchTeam
