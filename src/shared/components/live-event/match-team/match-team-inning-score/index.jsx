import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import PropTypes from 'prop-types'

import CommonInput from 'shared/components/common-input'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { ONLY_NUMBER } from 'shared/constants'
import { Form } from 'react-bootstrap'

function MatchTeamInningScore({ register, errors, inning, isNotPermitted }) {
  return (
    <div className='d-flex flex-column'>
      <h6><FormattedMessage id={`inning${inning}`}/></h6>
      <div className='d-flex gap-2'>
        <div className='w-50 team-row d-flex'>
          <CommonInput
            placeholder={`${useIntl().formatMessage({ id: 'teamAScore' })}`}
            type="text"
            register={register}
            disabled={isNotPermitted}
            className={errors?.oTeams?.oTeamA?.[`o${inning}InningScore`]?.sRun && 'error'}
            name={`oTeams.oTeamA.o${inning}InningScore.sRun`}
            validation={{ pattern: { value: ONLY_NUMBER, message: validationErrors.number }, maxLength: { value: 10, message: validationErrors.maxLength(10) } }}
          >
            <Form.Control.Feedback type="invalid">{errors?.oTeams?.oTeamA?.[`o${inning}InningScore`]?.sRun?.message}</Form.Control.Feedback>
          </CommonInput>
          <h1>/</h1>
          <CommonInput
            placeholder={`${useIntl().formatMessage({ id: 'teamAWickets' })}`}
            type="text"
            register={register}
            disabled={isNotPermitted}
            className={errors?.oTeams?.oTeamA?.[`o${inning}InningScore`]?.sWicket && 'error'}
            name={`oTeams.oTeamA.o${inning}InningScore.sWicket`}
            validation={{ pattern: { value: ONLY_NUMBER, message: validationErrors.number }, maxLength: { value: 10, message: validationErrors.maxLength(10) } }}
          >
            <Form.Control.Feedback type="invalid">{errors?.oTeams?.oTeamA?.[`o${inning}InningScore`]?.sWicket?.message}</Form.Control.Feedback>
          </CommonInput>
        </div>
        <h2>vs</h2>
        <div className='w-50 team-row d-flex'>
          <CommonInput
            placeholder={`${useIntl().formatMessage({ id: 'teamBScore' })}`}
            type="text"
            register={register}
            disabled={isNotPermitted}
            className={errors?.oTeams?.oTeamB?.[`o${inning}InningScore`]?.sRun && 'error'}
            name={`oTeams.oTeamB.o${inning}InningScore.sRun`}
            validation={{ pattern: { value: ONLY_NUMBER, message: validationErrors.number }, maxLength: { value: 10, message: validationErrors.maxLength(10) } }}
          >
            <Form.Control.Feedback type="invalid">{errors?.oTeams?.oTeamB?.[`o${inning}InningScore`]?.sRun?.message}</Form.Control.Feedback>
          </CommonInput>
          <h1>/</h1>
          <CommonInput
            placeholder={`${useIntl().formatMessage({ id: 'teamBWickets' })}`}
            type="text"
            register={register}
            disabled={isNotPermitted}
            className={errors?.oTeams?.oTeamB?.[`o${inning}InningScore`]?.sWicket && 'error'}
            name={`oTeams.oTeamB.o${inning}InningScore.sWicket`}
            validation={{ pattern: { value: ONLY_NUMBER, message: validationErrors.number }, maxLength: { value: 10, message: validationErrors.maxLength(10) } }}
          >
            <Form.Control.Feedback type="invalid">{errors?.oTeams?.oTeamB?.[`o${inning}InningScore`]?.sWicket?.message}</Form.Control.Feedback>
          </CommonInput>
        </div>
      </div>
    </div>
  )
}
MatchTeamInningScore.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  isNotPermitted: PropTypes.bool,
  inning: PropTypes.string
}
export default MatchTeamInningScore
