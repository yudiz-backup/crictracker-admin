import React, { useContext, useEffect, useRef, useState } from 'react'
import { useMutation } from '@apollo/client'
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min'
import { FormProvider, useForm } from 'react-hook-form'
import { FormattedMessage } from 'react-intl'

import CommonInput from 'shared/components/common-input'
import TinyEditor from 'shared/components/editor'
import CommentarySidebar from 'shared/components/commentary/commentarySidebar'
import { ADD_CUSTOM_COMMENTARY, UPDATE_CUSTOM_COMMENTARY } from 'graph-ql/commentary/mutation'
import { TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { appendParams, parseParams } from 'shared/utils'

function EditCommentary() {
  const id = useParams()?.id
  const params = parseParams(location.search)
  const lastTotal = useRef(0)
  const [type, setType] = useState(false)
  const methods = useForm({ mode: 'all' })
  const { dispatch } = useContext(ToastrContext)
  const refetchCommentaryData = useRef()

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    getValues,
    reset
  } = methods

  useEffect(() => {
    if (params?.id && params?.ball) {
      setValue('sBall', params?.ball)
      if (params.type === 'add') {
        setValue('iBeforeCommId', params?.id)
      } else {
        setValue('iCommId', params?.id)
      }
      setValue('sCommentary', params?.com)
      setType(params?.type)
    }
  }, [])

  const [addCommentary, { loading: addLoading }] = useMutation(ADD_CUSTOM_COMMENTARY, {
    onCompleted: (data) => {
      reset({
        sCommentary: '',
        sBall: '',
        iBeforeCommId: ''
      })
      appendParams({ id: '', ball: '', type: '' })
      refetchCommentaryData.current({ iMatchId: id, nLimit: 10 })
      setType()
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: data?.addCustomCommentary?.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
      })
    }
  })

  const [updateCommentary, { loading: editLoading }] = useMutation(UPDATE_CUSTOM_COMMENTARY, {
    onCompleted: (data) => {
      reset({
        sCommentary: '',
        sBall: '',
        iBeforeCommId: ''
      })
      appendParams({ id: '', ball: '', type: '', com: '' })
      refetchCommentaryData.current({ iMatchId: id, nLimit: 10 })
      setType()
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: data?.addCustomCommentary?.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
      })
    }
  })

  function addEditCommentary(data) {
    const mapData = { ...data }
    delete mapData.sBall
    mapData.iMatchId = id
    if (params?.type === 'edit') {
      delete mapData.iBeforeCommId
      updateCommentary({ variables: { input: { ...mapData } } })
    } else {
      delete mapData.iCommId
      addCommentary({ variables: { input: { ...mapData } } })
    }
  }

  return (
    <Row>
      <Col sm="12" md="7">
        <FormProvider {...methods}>
          <Form onSubmit={handleSubmit(addEditCommentary)}>
            <Form.Group className="form-group live-events-editor">
              <input type="hidden" name="" {...register('iBeforeCommId')} />
              <input type="hidden" name="" {...register('iCommId')} />
              <CommonInput className="w-25" type="text" control={control} register={register} name="sBall" disabled label="ballAfterCom" />
              <TinyEditor
                className={`form-control ${errors.sContent && 'error'}`}
                name="sCommentary"
                control={control}
                register={register}
                values={getValues}
                setValue={setValue}
                error={errors?.sContent?.message}
                required
                commentary
              />
            </Form.Group>
          </Form>
          <Button variant="primary" disabled={!type} type="submit" onClick={handleSubmit(addEditCommentary)} className="w-100">
        <FormattedMessage id={type === 'edit' ? 'editCommentary' : 'addCommentary'} />
        {(addLoading || editLoading) && <Spinner animation="border" size="sm" />}
      </Button>
        </FormProvider>
      </Col>
      <Col sm="12" md="5" className="mt-4 mt-md-0">
        <CommentarySidebar
          id={id}
          lastTotal={lastTotal}
          setValue={setValue}
          reset={reset}
          setType={setType}
          values={getValues}
          ref={refetchCommentaryData}
        />
      </Col>

    </Row>
  )
}

export default EditCommentary
