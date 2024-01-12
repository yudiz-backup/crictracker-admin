import { useLazyQuery, useMutation } from '@apollo/client'
import { useHistory, useParams } from 'react-router-dom'
import React, { useContext, useEffect, useState } from 'react'
import { Button, Col, Form, Spinner } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import { GET_FANTASY_OVERVIEW_BY_ID } from 'graph-ql/fantasy-tips/query'
import { EDIT_FANTASY_OVERVIEW } from 'graph-ql/fantasy-tips/mutation'
import UpdateCache from 'shared/components/cache/updateCache'
import { ToastrContext } from 'shared/components/toastr'
import FantasyMatchInfo from 'shared/components/fantasy-overview-components/match-info'
import TinyEditor from 'shared/components/editor'
import FantasyOverviewPlayingXI from 'shared/components/fantasy-overview-components/fantasy-overview-playing-xi'
import FantasyMatchReport from 'shared/components/fantasy-overview-components/fantasy-match-report'
import { removeTypeName } from 'shared/utils'
import { TOAST_TYPE } from 'shared/constants'
import { allRoutes } from 'shared/constants/AllRoutes'
import CustomAlert from 'shared/components/alert'

function EditFantasyOverview() {
  const history = useHistory()
  const [overviewData, setOverviewData] = useState({})
  const { id } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const { updateCacheData } = UpdateCache()
  const close = useIntl().formatMessage({ id: 'close' })
  const [players, setPlayer] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors: overviewErrors },
    setValue,
    control,
    getValues
  } = useForm({ mode: 'all' })

  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    nPaceBowling: useIntl().formatMessage({ id: 'paceBowling' }),
    nSpinBowling: useIntl().formatMessage({ id: 'spinBowling' }),
    nBattingPitch: useIntl().formatMessage({ id: 'battingPitch' }),
    nBowlingPitch: useIntl().formatMessage({ id: 'bowlingPitch' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'fieldsAreEmptyAreYouSureYouWantToUpdateThis' })
  }

  const values = getValues()
  const [getMatchOverviewData] = useLazyQuery(GET_FANTASY_OVERVIEW_BY_ID, {
    onCompleted: (data) => {
      if (data && data.getMatchOverview) {
        setOverviewData(data.getMatchOverview)
        setOverviewValue(data.getMatchOverview)
      }
    }
  })
  const [EditFantasyMutation, { loading: editFantasyLoader }] = useMutation(EDIT_FANTASY_OVERVIEW, {
    onCompleted: (data) => {
      if (data && data.editMatchOverview) {
        history.push(allRoutes.fantasyTipsList)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editMatchOverview.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
      }
    },
    update: (cache, { data }) => {
      if (data.editMatchOverview) {
        updateCacheData(GET_FANTASY_OVERVIEW_BY_ID, { input: { iMatchId: id } }, data.editMatchOverview?.oData, 'getMatchOverview')
      }
    }
  })

  useEffect(() => {
    id && getMatchOverviewData({ variables: { input: { iMatchId: id } } })
  }, [id])

  function prepareOverviewData(value) {
    const inputValue = {
      iMatchId: overviewData?.oMatch?._id,
      oTeam1: {
        ...value?.oTeam1,
        aPlayers: value?.oTeam1?.aPlayers?.map((player) => player.split(',')[0]),
        iTeamId: overviewData?.oMatch?.oTeamA?._id
      },
      oTeam2: {
        ...value?.oTeam2,
        aPlayers: value?.oTeam2?.aPlayers?.map((player) => player.split(',')[0]),
        iTeamId: overviewData?.oMatch?.oTeamB?._id
      },
      iWinnerTeamId: value?.iWinnerTeamId?.value,
      sNews: value?.sNews,
      sAvgScore: value?.sAvgScore,
      sPitchCondition: value?.sPitchCondition,
      sWeatherReport: value?.sWeatherReport,
      sPitchReport: value?.sPitchReport,
      sMatchPreview: value?.sMatchPreview,
      nPaceBowling: Number(value?.nPaceBowling),
      nSpinBowling: Number(value?.nSpinBowling),
      nBattingPitch: Number(value?.nBattingPitch),
      nBowlingPitch: Number(value?.nBowlingPitch),
      sBroadCastingPlatform: value?.sBroadCastingPlatform,
      sLiveStreaming: value?.sLiveStreaming
    }
    if (id) {
      EditFantasyMutation({ variables: { input: inputValue, _id: id } })
    } else {
      EditFantasyMutation({ variables: { input: inputValue } })
    }
  }

  function setOverviewValue(value) {
    reset({
      oTeamA: removeTypeName(value?.oMatch?.oTeamA),
      oTeamB: removeTypeName(value?.oMatch?.oTeamB),
      dStartDate: removeTypeName(value?.oMatch?.dStartDate),
      dEndDate: removeTypeName(value?.oMatch?.dEndDate),
      oVenue: removeTypeName(value?.oMatch?.oVenue),
      iWinnerTeamId: {
        label: value?.oOverview?.oWinnerTeam?.sTitle,
        value: value?.oOverview?.oWinnerTeam?._id
      },
      oTeam1: {
        aPlayers: value?.oOverview?.oTeam1?.aPlayers.map((player) => {
          return player._id + ',' + player.sFirstName + ',' + player.sPlayingRole
        }),
        iC: value?.oOverview?.oTeam1?.iC,
        iVC: value?.oOverview?.oTeam1?.iVC,
        iWK: value?.oOverview?.oTeam1?.iWK
      },
      oTeam2: {
        aPlayers: value?.oOverview?.oTeam2?.aPlayers.map((player) => {
          return player._id + ',' + player.sFirstName + ',' + player.sPlayingRole
        }),
        iC: value?.oOverview?.oTeam2?.iC,
        iVC: value?.oOverview?.oTeam2?.iVC,
        iWK: value?.oOverview?.oTeam2?.iWK
      },
      sNews: value?.oOverview?.sNews,
      sAvgScore: value?.oOverview?.sAvgScore,
      sPitchCondition: value?.oOverview?.sPitchCondition,
      sWeatherReport: value?.oOverview?.sWeatherReport,
      sPitchReport: value?.oOverview?.sPitchReport,
      sMatchPreview: value?.oOverview?.sMatchPreview,
      nPaceBowling: value?.oOverview?.nPaceBowling,
      nSpinBowling: value?.oOverview?.nSpinBowling,
      nBattingPitch: value?.oOverview?.nBattingPitch,
      nBowlingPitch: value?.oOverview?.nBowlingPitch,
      sBroadCastingPlatform: value?.oOverview?.sBroadCastingPlatform,
      sLiveStreaming: value?.oOverview?.sLiveStreaming
    })
  }
  function onSubmit(formValue) {
    const { nBattingPitch, nBowlingPitch, nPaceBowling, nSpinBowling } = formValue
    if (!nBattingPitch || !nBowlingPitch || !nPaceBowling || !nSpinBowling) {
      const sMessage = `${!nPaceBowling ? `${labels.nPaceBowling},` : ''} ${!nSpinBowling ? `${labels.nSpinBowling},` : ''} ${!nBattingPitch ? `${labels.nBattingPitch},` : ''} ${!nBowlingPitch ? `${labels.nBowlingPitch},` : ''} ${labels.confirmationMessage}`
      confirmAlert({
        title: labels.confirmationTitle,
        message: sMessage,
        customUI: CustomAlert,
        buttons: [
          {
            label: labels.yes,
            onClick: () => {
              prepareOverviewData(formValue)
            }
          },
          {
            label: labels.no
          }
        ]
      })
    } else {
      prepareOverviewData(formValue)
    }
  }

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Col sm="12">
          <FantasyMatchInfo data={overviewData?.oMatch} />
        </Col>

        <Col sm="12">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="FantasyMatchPreview" />
            </Form.Label>
            <TinyEditor
              className={'form-control'}
              name="sMatchPreview"
              control={control}
              initialValue={overviewData?.oOverview?.sMatchPreview}
              required
            />
            {overviewErrors.sMatchPreview && (
              <Form.Control.Feedback type="invalid">{overviewErrors.sMatchPreview.message}</Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>

        <Col sm="12">
          <FantasyOverviewPlayingXI
            control={control}
            overviewData={overviewData}
            values={getValues()}
            register={register}
            errors={overviewErrors}
            setValue={setValue}
            watch={watch}
            defaultPlayer={players}
          />
        </Col>

        <Col sm="12">
          <FantasyMatchReport register={register} errors={overviewErrors} values={values} control={control} overviewData={overviewData} />
        </Col>

        {/* <Col sm="8">
          <CommonSEO
            register={register}
            errors={overviewErrors}
            values={getValues()}
            setError={setError}
            clearErrors={clearErrors}
            previewURL={overviewData?.oOverview?.oSeo?.oFB?.sUrl || overviewData?.oOverview?.oSeo?.oTwitter?.sUrl}
            fbImg={overviewData?.oOverview?.oSeo?.oFB?.sUrl}
            twitterImg={overviewData?.oOverview?.oSeo?.oTwitter?.sUrl}
            setValue={setValue}
            control={control}
            id={id}
            slugType={'mo'}
            hidden
            defaultData={overviewData.oOverview}
          />
        </Col> */}
        <div className="btn-bottom add-border mt-4 ">
          <Button
            variant="outline-secondary"
            type="reset"
            onClick={() => {
              reset({})
              setPlayer([])
            }}
          >
            <FormattedMessage id="clear" />
          </Button>
          <Button variant="primary" type="submit" className="m-2" disabled={editFantasyLoader}>
            <FormattedMessage id="update" />
            {editFantasyLoader && <Spinner animation="border" size="sm" />}
          </Button>
        </div>
      </Form>
    </>
  )
}

export default EditFantasyOverview
