import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Spinner } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { useLazyQuery, useMutation } from '@apollo/client'

import Drawer from '../drawer'
import { scrollBottom, getCurrentUser, getDesignation } from 'shared/utils'
import { CREATE_ARTICLE_COMMENT } from 'graph-ql/article/mutation'
import { useForm } from 'react-hook-form'
import moment from 'moment'
import { GET_ARTICLE_COMMENT } from 'graph-ql/article/query'
import { GENERATE_PRE_SIGNED } from 'graph-ql/generate-pre-signed-url'
import { getPreSignedData, uploadImage } from 'shared/functions/PreSignedData'
import { S3_PREFIX } from 'shared/constants'
import ImagePopup from '../image-popup'
import { GET_FANTASY_ARTICLE_COMMENT } from 'graph-ql/fantasy-tips/query'
import { CREATE_FANTASY_ARTICLE_COMMENT } from 'graph-ql/fantasy-tips/mutation'

function ArticleComments({ isOpen, handleChange, articleData, type }) {
  const currentUser = getCurrentUser()
  const [comment, setComment] = useState([])
  const isTopReached = useRef(false)
  const totalData = useRef(0)
  const [isImgOpen, setIsImgOpen] = useState({})
  const lastId = useRef()
  const [payload, setPayload] = useState({ iArticleId: articleData._id, nLimit: 10, nOrder: -1, nSkip: 1 })

  const [addComment] = useMutation(CREATE_ARTICLE_COMMENT)
  const [addFantasyComment] = useMutation(CREATE_FANTASY_ARTICLE_COMMENT)
  const [generatePreSignedUrl] = useMutation(GENERATE_PRE_SIGNED)
  const [getComments, { loading }] = useLazyQuery(GET_ARTICLE_COMMENT, {
    variables: { input: payload },
    onCompleted: (data) => {
      if (data?.listArticleComment) {
        handleArticleResponse(data.listArticleComment)
      }
    }
  })
  const [getFantasyComments, { loading: fLoading }] = useLazyQuery(GET_FANTASY_ARTICLE_COMMENT, {
    variables: { input: payload },
    onCompleted: (data) => {
      if (data?.listFantasyArticleComment) {
        handleArticleResponse(data.listFantasyArticleComment)
      }
    }
  })
  const { register, handleSubmit, reset } = useForm({ mode: 'all', defaultValues: {} })

  useEffect(() => {
    if (isOpen) {
      type === 'fa' ? getFantasyComments() : getComments()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isTopReached.current && comment.length) {
      scrollBottom('comment-list')
    } else if (isTopReached.current) {
      const ele = document.getElementById(lastId.current)
      ele.scrollIntoView()
    }
    isTopReached.current = false
  }, [comment])

  function onSubmit(msg) {
    insertComment(msg)
  }

  function insertComment(msg) {
    const input = {
      aPic: [],
      ...msg,
      iArticleId: articleData._id,
      iReceiverId: currentUser._id === articleData.iAuthorId ? articleData.iReviewerId : articleData.iAuthorId
    }
    if (type === 'fa') {
      addFantasyComment({ variables: { input } })
    } else {
      addComment({ variables: { input } })
    }
    setComment([...comment, { ...input, iSenderId: currentUser._id, oSender: currentUser, dSentDate: new Date() }])
    scrollBottom('comment-list')
    reset({})
  }

  async function handleImageChange({ target }) {
    if (target.files.length) {
      const { value, data } = getPreSignedData({ articleChat: target.files })
      const { data: preSigned } = await generatePreSignedUrl({ variables: { generatePreSignedUrlInput: value } })
      const msg = { aPic: [] }
      if (preSigned?.generatePreSignedUrl) {
        const uploadData = data.articleChatMedia.map((e, i) => {
          msg.aPic.push(preSigned.generatePreSignedUrl[i].sS3Url)
          return { ...e, sUploadUrl: preSigned.generatePreSignedUrl[i].sUploadUrl }
        })
        uploadImage(uploadData).then(() => {
          insertComment(msg)
        })
      }
    }
  }

  function handleArticleResponse(data) {
    if (isTopReached.current) {
      lastId.current = comment[0]._id
      const array = [...data.aResults]
      setComment([...array.reverse(), ...comment])
    } else {
      const array = [...data.aResults]
      setComment(array.reverse())
      scrollBottom('comment-list')
    }
    totalData.current = data.nTotal
  }

  function handleScroll({ target }) {
    if (!target.scrollTop && !isTopReached.current && totalData.current > comment.length) {
      isTopReached.current = true
      setPayload({ ...payload, nSkip: payload.nSkip + 1 })
    }
  }

  function handleImageOpen(index, data) {
    setIsImgOpen({ isOpen: true, active: index, data })
  }

  return (
    <>
      {isImgOpen?.isOpen && (
        <ImagePopup
          isOpen={isImgOpen?.isOpen}
          data={isImgOpen?.data}
          active={isImgOpen?.active}
          onClose={() => setIsImgOpen({ isOpen: false })}
        />
      )}
      <div className="cm-btn" onClick={handleChange}>
        <i className="icon-comment" />
        <FormattedMessage id="articleFeedback" />
      </div>
      <Drawer isOpen={isOpen} onClose={handleChange} title={<FormattedMessage id="articleFeedback" />}>
        <div className="comment-list" onScroll={handleScroll}>
          <span className="date">
            <FormattedMessage id="today" />
          </span>
          <ul className="m-0 p-0">
            {(loading || fLoading) && (
              <div className="text-center mt-4">
                <Spinner animation="border" size="sm" />
              </div>
            )}
            {comment.map((item, index) => {
              return (
                <li id={item?._id} key={index} className={`${currentUser._id === item.iSenderId && 'right'}`}>
                  {item.iSenderId !== comment[index - 1]?.iSenderId && (
                    <>
                      <div className="name">
                        {item.oSender.sDisplayName}
                        <span>{getDesignation(item.oSender.eDesignation)}</span>
                      </div>
                    </>
                  )}
                  {item.aPic?.length ? (
                    <div className={`msg images ${item.aPic.length >= 2 && 'two'} ${item.aPic.length === 3 && 'three'}`}>
                      {item.aPic.map((e, i) => {
                        if (i <= 3) {
                          return (
                            <div key={e} className="img" onClick={() => handleImageOpen(i, item.aPic)}>
                              <img src={S3_PREFIX + e} alt={e} />
                              {i === 3 && item.aPic.length > 4 && <div className="extra">+{item.aPic.length - 4}</div>}
                            </div>
                          )
                        } else return null
                      })}
                    </div>
                  ) : (
                    <div className="msg">{item.sMessage}</div>
                  )}
                  <span className="time d-block">{moment(Number(item.dSentDate)).format('LT')}</span>
                </li>
              )
            })}
          </ul>
          <div className="input-box">
            <Form>
              <Form.Group className="form-group mb-0 ">
                <Form.Control
                  type="text"
                  placeholder={useIntl().formatMessage({ id: 'typeYourMessage' })}
                  {...register('sMessage', { required: true })}
                  className="bg-transparent"
                />
                <div className="btn-r d-flex">
                  <input type="file" name="addImg" id="addImg" multiple accept=".jpg,.png,.jpeg,.webp" hidden onChange={handleImageChange} />
                  <label htmlFor="addImg" className="icon-btn btn btn-link">
                    <i className="icon-image-1 d-block" />
                  </label>
                  <Button variant="link" className="icon-btn ms-2" type="submit" onClick={handleSubmit(onSubmit)}>
                    <i className="icon-send d-block" />
                  </Button>
                </div>
              </Form.Group>
            </Form>
          </div>
        </div>
      </Drawer>
    </>
  )
}
ArticleComments.propTypes = {
  isOpen: PropTypes.bool,
  handleChange: PropTypes.func,
  articleData: PropTypes.object,
  type: PropTypes.string
}
export default ArticleComments
