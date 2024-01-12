import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Row, Col } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { Controller } from 'react-hook-form'
import { useLazyQuery } from '@apollo/client'
import Select from 'react-select'
import { useParams } from 'react-router-dom'
import TinyEditor from 'shared/components/editor'

import { validationErrors } from 'shared/constants/ValidationErrors'
import { E_TYPE, TAG_STATIC_SLUG } from 'shared/constants'
import { GET_PLAYER_TAGS } from 'graph-ql/management/player'
import { GET_TEAM_TAGS } from 'graph-ql/management/team'
import { debounce } from 'shared/utils'
import Loading from '../loading'
import { GET_SEO_DATA_BY_ID } from 'graph-ql/management/tag/query'
import CommonInput from '../common-input'

function AddTag({
  register,
  errors,
  setValue,
  reset,
  control,
  nameChanged,
  data,
  watch,
  getValues,
  setSeoData,
  clearErrors,
  setTagSlug,
  name,
  tagData
}) {
  const { id } = useParams()
  const [players, setPlayers] = useState()
  const [teams, setTeams] = useState()
  const [requestParamsPlayer, setRequestParamsPlayer] = useState({ nSkip: 1, nLimit: 10, sSearch: '', aStatus: ['p'], eType: 't' })
  const [requestParamsTeam, setRequestParamsTeam] = useState({ nSkip: 1, nLimit: 10, sSearch: '', aStatus: ['p'], eType: 't' })
  const isBottomReached = useRef(false)
  const totalPlayers = useRef(0)
  const totalTeams = useRef(0)
  const eType = watch('eType')
  const defaultTagValue = { label: <FormattedMessage id="general" />, value: 'gt' }
  const values = getValues()

  const [getPlayers, { loading: loadingPlayers }] = useLazyQuery(GET_PLAYER_TAGS, {
    variables: { input: requestParamsPlayer },
    onCompleted: (data) => {
      if (data && data.listPlayerTags) {
        if (isBottomReached.current) {
          setPlayers([...players, ...data.listPlayerTags.aResults])
        } else {
          setPlayers(data.listPlayerTags.aResults)
        }
        totalPlayers.current = data.listPlayerTags.nTotal
        isBottomReached.current = false
      }
    }
  })

  const [getTeams, { loading: loadingTeams }] = useLazyQuery(GET_TEAM_TAGS, {
    variables: { input: requestParamsTeam },
    onCompleted: (data) => {
      if (data && data.listTeamTags) {
        if (isBottomReached.current) {
          setTeams([...teams, ...data.listTeamTags.aResults])
        } else {
          setTeams(data.listTeamTags.aResults)
        }
        totalTeams.current = data.listTeamTags.nTotal
        isBottomReached.current = false
      }
    }
  })

  const [getSeoData, { loading: seoDataLoading }] = useLazyQuery(GET_SEO_DATA_BY_ID, {
    onCompleted: (data) => {
      if (data && data.getSeoByIdAdmin) {
        setSeoData(data.getSeoByIdAdmin)
      }
    }
  })

  useEffect(() => {
    if (requestParamsTeam && eType === 't') {
      getTeams()
    }
  }, [eType, requestParamsTeam])

  useEffect(() => {
    if (requestParamsPlayer && eType === 'p') {
      getPlayers()
    }
  }, [eType, requestParamsPlayer])

  function handleBlur({ target }) {
    !name && nameChanged(target.value)
  }

  function handleScroll(type) {
    if (type === 'player') {
      if (totalPlayers.current > requestParamsPlayer.nSkip * 10) {
        setRequestParamsPlayer({ ...requestParamsPlayer, nSkip: requestParamsPlayer.nSkip + 1 })
        isBottomReached.current = true
      }
    }
    if (type === 'team') {
      if (totalTeams.current > requestParamsTeam.nSkip * 10) {
        setRequestParamsTeam({ ...requestParamsTeam, nSkip: requestParamsTeam.nSkip + 1 })
        isBottomReached.current = true
      }
    }
  }

  const optimizedSearch = debounce((txt, { action, prevInputValue }, type) => {
    if (type === 'player') {
      if (action === 'input-change') {
        if (txt) setRequestParamsPlayer({ ...requestParamsPlayer, sSearch: txt, nSkip: 1 })
      }
      if (action === 'set-value') {
        prevInputValue && setRequestParamsPlayer({ ...requestParamsPlayer, sSearch: '', nSkip: 1 })
      }
      if (action === 'menu-close') {
        prevInputValue && setRequestParamsPlayer({ ...requestParamsPlayer, sSearch: '', nSkip: 1 })
      }
    }
    if (type === 'team') {
      if (action === 'input-change') {
        if (txt) setRequestParamsTeam({ ...requestParamsTeam, sSearch: txt, nSkip: 1 })
      }
      if (action === 'set-value') {
        prevInputValue && setRequestParamsTeam({ ...requestParamsTeam, sSearch: '', nSkip: 1 })
      }
      if (action === 'menu-close') {
        prevInputValue && setRequestParamsTeam({ ...requestParamsTeam, sSearch: '', nSkip: 1 })
      }
    }
  })
  function onTagTypeChange(e) {
    if (e.value === 'gt') {
      clearErrors('iId')
    } else if (e.value === 'p') {
      setValue('iId', tagData?.oPlayer)
    } else if (e.value === 't') {
      setValue('iId', tagData?.oTeam)
    } else if (e.value === 'v') {
      clearErrors('iId')
    }
    setTagSlug(TAG_STATIC_SLUG[e.value])
  }

  function onPlayerTeamChange(e) {
    getSeoData({ variables: { input: { iId: e._id } } })
  }
  return (
    <Row>
      {seoDataLoading && <Loading />}
      <Col sm="8">
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="type" />*
          </Form.Label>
          <Controller
            name="eType"
            control={control}
            rules={{ required: validationErrors.required }}
            render={({ field: { onChange, value, ref } }) => (
              <Select
                ref={ref}
                value={id ? E_TYPE.filter((x) => x.value === value)[0] : defaultTagValue}
                options={E_TYPE}
                className={`react-select ${errors.eType && 'error'}`}
                isDisabled={!id}
                classNamePrefix="select"
                isSearchable={false}
                onChange={(e) => {
                  onChange(e.value)
                  onTagTypeChange(e)
                }}
              />
            )}
          />
          {errors.eType && <Form.Control.Feedback type="invalid">{errors.eType.message}</Form.Control.Feedback>}
        </Form.Group>
      </Col>
      {eType === 'p' && (
        <Col sm="8">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="player" />*
            </Form.Label>
            <Controller
              name="iId"
              control={control}
              rules={{ required: eType === 'p' && validationErrors.required }}
              render={({ field: { onChange, value = [], ref } }) => (
                <Select
                  ref={ref}
                  value={value || values?.iId}
                  options={players}
                  getOptionLabel={(option) => option.sFirstName}
                  getOptionValue={(option) => option._id}
                  className={`react-select ${errors?.iId && 'error'}`}
                  classNamePrefix="select"
                  isSearchable={true}
                  onMenuScrollToBottom={() => handleScroll('player')}
                  isLoading={loadingPlayers}
                  onInputChange={(value, action) => optimizedSearch(value, action, 'player')}
                  onChange={(e) => {
                    onChange(e)
                    onPlayerTeamChange(e)
                  }}
                />
              )}
            />
            {errors.iId && <Form.Control.Feedback type="invalid">{errors.iId.message}</Form.Control.Feedback>}
          </Form.Group>
        </Col>
      )}
      {eType === 't' && (
        <Col sm="8">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="team" />*
            </Form.Label>
            <Controller
              name="iId"
              control={control}
              rules={{ required: eType === 't' && validationErrors.required }}
              render={({ field: { onChange, value = [], ref } }) => (
                <Select
                  ref={ref}
                  value={value || values?.iId}
                  options={teams}
                  getOptionLabel={(option) => option.sTitle}
                  getOptionValue={(option) => option._id}
                  className={`react-select ${errors?.iId && 'error'}`}
                  classNamePrefix="select"
                  isSearchable={true}
                  onMenuScrollToBottom={() => handleScroll('team')}
                  isLoading={loadingTeams}
                  onInputChange={(value, action) => optimizedSearch(value, action, 'team')}
                  onChange={(e) => {
                    onChange(e)
                    onPlayerTeamChange(e)
                  }}
                />
              )}
            />
            {errors.iId && <Form.Control.Feedback type="invalid">{errors.iId.message}</Form.Control.Feedback>}
          </Form.Group>
        </Col>
      )}
      <Col sm="8">
        <CommonInput
          type="text"
          onBlur={handleBlur}
          register={register}
          errors={errors}
          className={errors.sName && 'error'}
          name="sName"
          label="name"
          validation={{ maxLength: { value: 40, message: validationErrors.maxLength(40) } }}
          required
        />
      </Col>
      <Col sm="8">
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="content" />
          </Form.Label>
          <TinyEditor
            className={`form-control ${errors.sContent && 'error'}`}
            name="sContent"
            control={control}
            onlyTextFormatting
          />
          {errors.sContent && <Form.Control.Feedback type="invalid">{errors.sContent.message}</Form.Control.Feedback>}
        </Form.Group>
      </Col>
    </Row>
  )
}

AddTag.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  setValue: PropTypes.func,
  reset: PropTypes.func,
  control: PropTypes.object,
  nameChanged: PropTypes.func,
  data: PropTypes.object,
  watch: PropTypes.func,
  getValues: PropTypes.func,
  setSeoData: PropTypes.func,
  clearErrors: PropTypes.func,
  setTagSlug: PropTypes.func,
  name: PropTypes.string,
  tagData: PropTypes.object
}

export default AddTag
