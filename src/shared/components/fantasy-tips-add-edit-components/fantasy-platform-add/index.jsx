import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import { Button, Form, Modal } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { Controller, useForm } from 'react-hook-form'
import { useHistory } from 'react-router-dom'
import { useMutation } from '@apollo/client'

import { platFormType } from 'shared/utils'
import { PLATFORM_TYPE, TOAST_TYPE } from 'shared/constants'
import { CREATE_FANTASY_ARTICLE, COPY_FANTASY_ARTICLE } from 'graph-ql/fantasy-tips/mutation'
import { allRoutes } from 'shared/constants/AllRoutes'
import { ToastrContext } from 'shared/components/toastr'
import { validationErrors } from 'shared/constants/ValidationErrors'

function FantasyPlatFormAdd({ data }) {
  const history = useHistory()
  const [modalOpen, setModalOpen] = useState(false)
  const { dispatch } = useContext(ToastrContext)

  const [createArticle, { loading }] = useMutation(CREATE_FANTASY_ARTICLE, {
    onCompleted: (data) => {
      if (data?.createFantasyArticle) {
        handleArticleResponse(data.createFantasyArticle.oData, data.createFantasyArticle.message)
      }
    }
  })

  const [copyArticle, { loading: copyLoading }] = useMutation(COPY_FANTASY_ARTICLE, {
    onCompleted: (data) => {
      if (data?.copyFantasyArticle) {
        handleArticleResponse(data.copyFantasyArticle.oData, data.copyFantasyArticle.message)
      }
    }
  })

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'all'
  })

  function handleModal() {
    setModalOpen(!modalOpen)
  }

  function onSubmit({ ePlatformType }) {
    if (data.type === 'add') {
      createArticle({ variables: { input: { ePlatformType: ePlatformType.value, iMatchId: data._id } } })
    } else {
      copyArticle({ variables: { input: { ePlatformType: ePlatformType.value, _id: data._id } } })
    }
  }

  function handleArticleResponse(data, message) {
    history.push(allRoutes.addFantasyTips(platFormType(data.ePlatformType), data._id))
    dispatch({
      type: 'SHOW_TOAST',
      payload: { message, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
    })
  }

  useEffect(() => {
    if (data._id) handleModal()
  }, [data])
  return (
    <>
      <Modal size="md" show={modalOpen} onHide={handleModal} centered>
        <Modal.Body>
          <h4 className="mb-3">
            <FormattedMessage id="selectFantasyPlatform" />
          </h4>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="form-group">
              <Controller
                name="ePlatformType"
                control={control}
                rules={{ required: validationErrors.required }}
                render={({ field: { onChange, value = '', ref } }) => (
                  <>
                    <Select
                      ref={ref}
                      value={value}
                      options={PLATFORM_TYPE.map((p) => (data?.selectedPlatform.includes(p.value) ? { ...p, isDisabled: true } : p))}
                      className={`react-select ${errors.ePlatformType && 'error'}`}
                      classNamePrefix="select"
                      isSearchable={false}
                      onChange={(e) => {
                        onChange(e)
                      }}
                    />
                  </>
                )}
              />
              {errors.ePlatformType && <Form.Control.Feedback type="invalid">{errors.ePlatformType.message}</Form.Control.Feedback>}
            </Form.Group>
            <p>
              <FormattedMessage id="addedDraftAccount" />
            </p>
            <div>
              <Button variant="outline-secondary" onClick={handleModal} size="sm" disabled={loading || copyLoading}>
                <FormattedMessage id="cancel" />
              </Button>
              <Button size="sm" className="ms-2" variant="primary" type="submit" disabled={loading || copyLoading}>
                <FormattedMessage id="submit" />
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  )
}

FantasyPlatFormAdd.propTypes = {
  data: PropTypes.object
}
export default React.memo(FantasyPlatFormAdd)
