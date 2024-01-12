import React, { useContext, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { useForm } from 'react-hook-form'
import PropTypes from 'prop-types'
// import SelectMatch from 'shared/components/live-event/match-team/select-match'
import MatchTeamName from 'shared/components/live-event/match-team/match-team-name'
import PermissionProvider from 'shared/components/permission-provider'
import MatchInningsScore from 'shared/components/live-event/match-team/match-innings-score'
import { Button, Form, Spinner } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import { useMutation } from '@apollo/client'
import { UPDATE_MATCH_SCORE } from 'graph-ql/live-events/mutations'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'

function EditScore({ isNotPermitted, oTeams, isMatchId }) {
  const { register, setValue, reset, getValues, handleSubmit, formState: { errors } } = useForm({
    mode: 'all'
  })
  const { id } = useParams()
  const { dispatch } = useContext(ToastrContext)

  const [updateMatchScores, { loading: updateMatchScoresLoading }] = useMutation(UPDATE_MATCH_SCORE, {
    onCompleted: (data) => {
      if (data && data?.updateMatchScores) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.updateMatchScores?.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
        reset({
          oTeams: data?.updateMatchScores?.oData?.oTeams
        })
      }
    }
  })

  useEffect(() => {
    reset({
      oTeams
    })
  }, [oTeams])

  const handleUpdateScore = (data) => {
    const input = {
      oTeams: {
        sTeamAovers: data?.oTeams?.sTeamAovers,
        sTeamBovers: data?.oTeams?.sTeamBovers,
        sScoreSummary: data?.oTeams?.sScoreSummary,
        oTeamA: {
          oFirstInningScore: {
            sRun: data?.oTeams?.oTeamA?.oFirstInningScore?.sRun,
            sWicket: data?.oTeams?.oTeamA?.oFirstInningScore?.sWicket
          },
          oSecondInningScore: {
            sRun: data?.oTeams?.oTeamA?.oSecondInningScore?.sRun,
            sWicket: data?.oTeams?.oTeamA?.oSecondInningScore?.sWicket
          },
          sLogoUrl: data?.oTeams?.oTeamA?.sLogoUrl,
          sName: data?.oTeams?.oTeamA?.sName
        },
        oTeamB: {
          oFirstInningScore: {
            sRun: data?.oTeams?.oTeamB?.oFirstInningScore?.sRun,
            sWicket: data?.oTeams?.oTeamB?.oFirstInningScore?.sWicket
          },
          oSecondInningScore: {
            sRun: data?.oTeams?.oTeamB?.oSecondInningScore?.sRun,
            sWicket: data?.oTeams?.oTeamB?.oSecondInningScore?.sWicket
          },
          sLogoUrl: data?.oTeams?.oTeamB?.sLogoUrl,
          sName: data?.oTeams?.oTeamB?.sName
        }
      }
    }
    updateMatchScores({ variables: { input: { iEventId: id, ...input } } })
  }
  return (
    <Form className='team-box mt-4' onSubmit={handleSubmit(handleUpdateScore)}>
      <h3 className='mb-4 text-uppercase'><FormattedMessage id='score' /></h3>
      <MatchTeamName setValue={setValue} getValues={getValues} isNotPermitted={isNotPermitted} register={register} errors={errors}/>
      <MatchInningsScore isNotPermitted={isNotPermitted} register={register} errors={errors} />
      <PermissionProvider isAllowedTo="EDIT_LIVEEVENT">
        <Button variant="primary" disabled={isNotPermitted || updateMatchScoresLoading} type='submit' onClick={handleSubmit(handleUpdateScore)}>
          {(updateMatchScoresLoading) && <Spinner animation="border" size="sm" />}
          <FormattedMessage id="updateScore" />
        </Button>
      </PermissionProvider>
    </Form>
  )
}
EditScore.propTypes = {
  isNotPermitted: PropTypes.bool,
  isMatchId: PropTypes.bool,
  values: PropTypes.object,
  oTeams: PropTypes.object,
  control: PropTypes.object,
  isLiveEvent: PropTypes.bool
}
export default EditScore
