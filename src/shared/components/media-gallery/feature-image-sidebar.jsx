import React, { useEffect, useState, useContext } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
// import { useForm } from 'react-hook-form'
import { FormattedMessage, useIntl } from 'react-intl'
import PropTypes from 'prop-types'
import { useMutation } from '@apollo/client'
import { confirmAlert } from 'react-confirm-alert'

import { S3_PREFIX, TOAST_TYPE } from 'shared/constants'
import CustomAlert from 'shared/components/alert'
import { convertIntoKb, convertDateTimeAMPM } from 'shared/utils'
import ImageEditor from 'shared/components/image-editor'
import { uploadImage } from 'shared/functions/PreSignedData'
import { EDIT_IMAGE, DELETE_IMAGE } from 'graph-ql/article/mutation'
import { ToastrContext } from 'shared/components/toastr'
import { GENERATE_PRE_SIGNED } from 'graph-ql/generate-pre-signed-url'
import { useFormContext } from 'react-hook-form'

const FeatureImageSidebar = ({ data, isPlugin, refetch, gifsGalary, afterDelete }) => {
  const { dispatch } = useContext(ToastrContext)
  const methods = useFormContext()
  let type
  const [imageSrc, setImageSrc] = useState()
  const [show, setShow] = useState(false)
  const [fileData, setFileData] = useState()
  const [imageData, setImageData] = useState()
  const [showCopied, setShowCopied] = useState(false)
  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }

  const [generatePreSignedUrl] = useMutation(GENERATE_PRE_SIGNED, {
    onCompleted: (data) => {
      const urls = data.generatePreSignedUrl
      const uploadData = []
      uploadData.push({ sUploadUrl: urls[0].sUploadUrl, file: fileData })

      const img = document.createElement('img')

      img.src = URL.createObjectURL(fileData)

      uploadImage(uploadData)
        .then((res) => {
          editImage({ variables: { input: { _id: imageData?._id, sUrl: data.generatePreSignedUrl[0].sS3Url, oMeta: { nSize: fileData?.size, nWidth: img?.width, nHeight: img?.height } } } })
        })
        .catch((err) => {
          console.log('err', err)
        })
    }
  })

  const [editImage] = useMutation(EDIT_IMAGE, {
    onCompleted: (data) => {
      if (data) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editImage.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        refetch({ variables: { input: { nSkip: 1, nLimit: 36, sSearch: null, oFilter: { dDate: null } } } })
      }
    }
  })

  const [deleteImage] = useMutation(DELETE_IMAGE, {
    onCompleted: (data) => {
      if (data) {
        afterDelete(imageData._id)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.deleteImage.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
      }
    }
  })

  const handleCopy = (e) => {
    e.preventDefault()
    navigator.clipboard.writeText(S3_PREFIX + data?.sUrl)
    setShowCopied(true)
  }

  const handleEditImage = (e) => {
    e.preventDefault()
    setImageSrc(S3_PREFIX + data?.sUrl)
    setShow(true)
  }

  function onConfirm(croppedFile) {
    setFileData(croppedFile)
    if (data?.sUrl?.split('/')[1] === 'attachments') {
      type = 'articleEditorMedia'
    } else if (data?.sUrl?.split('/')[1] === 'featureimage') {
      type = 'articleFtImg'
    } else {
      type = 'articleThumbImg'
    }
    generatePreSignedUrl({
      variables: {
        generatePreSignedUrlInput: {
          sFileName: data?.sUrl?.split('/').pop().split('.')[0],
          sContentType: croppedFile.type,
          sType: type,
          bAdd: false
        }
      }
    })
  }

  function handleDeleteImage(e) {
    e.preventDefault()
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.confirmationMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            await deleteImage({ variables: { input: { aId: [imageData?._id] } } })
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }

  useEffect(() => {
    setImageData(data)
  }, [data])

  useEffect(() => {
    if (showCopied) {
      setTimeout(() => {
        setShowCopied(false)
      }, 2000)
    }
  }, [showCopied])

  return (
    <>
    {
      !gifsGalary && (
        <ImageEditor
          file={imageSrc}
          aspectRatio={16 / 10}
          show={show}
          setShow={setShow}
          onConfirmProp={(croppedFile) => {
            onConfirm(croppedFile)
          }}
        />
      )
    }
      <div className="feature-image-div">
        <h6>
          <FormattedMessage id="featuredImage" />
        </h6>
        <Row>
          <Col sm={isPlugin ? 5 : 4}>
            <img className="sidebar-image" src={gifsGalary ? `${data?.images?.preview_gif?.url}` : `${data?.sUrl && S3_PREFIX + data?.sUrl}`} />
          </Col>
          <Col>
            <span className="media-img-title">{gifsGalary ? `${data?.title}` : `${data?.sUrl?.split('/').pop()}`}</span>
            <br />
            {(!gifsGalary && (data?.oAuthor?.sDisplayName || data?.oAuthor?.sUName)) && (
              <>
                <span className="dark-text">{data?.oAuthor?.sDisplayName || data?.oAuthor?.sUName}</span>
                <br />
              </>
            )}
            {!gifsGalary && <span className="dark-text">{convertDateTimeAMPM(data?.dCreated)}</span>}
            <br />
            {!gifsGalary && data?.oMeta?.nSize && (
              <>
                <span className="dark-text">
                  {convertIntoKb(data?.oMeta?.nSize)} <FormattedMessage id="kb" />
                </span>
                <br />
              </>
            )}
            {
              !gifsGalary && (
                <>
                  <button className="modify-button-blue" onClick={(e) => handleEditImage(e)}>
                    <FormattedMessage id="editImage" />
                  </button>
                  <br />
                  <button className="modify-button-red" onClick={(e) => handleDeleteImage(e)}>
                    <FormattedMessage id="deleteImagePermanently" />
                  </button>
                </>
              )
            }
            {!gifsGalary && data?.oMeta?.nWidth && data?.oMeta?.nHeight && (
              <span className="dark-text">
                <FormattedMessage id="dimensions" /> {data?.oMeta?.nWidth} <FormattedMessage id="by" /> {data?.oMeta?.nHeight}{' '}
                <FormattedMessage id="pixels" />
              </span>
            )}
            <br></br>
          </Col>
        </Row>
        <div className="mt-2 me-4">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="altText" />
            </Form.Label>
            <Form.Control type="text" name="sText" {...methods.register('sText')} />
          </Form.Group>
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="caption" />
            </Form.Label>
            <Form.Control as="textarea" name="sCaption" {...methods.register('sCaption')} />
          </Form.Group>
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="attribution" />
            </Form.Label>
            <Form.Control as="textarea" name="sAttribution" {...methods.register('sAttribute')} />
          </Form.Group>
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="fileUrl" />
            </Form.Label>
            <Form.Control type="text" defaultValue={S3_PREFIX + data?.sUrl} disabled />
          </Form.Group>
          <button onClick={(e) => handleCopy(e)} className="modify-button-blue-underline">
            <FormattedMessage id="copyUrlToClipboard" />
          </button>
          {showCopied && (
            <span className="dark-text">
              <FormattedMessage id="copied" />
            </span>
          )}
        </div>
      </div>
    </>
  )
}

FeatureImageSidebar.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  register: PropTypes.func,
  refetch: PropTypes.func,
  afterDelete: PropTypes.func,
  isPlugin: PropTypes.bool,
  gifsGalary: PropTypes.bool
}

export default FeatureImageSidebar
