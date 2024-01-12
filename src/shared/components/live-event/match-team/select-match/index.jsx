import React, { useRef, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { Controller } from 'react-hook-form'
import PropTypes from 'prop-types'
import Select from 'react-select'
import { Form } from 'react-bootstrap'
import { useQuery } from '@apollo/client'

import { debounce } from 'shared/utils'
import { LIST_MATCH_FOR_LIVE_EVENT } from 'graph-ql/live-events/query'

function SelectMatch({ values, control, errors }) {
  const [matchesList, setMatchesList] = useState()
  const totalMatches = useRef(10)
  const isBottomReached = useRef(false)
  const [requestParamsListMatches, setRequestParamsListMatches] = useState({
    aStatus: ['scheduled', 'live'],
    nLimit: 10,
    nOrder: 1,
    nSkip: 1,
    sSearch: '',
    sSortBy: 'dStartDate',
    eType: 'm',
    aDate: []
  })

  const { loading: loadingMatches } = useQuery(LIST_MATCH_FOR_LIVE_EVENT, {
    variables: { input: requestParamsListMatches },
    onCompleted: (data) => {
      if (data?.listFantasyMatch) {
        if (isBottomReached.current) {
          setMatchesList([...matchesList, ...data.listFantasyMatch.aResults])
        } else {
          setMatchesList(data?.listFantasyMatch?.aResults)
        }

        totalMatches.current = data.listFantasyMatch?.aResults?.length
        isBottomReached.current = false
      }
    }
  })

  function handleScrollMatches() {
    if (totalMatches.current < requestParamsListMatches.nLimit) {
      isBottomReached.current = false
    } else {
      setRequestParamsListMatches({ ...requestParamsListMatches, nSkip: requestParamsListMatches.nSkip + 1 })
      isBottomReached.current = true
    }
  }

  const optimizedSearch = debounce((value, action) => {
    if (action.action !== 'input-blur') {
      setRequestParamsListMatches({ ...requestParamsListMatches, sSearch: value, nSkip: 1 })
    }
  })
  return (
    <Form.Group className="form-group">
      <Form.Label>
        <FormattedMessage id="selectMatch" />
      </Form.Label>
      <Controller
        name="oMatch"
        control={control}
        render={({ field: { onChange, value = [], ref } }) => (
          <Select
            ref={ref}
            value={value || values?.oMatch}
            options={matchesList}
            getOptionLabel={(option) => `${option.sTitle} ${option.sSubtitle}`}
            getOptionValue={(option) => option._id}
            className={`react-select ${errors?.oParentCategory && 'error'}`}
            classNamePrefix="select"
            onInputChange={(value, action) => optimizedSearch(value, action)}
            isSearchable={true}
            isLoading={loadingMatches}
            onMenuScrollToBottom={handleScrollMatches}
            onChange={(e) => {
              onChange(e)
            }}
          />
        )}
      />
      {errors.oParentCategory && <Form.Control.Feedback type="invalid">{errors.oParentCategory.message}</Form.Control.Feedback>}
    </Form.Group>
  )
}
SelectMatch.propTypes = {
  values: PropTypes.object,
  control: PropTypes.object,
  errors: PropTypes.object
}
export default SelectMatch
