import React, { useState, useContext, useRef } from 'react'
import { Button, Form, Modal, Spinner } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { Controller, useForm } from 'react-hook-form'
import { useQuery, useLazyQuery } from '@apollo/client'
import Select from 'react-select'
import { FormattedMessage, useIntl } from 'react-intl'

import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { GET_COUNTRY_LIST, GET_NEW_PLAYER_FROM_API } from 'graph-ql/management/player'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { debounce } from 'shared/utils'

function FetchPlayerFromApi({ setModalShow, refetch }) {
  const { dispatch } = useContext(ToastrContext)
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({})
  const [countryList, setCountryList] = useState()
  const [requestParams, setRequestParams] = useState({ nSkip: 1, nLimit: 10, sSearch: '' })
  const totalCountry = useRef(0)
  const isBottomReached = useRef(false)
  const labels = {
    submit: useIntl().formatMessage({ id: 'submit' }),
    cancel: useIntl().formatMessage({ id: 'cancel' }),
    close: useIntl().formatMessage({ id: 'close' })
  }
  const { loading: loadingCountry } = useQuery(GET_COUNTRY_LIST, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      if (isBottomReached.current) {
        setCountryList([...countryList, ...data.listCountry.aResults])
      } else {
        setCountryList(data.listCountry.aResults)
      }
      totalCountry.current = data.listCountry.nTotal
      isBottomReached.current = false
    }
  })

  const [getNewPlayerFromApi, { loading }] = useLazyQuery(GET_NEW_PLAYER_FROM_API, {
    onCompleted: (data) => {
      if (data && data.fetchPlayersFromApi) {
        setModalShow(false)
        refetch()
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.fetchPlayersFromApi.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  function onCountrySubmit(e) {
    getNewPlayerFromApi({ variables: { input: { sCountry: e.sCountry.sISO } } })
  }
  function handleScrollCountry() {
    if (totalCountry.current > requestParams.nSkip * 10) {
      setRequestParams({ ...requestParams, nSkip: requestParams.nSkip + 1 })
      isBottomReached.current = true
    }
  }
  const optimizedSearch = debounce((value, action) => {
    if (action.action !== 'input-blur') {
      setRequestParams({ ...requestParams, sSearch: value, nSkip: 1 })
    }
  })
  return (
    <>
      <Modal show size="sm" aria-labelledby="contained-modal-title-vcenter" centered>
        <Form onSubmit={handleSubmit(onCountrySubmit)}>
          <Modal.Body>
            <Form.Group className="form-group">
              <Form.Label>
                <FormattedMessage id="country" />*
              </Form.Label>
              <Controller
                name="sCountry"
                control={control}
                rules={{ required: validationErrors.required }}
                render={({ field: { onChange, value = [], ref } }) => (
                  <Select
                    ref={ref}
                    value={value}
                    options={countryList}
                    getOptionLabel={(option) => option.sTitle}
                    getOptionValue={(option) => option.sISO}
                    isSearchable
                    className="react-select"
                    classNamePrefix="select"
                    isLoading={loadingCountry}
                    onMenuScrollToBottom={handleScrollCountry}
                    onInputChange={(value, action) => optimizedSearch(value, action)}
                    onChange={(e) => {
                      onChange(e)
                    }}
                  />
                )}
              />
              {errors.sCountry && (
                <Form.Control.Feedback className="pt-1" type="invalid">
                  {errors.sCountry.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="d-flex justify-content-start">
            <Button size="sm" type="submit" disabled={loading}>
              {labels.submit}
              {loading && <Spinner animation="border" size="sm" />}
            </Button>
            <Button size="sm" variant="outline-secondary" onClick={() => setModalShow(false)}>
              {labels.cancel}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}
FetchPlayerFromApi.propTypes = {
  setModalShow: PropTypes.func,
  refetch: PropTypes.func
}

export default FetchPlayerFromApi
