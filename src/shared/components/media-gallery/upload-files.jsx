import { useMutation } from '@apollo/client'
import React, { useContext, useRef, useState } from 'react'
import { Container } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'

import { ToastrContext } from 'shared/components/toastr'
import { uploadImage } from 'shared/functions/PreSignedData'
import { TOAST_TYPE } from 'shared/constants'
import Loading from '../loading'
import { checkImageType } from 'shared/utils'
import { INSERT_IMAGE } from 'graph-ql/article/mutation'
import { GENERATE_PRE_SIGNED } from 'graph-ql/generate-pre-signed-url'

const UploadFiles = ({ handleTabs }) => {
  const { dispatch } = useContext(ToastrContext)
  const imageFile = useRef()
  const [loading, setLoading] = useState(false)

  const [insertImage] = useMutation(INSERT_IMAGE, {
    onCompleted: (data) => {
      if (data) {
        setLoading(false)
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.insertImage.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
        handleTabs()
      }
    }
  })
  const [generatePreSignedUrl] = useMutation(GENERATE_PRE_SIGNED, {
    onCompleted: (data) => {
      if (data && data.generatePreSignedUrl) {
        const urls = data.generatePreSignedUrl
        const uploadData = []
        const images = []
        for (let img = 0; img < imageFile.current?.length; img++) {
          const image = document.createElement('img')
          image.src = URL.createObjectURL(imageFile.current[img])

          image.onload = () => {
            uploadData.push({ sUploadUrl: urls[img].sUploadUrl, file: imageFile.current[img] })
            images.push({
              sUrl: urls[img]?.sS3Url,
              oMeta: { nSize: imageFile.current[img]?.size, nWidth: image?.width, nHeight: image?.height }
            })
            const lastData = imageFile.current?.length - 1 === img
            if (lastData) {
              uploadImage(uploadData)
                .then((res) => {
                  insertImage({
                    variables: {
                      input: images
                    }
                  })
                })
                .catch((err) => {
                  console.log('err', err)
                })
            }
          }
          image.remove()
        }
      }
    }
  })

  const handleImageChange = (e) => {
    if (e.target.files.length) {
      const aFiles = Object.values(e.target.files)

      if (!aFiles.map(obj => checkImageType(obj.type)).some(ele => ele === false)) {
        imageFile.current = aFiles

        const images = aFiles.map(obj => {
          return {
            sFileName: obj.name.split('.')[0],
            sContentType: obj.type,
            sType: 'articleEditorMedia'
          }
        })

        setLoading(true)
        generatePreSignedUrl({
          variables: {
            generatePreSignedUrlInput: images
          }
        })
      } else {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: <FormattedMessage id="imgValidation" />, type: TOAST_TYPE.Error }
        })
      }
    }
  }

  return (
    <>
      <Container>
        <div className="middle-div text-center">
          {!loading && (
            <div>
              <h1>
                <FormattedMessage id="dropFilesToUpload" />
              </h1>
              <p className="text-left dark-text">
                <FormattedMessage id="or" />
              </p>
              <input type="hidden" name="oImg.sUrl" />
              <input
                type="file"
                name="oImg.fSUrl"
                id="uploadImg"
                accept=".jpg,.png,.jpeg,.webp"
                hidden
                multiple={true}
                onChange={(e) => {
                  handleImageChange(e)
                }}
              />
              <label htmlFor="uploadImg" className="btn btn-primary">
                <i className="icon-upload big"></i>
                <FormattedMessage id="selectFile" />
              </label>
              <p className="mt-4 dark-text">
                <FormattedMessage id="MaximumFileSize" />
              </p>
            </div>
          )}
          {loading && (
            <div className="loader media-upload-loader">
              <Loading />
            </div>
          )}
        </div>
      </Container>
    </>
  )
}

UploadFiles.propTypes = {
  handleTabs: PropTypes.func
}

export default UploadFiles
