import React, { useState, useContext } from 'react'
import { Button, Form, Modal, Spinner } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { Controller, useForm } from 'react-hook-form'
import { useLazyQuery } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import DatePicker from 'react-datepicker'
import moment from 'moment'

import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { FETCH_MATCHES_FROM_API } from 'graph-ql/fantasy-tips/query'

function FetchMatchesFromApi({ setModalShow, refetch }) {
  const { dispatch } = useContext(ToastrContext)
  const [dateRange, setDateRange] = useState([null, null])
  const [startDate, endDate] = dateRange

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({})
  const labels = {
    submit: useIntl().formatMessage({ id: 'submit' }),
    cancel: useIntl().formatMessage({ id: 'cancel' }),
    close: useIntl().formatMessage({ id: 'close' })
  }

  const [getNewMatchesFromApi, { loading }] = useLazyQuery(FETCH_MATCHES_FROM_API, {
    onCompleted: (data) => {
      if (data && data.fetchMatchData) {
        setModalShow(false)
        refetch()
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.fetchMatchData.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  function onCountrySubmit(e) {
    const date = moment(Number(e.aPublishDate[0])).format('YYYY-MM-DD') + '|' + moment(Number(e.aPublishDate[1])).format('YYYY-MM-DD')
    const publishDate = date?.split('|')
    getNewMatchesFromApi({
      variables: { input: { dStartDate: publishDate[0], dEndDate: publishDate[1] } }
    })
  }

  return (
    <>
      <Modal show size="sm" aria-labelledby="contained-modal-title-vcenter" centered>
        <Form onSubmit={handleSubmit(onCountrySubmit)}>
          <Modal.Body>
            <Form.Group className="form-group">
              <Form.Label>
                <FormattedMessage id="dateRange" />*
              </Form.Label>
              <Controller
                name="aPublishDate"
                control={control}
                rules={{ required: validationErrors.required }}
                render={({ field: { onChange, value = [] } }) => (
                  <DatePicker
                    value={value}
                    className="form-control"
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => {
                      setDateRange(update)
                      onChange(update)
                    }}
                  />
                )}
              />
              {errors.aPublishDate && (
                <Form.Control.Feedback className="pt-1" type="invalid">
                  {errors.aPublishDate.message}
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
FetchMatchesFromApi.propTypes = {
  setModalShow: PropTypes.func,
  refetch: PropTypes.func
}

export default FetchMatchesFromApi
