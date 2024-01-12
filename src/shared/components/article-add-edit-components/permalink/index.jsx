import React, { useContext, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, InputGroup } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { useLazyQuery } from '@apollo/client'

import { URL_PREFIX, CUSTOM_URL, TOAST_TYPE } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { GENERATE_SLUG } from 'graph-ql/generate-slug/query'
import { ToastrContext } from 'shared/components/toastr'

function Permalink({
  register,
  errors,
  values,
  setValue,
  setError,
  clearErrors,
  sTitle,
  categoryURL,
  slugType,
  defaultSlug,
  disabled,
  falsySlug
}) {
  const [isEditOpen, setIsOpen] = useState(false)
  const [availableSlug, setAvailableSlug] = useState()
  const [slug, updateSlug] = useState()
  const { dispatch } = useContext(ToastrContext)
  const slugValue = useRef()
  const checkSlugDone = useRef(false)
  const [generateSlugs] = useLazyQuery(GENERATE_SLUG, {
    onCompleted: (data) => {
      if (data?.generateSlugs?.oData) {
        if (!checkSlugDone.current && data.generateSlugs.oData.bIsExists) {
          setValue('oSeo.sCUrl', data.generateSlugs.oData.sSlug)
          setSlug(data.generateSlugs.oData)
          updateSlug(data.generateSlugs.oData.sSlug)
          setAvailableSlug('')
          clearErrors('frontSlug')
          setIsOpen(false)
        }
        if (!data.generateSlugs.oData.bIsExists && !data.generateSlugs.oData.sSlug) {
          updateSlug(slugValue.current)
          setValue('oSeo.sCUrl', categoryURL ? categoryURL + slugValue.current : slugValue.current)
          setValue('oSeo.sSlug', slugValue.current)
          setIsOpen(false)
        }
        if (data.generateSlugs.oData.bIsExists && checkSlugDone.current) {
          setAvailableSlug(data.generateSlugs.oData.sSlug)
          setError('frontSlug', { type: 'manual', message: validationErrors.notAvailable })
          checkSlugDone.current = false
        }
        if (falsySlug && !data.generateSlugs.oData.bIsExists && !checkSlugDone.current) {
          if (!falsySlug.includes(' ')) {
            updateSlug(falsySlug)
            setValue('frontSlug', falsySlug)
            setValue('oSeo.sCUrl', falsySlug)
            setValue('oSeo.sSlug', falsySlug)
          }
        }
        if (data.generateSlugs.oData.sSlug && !isEditOpen && categoryURL) setIsOpen(true)
      }
    }
  })

  function handleChange({ target }) {
    if (target.value) {
      slugValue.current = target.value
    }
  }

  useEffect(() => {
    sTitle && generateSlugs({ variables: { sSlug: categoryURL + sTitle } })
  }, [sTitle])

  useEffect(() => {
    if (values?.oSeo?.sSlug) {
      slugValue.current = values.oSeo.sSlug
      updateSlug(values.oSeo.sSlug)
    }
  }, [values?.oSeo?.sSlug])

  function setSlug(data) {
    if (data.sSlug) {
      setValue('frontSlug', data.sSlug.replace(categoryURL, ''))
      setValue('oSeo.sSlug', data.sSlug.replace(categoryURL, ''))
    } else {
      clearErrors('frontSlug')
      setAvailableSlug('')
    }
    if (sTitle && !values.frontSlug && data.sSlug) {
      slugValue.current = data.sSlug.replace(categoryURL, '')
    }
    if (data.sSlug && !values.frontSlug) {
      updateSlug(data.sSlug)
      setValue('frontSlug', data.sSlug.replace(categoryURL, ''))
      setValue('oSeo.sSlug', data.sSlug.replace(categoryURL, ''))
      clearErrors('frontSlug')
      setAvailableSlug('')
      setIsOpen(false)
    }
  }
  function changeSlug() {
    if (defaultSlug !== slugValue.current) {
      generateSlugs({ variables: { sSlug: categoryURL + slugValue.current } })
      checkSlugDone.current = true
    } else {
      setIsOpen(false)
    }
  }
  useEffect(() => {
    if (categoryURL && slugValue.current) {
      generateSlugs({ variables: { eType: slugType, sSlug: categoryURL + slugValue.current } })
    }
  }, [categoryURL])

  function closeEdit() {
    setValue('frontSlug', slug)
    setValue('oSeo.sSlug', slug)
    setIsOpen(!isEditOpen)
  }

  const frontSlugInput = register('frontSlug', {
    required: validationErrors.required,
    pattern: { value: CUSTOM_URL, message: validationErrors.customURL }
  })

  async function copyPermaLink() {
    try {
      await navigator.clipboard.writeText(URL_PREFIX + categoryURL + slug)
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: <FormattedMessage id="permaLinkCopied" />, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
      })
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }
  return (
    <>
      <div className="permalink">
        <div className="d-flex align-items-center w-100">
          <p className="title-txt">
            <FormattedMessage id="permalink" />:
          </p>
          <a className="link" href={`${URL_PREFIX}${categoryURL}${slug}`} target="_blank" rel="noreferrer">
            {URL_PREFIX}
            {categoryURL}
            {slug}
          </a>
          <div className="btn-div">
            <Button variant="link" className="square icon-btn" onClick={() => setIsOpen(!isEditOpen)} disabled={disabled}>
              <i className={`d-block icon-${isEditOpen ? 'close' : 'create'}`} />
            </Button>
            {slug && (
              <Button variant="link" className="square icon-btn" onClick={copyPermaLink}>
                <i className="icon-copy d-block" />
              </Button>
            )}
          </div>
        </div>
        {isEditOpen && (
          <Form.Group className="form-group mb-0 mt-1">
            <InputGroup>
              <InputGroup.Text>
                {URL_PREFIX}
                {categoryURL}
              </InputGroup.Text>
              <Form.Control
                type="text"
                name="frontSlug"
                {...frontSlugInput}
                onChange={(e) => {
                  frontSlugInput.onChange(e)
                  handleChange(e)
                }}
                className={errors.frontSlug && 'error'}
              />
              <div className="btn-p d-flex align-items-center">
                <Button size="sm" variant="primary" onClick={changeSlug} disabled={!slugValue.current || defaultSlug === slugValue.current}>
                  <FormattedMessage id="done" />
                </Button>
                <Button variant="link" className="square text-white" size="sm" onClick={closeEdit}>
                  <FormattedMessage id="cancel" />
                </Button>
              </div>
            </InputGroup>
            {availableSlug && (
              <Form.Text>
                <FormattedMessage id="suggestedSlug" />: {availableSlug}
              </Form.Text>
            )}
            {errors.frontSlug && <Form.Control.Feedback type="invalid">{errors.frontSlug.message}</Form.Control.Feedback>}
          </Form.Group>
        )}
      </div>
    </>
  )
}
Permalink.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  values: PropTypes.object,
  setValue: PropTypes.func,
  setError: PropTypes.func,
  clearErrors: PropTypes.func,
  sTitle: PropTypes.string,
  categoryURL: PropTypes.string,
  slugType: PropTypes.string,
  defaultSlug: PropTypes.string,
  disabled: PropTypes.bool,
  falsySlug: PropTypes.string
}
export default Permalink
