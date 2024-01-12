import React from 'react'
import { useIntl } from 'react-intl'
import PropTypes from 'prop-types'
import CommonInput from 'shared/components/common-input'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { ONLY_NUMBER } from 'shared/constants'
import MatchTeamInningScore from '../match-team-inning-score'

function MatchInningsScore({ isNotPermitted, register, errors }) {
  return (
    <>
      <MatchTeamInningScore isNotPermitted={isNotPermitted} inning="First" register={register} errors={errors}/>
      <MatchTeamInningScore isNotPermitted={isNotPermitted} inning="Second" register={register} errors={errors}/>
      <div className='team-row d-flex'>
        <div className='one w-50'>
          <CommonInput
            label={useIntl().formatMessage({ id: 'over' })}
            type="text"
            register={register}
            disabled={isNotPermitted}
            errors={errors}
            className={errors?.oTeams?.sTeamAovers && 'error'}
            name="oTeams.sTeamAovers"
            validation={{ pattern: { value: ONLY_NUMBER, message: validationErrors.number }, maxLength: { value: 10, message: validationErrors.maxLength(10) } }}
          />
        </div>
        <div className='two w-50'>
          <CommonInput
            label={useIntl().formatMessage({ id: 'over' })}
            type="text"
            errors={errors}
            disabled={isNotPermitted}
            className={errors?.oTeams?.sTeamBovers && 'error'}
            register={register}
            name="oTeams.sTeamBovers"
            validation={{ pattern: { value: ONLY_NUMBER, message: validationErrors.number }, maxLength: { value: 10, message: validationErrors.maxLength(10) } }}
          />
        </div>
      </div>
      <div className='team-row d-flex'>
        <div className='one w-100'>
          <CommonInput
            label={useIntl().formatMessage({ id: 'scoreSummary' })}
            type="text"
            disabled={isNotPermitted}
            register={register}
            name="oTeams.sScoreSummary"
          />
        </div>
      </div>
    </>
  )
}
MatchInningsScore.propTypes = {
  isNotPermitted: PropTypes.bool,
  isMatchId: PropTypes.bool,
  register: PropTypes.func,
  errors: PropTypes.object,
  values: PropTypes.object,
  control: PropTypes.object,
  isLiveEvent: PropTypes.bool
}
export default MatchInningsScore
