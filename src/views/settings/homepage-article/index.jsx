import { useLazyQuery, useQuery } from '@apollo/client'
import { GET_CATEGORY_LIST_ARTICLE, GET_TAG_LIST_ARTICLE } from 'graph-ql/article/query'
import { GET_SERIES_TAG_HOME_PAGE } from 'graph-ql/settings/home-page-article'
import React, { useEffect, useRef, useState } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { FormattedMessage } from 'react-intl'
import Select from 'react-select'
import HomePageArticleDND from './article-drag-drop'

function HomePageArticle() {
  const [simpleCategory, setSimpleCategory] = useState([])
  const [category, setCategory] = useState([])
  const [tag, setTag] = useState([])
  const [isMenuOpen, setIsMenuOpen] = useState({})
  const [seriesList, setSeriesList] = useState()
  const currentDropdown = useRef()
  const totalRecords = useRef({ sc: 0, c: 0, gt: 0, t: 0, p: 0 })
  const [payloadCat, setPayloadCat] = useState({
    eStatus: 'a',
    aType: ['s'],
    nSkip: 1,
    nLimit: 10,
    sSortBy: 'dCreated',
    nOrder: -1,
    sSearch: ''
  })
  const [payloadTag, setPayloadTag] = useState({
    aStatusFiltersInput: ['a'],
    getTagsPaginationInput: {
      aType: ['gt'],
      nSkip: 1,
      nLimit: 10,
      sSortBy: 'dCreated',
      nOrder: -1,
      sSearch: ''
    }
  })
  const isBottomReached = useRef(false)
  const {
    control,
    // handleSubmit,
    getValues,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      aSeries: [],
      aTags: []
    }
  })

  const values = getValues()

  useQuery(GET_SERIES_TAG_HOME_PAGE, {
    onCompleted: (data) => {
      data.getHomePagePriority?.length > 0 && setValue('aSeries', data.getHomePagePriority?.filter((item) => item?.eType === 'as'))
      data.getHomePagePriority?.length > 0 && setValue('aTags', data.getHomePagePriority?.filter((item) => item?.eType === 'gt'))
      setSeriesList(data.getHomePagePriority)
    }
  })

  const [getCategory, { loading }] = useLazyQuery(GET_CATEGORY_LIST_ARTICLE, {
    variables: { input: payloadCat?.aType[0] === 's' ? { ...payloadCat, bForArticle: true } : payloadCat },
    onCompleted: (data) => {
      if (data && data.getCategory.aResults) {
        if (currentDropdown.current === 'sc') {
          if (isBottomReached.current) setSimpleCategory([...simpleCategory, ...data.getCategory.aResults])
          else setSimpleCategory(data.getCategory.aResults)
          totalRecords.current.sc = data.getCategory.nTotal
        } else if (currentDropdown.current === 'c') {
          isBottomReached.current ? setCategory([...category, ...data.getCategory.aResults]) : setCategory(data.getCategory.aResults)
          totalRecords.current.c = data.getCategory.nTotal
        }
        isBottomReached.current = false
      }
    }
  })

  const [getTag, { loading: tagLoading }] = useLazyQuery(GET_TAG_LIST_ARTICLE, {
    variables: { input: payloadTag },
    onCompleted: (data) => {
      if (data && data.getTags) {
        if (currentDropdown.current === 'gt') {
          isBottomReached.current ? setTag([...tag, ...data.getTags.aResults]) : setTag(data.getTags.aResults)
        }
        totalRecords.current[currentDropdown.current] = data.getTags.nTotal
        isBottomReached.current = false
      }
    }
  })

  useEffect(() => {
    currentDropdown.current && getCategory()
  }, [payloadCat])

  useEffect(() => {
    currentDropdown.current && getTag()
  }, [payloadTag])

  function handleScroll(type) {
    if (type === 'sc' && simpleCategory.length < totalRecords.current.sc) {
      setPayloadCat({ ...payloadCat, aType: ['s'], nSkip: simpleCategory.length / 10 + 1 })
      isBottomReached.current = true
    } else if (type === 'c' && category.length < totalRecords.current.c) {
      setPayloadCat({ ...payloadCat, aType: ['as'], nSkip: category.length / 10 + 1 })
      isBottomReached.current = true
    } else if (type === 'gt' && tag.length < totalRecords.current.gt) {
      setPayloadTag({
        ...payloadTag,
        getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, nSkip: tag.length / 10 + 1, aType: ['gt'] }
      })
      isBottomReached.current = true
    }
  }

  function handleClick(type) {
    if (type === 'sc' && !simpleCategory.length) {
      setPayloadCat({ ...payloadCat, nSkip: 1, aType: ['s'] })
    } else if (type === 'c' && !category.length) {
      setPayloadCat({ ...payloadCat, nSkip: 1, aType: ['as'] })
    } else if (type === 'gt' && !tag.length) {
      setPayloadTag({ ...payloadTag, getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, nSkip: 1, aType: ['gt'] } })
    }
    currentDropdown.current = type
  }

  function handleSearch(txt, { action, prevInputValue }, type) {
    if (action === 'input-change') {
      if (type === 'sc' || type === 'c') {
        if (txt) setPayloadCat({ ...payloadCat, sSearch: txt, nSkip: 1 })
        else if (type !== 'sc') setPayloadCat({ ...payloadCat, sSearch: '', nSkip: 1 })
      } else if (type === 'gt' || type === 't' || type === 'p') {
        if (txt) setPayloadTag({ ...payloadTag, getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, sSearch: txt, nSkip: 1 } })
        else setPayloadTag({ ...payloadTag, getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, sSearch: '', nSkip: 1 } })
      }
      currentDropdown.current = type
    }

    if (action === 'set-value' && type === 'sc') {
      prevInputValue && setPayloadCat({ ...payloadCat, sSearch: '', nSkip: 1 })
    }

    if (action === 'menu-close' && type === 'sc') {
      prevInputValue && setPayloadCat({ ...payloadCat, sSearch: '', nSkip: 1 })
    }

    if (type !== 'sc') {
      if (action === 'input-change') {
        return txt
      } else if (action === 'menu-close' && prevInputValue) {
        if (type === 'c') setPayloadCat({ ...payloadCat, sSearch: '', nSkip: 1 })
        else if (type === 'gt' || type === 't' || type === 'p') {
          setPayloadTag({ ...payloadTag, getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, sSearch: '', nSkip: 1 } })
        }
        setIsMenuOpen({ ...delete isMenuOpen[type], ...isMenuOpen })
        return ''
      } else if (action === 'set-value') {
        if (type === 'c') setPayloadCat({ ...payloadCat, sSearch: '', nSkip: 1 })
        else if (type === 'gt' || type === 't' || type === 'p') {
          setPayloadTag({ ...payloadTag, getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, sSearch: '', nSkip: 1, aType: [type] } })
        }
      }
    }
  }

  const handleChange = (value, action) => {
    const addSeries = value[value?.length - 1]
    const removeSeries = action?.removedValue
    const clearSeries = action?.removedValues
    const newSeriesList = [...seriesList]

    if (removeSeries) {
      const findIndex = newSeriesList.findIndex(a => {
        return a?._id === removeSeries?._id
      })
      findIndex !== -1 && newSeriesList.splice(findIndex, 1)
    } else if (clearSeries) {
      clearSeries.map(a => {
        const findIndex = newSeriesList.findIndex(ele => {
          return a?._id === ele?._id
        })
        findIndex !== -1 && newSeriesList.splice(findIndex, 1)
        return findIndex
      }
      )
    } else {
      newSeriesList.push(addSeries)
    }
    setSeriesList(newSeriesList)
  }

  return (
    <div>
      <form>
        <Row>
          <Col sm="12" lg="4">
            <Form.Group className="form-group">
              <Form.Label>
                <FormattedMessage id="series" />
              </Form.Label>
              <Controller
                name="aSeries"
                control={control}
                render={({ field: { onChange, value = [], ref } }) => (
                  <Select
                    ref={ref}
                    isLoading={currentDropdown.current === 'c' && loading}
                    placeholder={<FormattedMessage id="series" />}
                    value={value || values?.aSeries}
                    options={category}
                    getOptionLabel={(option) => option.sName}
                    getOptionValue={(option) => option?.iId || option._id}
                    className={`react-select ${errors.aSeries && 'error'}`}
                    classNamePrefix="select"
                    onSelectResetsInput={false}
                    onBlurResetsInput={false}
                    // isDisabled={disabled}
                    onInputChange={(e, i) => handleSearch(e, i, 'c')}
                    onMenuScrollToBottom={() => handleScroll('c')}
                    onMenuOpen={() => handleClick('c')}
                    menuIsOpen={isMenuOpen.c}
                    isMulti
                    closeMenuOnSelect={false}
                    onChange={(e, action) => {
                      onChange(e)
                      handleChange(e, action)
                    }}
                  />
                )}
              />
            </Form.Group>
          </Col>
          <Col sm="12" lg="4">
            <Form.Group className="form-group">
              <Form.Label>
                <FormattedMessage id="tags" />
              </Form.Label>
              <Controller
                name="aTags"
                control={control}
                render={({ field: { onChange, value = [], ref } }) => (
                  <Select
                    ref={ref}
                    isLoading={currentDropdown.current === 'gt' && tagLoading}
                    placeholder={<FormattedMessage id="tags" />}
                    value={value || values?.aTags}
                    options={tag}
                    getOptionLabel={(option) => option.sName}
                    getOptionValue={(option) => option?.iId || option._id}
                    className={`react-select ${errors.aTags && 'error'}`}
                    classNamePrefix="select"
                    onInputChange={(e, i) => handleSearch(e, i, 'gt')}
                    // isDisabled={disabled}
                    onMenuScrollToBottom={() => handleScroll('gt')}
                    onMenuOpen={() => handleClick('gt')}
                    menuIsOpen={isMenuOpen.gt}
                    closeMenuOnSelect={false}
                    isMulti
                    onChange={(e, action) => {
                      onChange(e)
                      handleChange(e, action)
                    }}
                  />
                )}
              />
            </Form.Group>
          </Col>
        </Row>
      </form>
      <div className="mt-4">
          <HomePageArticleDND seriesList={seriesList} setSeriesList={setSeriesList} />
      </div>
    </div>
  )
}
export default HomePageArticle
