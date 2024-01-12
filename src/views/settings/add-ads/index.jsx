import React, { useContext, useEffect } from 'react'
import { Form, Row, Col, Button } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@apollo/client'
import { FormattedMessage } from 'react-intl'

import { validationErrors } from 'shared/constants/ValidationErrors'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { ADD_ADS } from 'graph-ql/settings/ads/mutation'
import { GET_ADS } from 'graph-ql/settings/ads/query'
import PermissionProvider from 'shared/components/permission-provider'

const AddAds = () => {
  const { dispatch } = useContext(ToastrContext)
  const [AddAdsMutation, { addsLoader }] = useMutation(ADD_ADS, {
    onCompleted: (data) => {
      if (data && data.addAdsTxt) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.addAdsTxt.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
      }
    }
  })

  const { data: adsData } = useQuery(GET_ADS)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()

  const addAds = (data) => {
    AddAdsMutation({ variables: { input: { sAds: data.sAds } } })
  }

  useEffect(() => {
    adsData &&
      reset({
        sAds: adsData?.getAdsTxt
      })
  }, [adsData])

  return (
    <>
      <Form onSubmit={handleSubmit(addAds)}>
        <Row>
          <Col sm="12">
            <Form.Group className="form-group">
              <Form.Label>
                <FormattedMessage id="pasteContentForAdd" />
              </Form.Label>
              <Form.Control
                style={{ height: '600px' }}
                as={'textarea'}
                name="sAds"
                className={errors.sAds && 'error'}
                {...register('sAds', {
                  required: validationErrors.required
                })}
              />
              {errors.sAds && <Form.Control.Feedback type="invalid">{errors.sAds.message}</Form.Control.Feedback>}
            </Form.Group>
          </Col>
        </Row>
        <PermissionProvider isAllowedTo="EDIT_ADS_TXT">
          <Row>
            <Col sm="1">
              <Button variant="outline-primary" type="submit" disabled={addsLoader}>
                <FormattedMessage id="submit" />
              </Button>
            </Col>
            <Col sm="1">
              <Button variant="outline-secondary" onClick={() => reset({})}>
                <FormattedMessage id="clear" />
              </Button>
            </Col>
          </Row>
        </PermissionProvider>
      </Form>
    </>
  )
}

export default AddAds
