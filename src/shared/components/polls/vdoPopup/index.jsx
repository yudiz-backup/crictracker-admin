import React from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { FormProvider, useForm } from 'react-hook-form'

import CommonInput from 'shared/components/common-input'
import MediaFooter from 'shared/components/media-gallery/media-footer'

function VdoPopup({ show, handleHide, handleVdoUrl }) {
  const methods = useForm()
  const { handleSubmit, setValue, errors, register } = methods

  function handleData(data) {
    handleVdoUrl({
      sUrl: data.sUrl
    })
    setValue('sUrl', '')
    handleHide()
  }

  return (
    <FormProvider {...methods}>
      <Modal
        className="media-modal"
        show={show}
        onHide={() => handleHide()}
        centered
        dialogClassName="modal-50w"
        aria-labelledby="example-custom-modal-styling-title"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-custom-modal-styling-title">
            <FormattedMessage id="addYtVdo" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CommonInput
            register={register}
            errors={errors}
            className={`${errors?.sUrl && 'error'}`}
            as="input"
            placeholder={useIntl().formatMessage({ id: 'source' })}
            type="text"
            name='sUrl'
            required
            label="source"
          />
        </Modal.Body>
        <Modal.Footer>
          <MediaFooter />
          <Button size="md" variant="primary" type={'submit'} onClick={handleSubmit(handleData)}>
            <FormattedMessage id="save" />
          </Button>
        </Modal.Footer>
      </Modal>
    </FormProvider>
  )
}

VdoPopup.propTypes = {
  show: PropTypes.bool,
  handleHide: PropTypes.func,
  handleVdoUrl: PropTypes.func
}

export default VdoPopup
