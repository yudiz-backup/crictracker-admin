import React, { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Form, Col, Spinner } from 'react-bootstrap'
import { useMutation, useLazyQuery } from '@apollo/client'
import { useHistory, useParams } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl'

import AddTag from 'shared/components/tags'
import SeoMutation from 'shared/components/common-seo/seo-mutation'
import CommonSEO from 'shared/components/common-seo'
import UpdateCache from 'shared/components/cache/updateCache'
import AddCache from 'shared/components/cache/addCache'
import { ADD_TAG_MUTATION, EDIT_TAG_MUTATION } from 'graph-ql/management/tag/mutation'
import { GET_TAG_BY_ID } from 'graph-ql/management/tag/query'
import { TAG_STATIC_SLUG, TOAST_TYPE } from 'shared/constants'
import { ToastrContext } from 'shared/components/toastr'
import { allRoutes } from 'shared/constants/AllRoutes'
import { removeTypeName } from 'shared/utils'

function AddEditTag() {
  const history = useHistory()
  const [name, setName] = useState()
  const [tagData, setTagData] = useState()
  const [tagPayload, setTagPayload] = useState()
  const { id } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const { data: seoSuccess, uploadData, loading: seoLoading } = SeoMutation()
  const { updateCacheData } = UpdateCache()
  const { addCacheData } = AddCache()
  const [tagSlug, setTagSlug] = useState(!id ? TAG_STATIC_SLUG.gt : '')
  const close = useIntl().formatMessage({ id: 'close' })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: tagErrors },
    setError,
    clearErrors,
    setValue,
    watch,
    control,
    getValues: tagSEOValue
  } = useForm({
    mode: 'all',
    defaultValues: {
      eType: 'gt',
      oFB: { sPicture: '' },
      oTwitter: { sPicture: '' },
      sCustomSlug: ''
    }
  })
  const values = tagSEOValue()
  const eType = watch('eType')
  const changedTagId = watch('iId')
  const [getTag, { data }] = useLazyQuery(GET_TAG_BY_ID, {
    onCompleted: (data) => {
      if (data && data.getTagById) {
        setTagData(getTagSlug(data.getTagById))
        !tagData && setTagValue(getTagSlug(data.getTagById))
      }
    }
  })

  const [AddTagMutation, { loading }] = useMutation(ADD_TAG_MUTATION, {
    onCompleted: (data) => {
      if (data && data.addTag) {
        uploadData(
          { ...tagSEOValue().oSeo, sSlug: tagSlug ? tagSlug + tagSEOValue().oSeo.sSlug : tagSEOValue().oSeo.sSlug },
          'gt',
          data.addTag.oData._id,
          false,
          {
            query: GET_TAG_BY_ID,
            variable: { input: { _id: data.addTag.oData._id } },
            getKeyName: 'getTagById'
          }
        )
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.addTag.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
      }
    },
    update: (cache, { data }) => {
      if (data && data.addTag) {
        addCacheData(GET_TAG_BY_ID, { input: { _id: data.addTag.oData._id } }, data.addTag.oData, 'getTagById')
      }
    }
  })

  const [EditTagMutation, { data: tagMutatedData, loading: editTagLoader }] = useMutation(EDIT_TAG_MUTATION, {
    onCompleted: (data) => {
      if (data && data.editTag) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editTag.sMessage, type: TOAST_TYPE.Success, btnTxt: close }
        })
      }
    },
    update: (cache, { data }) => {
      if (data && data.editTag) {
        updateCacheData(GET_TAG_BY_ID, { input: { _id: id } }, data.editTag.oData, 'getTagById')
      }
    }
  })

  useEffect(() => {
    id && getTag({ variables: { input: { _id: id } } })
  }, [id])

  useEffect(() => {
    if ((seoSuccess && !id) || tagMutatedData?.editTag) {
      if (values.eType === 'gt') {
        history.push(allRoutes.tags)
      }
      if (values.eType === 'p') {
        history.push(allRoutes.players)
      }
      if (values.eType === 't') {
        history.push(allRoutes.teams)
      }
    } else if (seoSuccess && id) {
      EditTagMutation({
        variables: { input: { _id: values?._id, tagsInput: tagPayload } }
      })
    }
  }, [seoSuccess, tagMutatedData])

  function prepareTagData(value) {
    const data = JSON.parse(JSON.stringify(value))
    const inputValue =
      data.eType === 'gt' ? {
        eType: data.eType,
        sName: data.sName,
        sContent: data.sContent
      } : {
        eType: data.eType,
        sName: data.sName,
        sContent: data.sContent,
        iId: data.iId._id
      }

    if (id) {
      uploadData(
        { ...tagSEOValue().oSeo, sSlug: tagSlug ? tagSlug + tagSEOValue().oSeo.sSlug : tagSEOValue().oSeo.sSlug },
        values.eType,
        getTagId(),
        true,
        {
          query: GET_TAG_BY_ID,
          variable: { input: { _id: id } },
          getKeyName: 'getTagById'
        }
      )
      setTagPayload(inputValue)
    } else {
      AddTagMutation({ variables: { input: { tagsInput: inputValue } } })
    }
  }
  function getTagSlug(data, type) {
    const slug = type ? data : data.oSeo.sSlug
    const exceptLastSlash = slug?.lastIndexOf('/')
    if (exceptLastSlash === -1) {
      setTagSlug(slug && slug.substring(0, exceptLastSlash) + '')
    } else {
      setTagSlug(slug ? slug.substring(0, exceptLastSlash) + '/' : '')
    }
    return {
      ...data,
      oSeo: {
        ...data.oSeo,
        sSlug: slug?.substring(exceptLastSlash + 1)
      }
    }
  }

  const onAddTag = (data) => {
    prepareTagData(data)
  }

  function getTagId() {
    if (eType === 't' || eType === 'p') {
      return changedTagId._id
    } else return values?._id
  }

  function setTagValue(value) {
    reset({
      _id: value._id,
      eType: value?.eType,
      sName: value?.sName,
      sContent: value?.sContent,
      iId: value?.eType === 'p' ? value?.oPlayer : value?.eType === 't' ? value?.oTeam : [],
      oSeo: {
        sTitle: value?.oSeo?.sTitle,
        sSlug: value?.oSeo?.sSlug,
        sDescription: value?.oSeo?.sDescription,
        aKeywords: value?.oSeo?.aKeywords ? value.oSeo.aKeywords.join(', ') : '',
        sCUrl: value?.oSeo?.sCUrl,
        sRobots: value?.oSeo?.sRobots,
        oFB: value?.oSeo ? removeTypeName(value?.oSeo.oFB) : '',
        oTwitter: value.oSeo ? removeTypeName(value.oSeo.oTwitter) : ''
      }
    })
  }
  function setSeoData(data) {
    const slugAfterLastSlash = data.sSlug.substring(data.sSlug.lastIndexOf('/') + 1, data.sSlug.length)
    getTagSlug(data.sSlug, 'isSlug')
    setValue('oSeo', {
      sTitle: data?.sTitle,
      sSlug: slugAfterLastSlash,
      sDescription: data.sDescription,
      aKeywords: data?.aKeywords ? data?.aKeywords.join(', ') : '',
      sCUrl: data?.sCUrl,
      sRobots: data?.sRobots,
      oFB: data?.oFB ? removeTypeName(data?.oFB) : '',
      oTwitter: data?.oTwitter ? removeTypeName(data?.oTwitter) : ''
    })
  }

  function handleUpdateData(data) {
    setTagData(data)
  }
  return (
    <>
      <Form onSubmit={handleSubmit(onAddTag)}>
        <AddTag
          data={data && data.getTagById}
          register={register}
          errors={tagErrors}
          setValue={setValue}
          control={control}
          watch={watch}
          getValues={tagSEOValue}
          nameChanged={(e) => !id && !name && setName(e)}
          setSeoData={setSeoData}
          clearErrors={clearErrors}
          setTagSlug={setTagSlug}
          name={name}
          tagData={tagData}
        />
        <Col sm="8">
          <CommonSEO
            register={register}
            errors={tagErrors}
            values={tagSEOValue()}
            setError={setError}
            clearErrors={clearErrors}
            previewURL={tagData?.oSeo?.oFB?.sUrl || tagData?.oSeo?.oTwitter?.sUrl}
            fbImg={tagData?.oSeo?.oFB?.sUrl}
            twitterImg={tagData?.oSeo?.oTwitter?.sUrl}
            setValue={setValue}
            control={control}
            id={id}
            slugType={'gt'}
            slug={name ? `${tagSlug}${name}` : undefined}
            hidden
            defaultData={tagData}
            categoryURL={tagSlug}
            onUpdateData={(e) => handleUpdateData(e)}
          />
        </Col>
        <div className="btn-bottom add-border mt-4">
          <Button variant="primary" type="submit" disabled={loading || editTagLoader || seoLoading}>
            <FormattedMessage id={id ? 'update' : 'add'} />
            {(loading || editTagLoader || seoLoading) && <Spinner animation="border" size="sm" />}
          </Button>
        </div>
      </Form>
    </>
  )
}

export default AddEditTag
