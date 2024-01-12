import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useLazyQuery } from '@apollo/client'
import moment from 'moment'

import { FormattedMessage } from 'react-intl'
import { GET_CATEGORY_LIST_ARTICLE, GET_TAG_LIST_ARTICLE, LIST_AUTHORS } from 'graph-ql/article/query'
import { GET_SERIES_LIST } from 'graph-ql/management/category/index'
import Select from 'react-select'
import DatePicker from 'react-datepicker'
import { debounce } from 'shared/utils'

function ArticleFilter({ filterChange, defaultValue }) {
  const { handleSubmit, reset, setValue, control } = useForm({})
  const [categoryList, setCategoryList] = useState([])
  const [tagList, setTagList] = useState([])
  const [teamTagList, setTeamTagList] = useState([])
  const [venueTagList, setVenueTagList] = useState([])
  const [seriesList, setSeriesList] = useState([])
  const [authorsList, setAuthorsList] = useState([])
  const [dateRange, setDateRange] = useState([null, null])
  const [startDate, endDate] = dateRange
  const isBottomReached = useRef(false)
  const totalRecords = useRef({ a: 0, s: 0, v: 0, t: 0, gt: 0, sc: 0 })
  const currentDropdown = useRef()
  const requestParams = useRef({
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
  const seriesRequestParams = useRef({ nSkip: 1, nLimit: 10, sSearch: '', sSortBy: 'dCreated', nOrder: -1 })
  const authorsRequestParams = useRef({ nSkip: 1, nLimit: 10 })

  const [getCategory, { loading }] = useLazyQuery(GET_CATEGORY_LIST_ARTICLE, {
    variables: { input: requestParams.current },
    onCompleted: (data) => {
      if (data && data.getCategory.aResults) {
        if (isBottomReached.current) {
          setCategoryList([...categoryList, ...data.getCategory.aResults])
        } else {
          setCategoryList(data.getCategory.aResults)
          totalRecords.current.sc = data.getCategory.nTotal
        }
      }
    }
  })

  const [getTag, { tagLoading }] = useLazyQuery(GET_TAG_LIST_ARTICLE, {
    variables: { input: payloadTag },
    onCompleted: (data) => {
      if (data && data.getTags) {
        if (currentDropdown.current === 'tt') {
          isBottomReached.current ? setTeamTagList([...teamTagList, ...data.getTags.aResults]) : setTeamTagList(data.getTags.aResults)
        } else if (currentDropdown.current === 'vt') {
          isBottomReached.current ? setVenueTagList([...venueTagList, ...data.getTags.aResults]) : setVenueTagList(data.getTags.aResults)
        } else if (currentDropdown.current === 'gt') {
          isBottomReached.current ? setTagList([...tagList, ...data.getTags.aResults]) : setTagList(data.getTags.aResults)
        }
        totalRecords.current[currentDropdown.current] = data.getTags.nTotal
        isBottomReached.current = false
      }
    }
  })

  const [getSeries, { seriesLoading }] = useLazyQuery(GET_SERIES_LIST, {
    variables: { input: seriesRequestParams.current },
    onCompleted: (data) => {
      if (data && data.listSeries) {
        if (isBottomReached.current) {
          setSeriesList([...seriesList, ...data.listSeries.aResults])
        } else {
          setSeriesList(data.listSeries.aResults)
          totalRecords.current.s = data.listSeries.nTotal
        }
      }
    }
  })

  const [getAuthors, { authorsLoading }] = useLazyQuery(LIST_AUTHORS, {
    variables: { input: authorsRequestParams.current },
    onCompleted: (data) => {
      if (data && data.listAuthors) {
        if (isBottomReached.current) {
          setAuthorsList([...authorsList, ...data.listAuthors.aResults])
        } else {
          setAuthorsList(data.listAuthors.aResults)
          totalRecords.current.a = data.listAuthors.nTotal
        }
      }
    }
  })

  function onSubmit(data) {
    data.aCategoryFilters = data.aCategoryFilters ? data.aCategoryFilters.map((item) => item._id) : []
    data.aTagFilters = data.aTagFilters ? data.aTagFilters.map((item) => item._id) : []
    data.aPublishDate = data.aPublishDate ? moment(Number(data.aPublishDate[0])).format('DD MMMM YYYY') + '-' + moment(Number(data.aPublishDate[1])).format('DD MMMM YYYY') : ''
    data.aTeamTagFilters = data.aTeamTagFilters ? data.aTeamTagFilters.map((item) => item._id) : []
    data.aVenueTagFilters = data.aVenueTagFilters ? data.aVenueTagFilters.map((item) => item._id) : []
    data.aSeriesFilters = data.aSeriesFilters ? data.aSeriesFilters.map((item) => item._id) : []
    data.aAuthorsFilters = data.aAuthorsFilters ? data.aAuthorsFilters.map((item) => item._id) : []
    filterChange({ data })
  }

  const onReset = () => {
    reset({})
    setDateRange([null, null])
  }

  useEffect(() => {
    if (categoryList) {
      const paramCategoryFilter = categoryList.filter((category) => defaultValue.aCategoryFilters.includes(category._id))
      setValue('aCategoryFilters', paramCategoryFilter)
    }
  }, [categoryList])

  useEffect(() => {
    if (tagList) {
      const paramTagFilter = tagList.filter((tag) => defaultValue.aTagFilters.includes(tag._id))
      setValue('aTagFilters', paramTagFilter)
    }
  }, [tagList])

  useEffect(() => {
    if (teamTagList) {
      const paramTeamTagFilter = teamTagList.filter((tag) => defaultValue.aTeamTagFilters.includes(tag._id))
      setValue('aTeamTagFilters', paramTeamTagFilter)
    }
  }, [teamTagList])

  useEffect(() => {
    if (venueTagList) {
      const paramVenueTagFilter = venueTagList.filter((tag) => defaultValue.aVenueTagFilters.includes(tag._id))
      setValue('aVenueTagFilters', paramVenueTagFilter)
    }
  }, [venueTagList])

  useEffect(() => {
    if (seriesList) {
      const paramSeriesFilter = seriesList.filter((series) => defaultValue.aSeriesFilters.includes(series._id))
      setValue('aSeriesFilters', paramSeriesFilter)
    }
  }, [seriesList])

  useEffect(() => {
    if (authorsList) {
      const paramAuthorFilter = authorsList.filter((author) => defaultValue.aAuthorsFilters.includes(author._id))
      setValue('aAuthorsFilters', paramAuthorFilter)
    }
  }, [authorsList])

  useEffect(() => {
    if (defaultValue.aPublishDate.length !== 0) {
      setDateRange([new Date(defaultValue.aPublishDate[0]), new Date(defaultValue.aPublishDate[1])])
    }
  }, [defaultValue.aPublishDate])

  const handleScroll = (type) => {
    if (type === 'a' && authorsList.length < totalRecords.current.a) {
      authorsRequestParams.current = { ...authorsRequestParams.current, nSkip: authorsRequestParams.current.nSkip + 1 }
      getAuthors()
      isBottomReached.current = true
    } else if (type === 's' && seriesList.length < totalRecords.current.s) {
      seriesRequestParams.current = { ...seriesRequestParams.current, nSkip: seriesRequestParams.current.nSkip + 1 }
      getSeries()
      isBottomReached.current = true
    } else if (type === 'vt' && venueTagList.length < totalRecords.current.vt) {
      setPayloadTag({
        ...payloadTag,
        getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, nSkip: venueTagList.length / 10 + 1, aType: ['v'] }
      })
      isBottomReached.current = true
    } else if (type === 'tt' && teamTagList.length < totalRecords.current.tt) {
      setPayloadTag({
        ...payloadTag,
        getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, nSkip: teamTagList.length / 10 + 1, aType: ['t'] }
      })
      isBottomReached.current = true
    } else if (type === 'gt' && tagList.length < totalRecords.current.gt) {
      setPayloadTag({
        ...payloadTag,
        getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, nSkip: tagList.length / 10 + 1, aType: ['gt'] }
      })
      isBottomReached.current = true
    } else if (type === 'sc' && categoryList.length < totalRecords.current.sc) {
      requestParams.current = { ...requestParams.current, nSkip: requestParams.current.nSkip + 1 }
      getCategory()
      isBottomReached.current = true
    }
  }

  const handleClick = (type) => {
    if (type === 'a' && !authorsList.length) {
      getAuthors()
    } else if (type === 's' && !seriesList.length) {
      getSeries()
    } else if (type === 'vt' && !venueTagList.length) {
      setPayloadTag({ ...payloadTag, getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, nSkip: 1, aType: ['v'] } })
    } else if (type === 'tt' && !teamTagList.length) {
      setPayloadTag({ ...payloadTag, getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, nSkip: 1, aType: ['t'] } })
    } else if (type === 'gt' && !tagList.length) {
      setPayloadTag({ ...payloadTag, getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, nSkip: 1, aType: ['gt'] } })
    } else if (type === 'sc' && !categoryList.length) {
      getCategory()
    }
    currentDropdown.current = type
  }

  const handleSearch = debounce((txt, { action, prevInputValue }, type) => {
    if (type === 's' && action === 'input-change') {
      if (txt) {
        seriesRequestParams.current = { ...seriesRequestParams.current, nSkip: 1, sSearch: txt }
        getSeries()
      }
    } else if (type === 'sc' && action === 'input-change') {
      if (txt) {
        requestParams.current = { ...requestParams.current, nSkip: 1, sSearch: txt }
        getCategory()
      }
    }

    if (action === 'set-value' && type === 'sc') {
      if (prevInputValue) {
        requestParams.current = { ...requestParams.current, nSkip: 1, sSearch: '' }
      }
    } else if (action === 'set-value' && type === 's') {
      if (prevInputValue) {
        seriesRequestParams.current = { ...seriesRequestParams.current, nSkip: 1, sSearch: '' }
      }
    }

    if (action === 'menu-close' && type === 'sc') {
      if (prevInputValue) {
        requestParams.current = { ...requestParams.current, nSkip: 1, sSearch: '' }
      }
    } else if (action === 'menu-close' && type === 's') {
      if (prevInputValue) {
        seriesRequestParams.current = { ...seriesRequestParams.current, nSkip: 1, sSearch: '' }
      }
    }
  })

  useEffect(() => {
    currentDropdown.current && getTag()
  }, [payloadTag])

  return (
    <Form className="user-filter" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
      <div className="top-d-button">
        <Button variant="outline-secondary" type="reset" onClick={onReset} className="square me-2" size="sm">
          <FormattedMessage id="reset" />
        </Button>
        <Button variant="success" type="submit" className="square" size="sm">
          <FormattedMessage id="apply" />
        </Button>
      </div>
      <Form.Group className="form-group">
        <Form.Label className="d-block">
          <FormattedMessage id="dateRange" />
        </Form.Label>
        <Controller
          name="aPublishDate"
          control={control}
          render={({ field: { onChange, value = [], ref } }) => (
            <DatePicker
              ref={ref}
              value={value}
              className="form-control"
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              withPortal
              onChange={(update) => {
                setDateRange(update)
                onChange(update)
              }}
              maxDate={new Date()}
            />
          )}
        />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="categories" />
        </Form.Label>
        <Controller
          name="aCategoryFilters"
          control={control}
          render={({ field: { onChange, value = [], ref } }) => (
            <Select
              ref={ref}
              value={value}
              options={categoryList}
              getOptionLabel={(option) => option.sName}
              getOptionValue={(option) => option._id}
              isMulti
              isSearchable
              className="react-select"
              classNamePrefix="select"
              closeMenuOnSelect={false}
              isLoading={loading}
              onMenuScrollToBottom={() => handleScroll('sc')}
              onMenuOpen={() => handleClick('sc')}
              onInputChange={(e, i) => handleSearch(e, i, 'sc')}
              onChange={(e) => {
                onChange(e)
              }}
            />
          )}
        />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="tags" />
        </Form.Label>
        <Controller
          name="aTagFilters"
          control={control}
          render={({ field: { onChange, value = [], ref } }) => (
            <Select
              ref={ref}
              value={value}
              options={tagList}
              getOptionLabel={(option) => option.sName}
              getOptionValue={(option) => option._id}
              isMulti
              isSearchable
              className="react-select"
              classNamePrefix="select"
              closeMenuOnSelect={false}
              isLoading={tagLoading}
              onMenuScrollToBottom={() => handleScroll('gt')}
              onMenuOpen={() => handleClick('gt')}
              onChange={(e) => {
                onChange(e)
              }}
            />
          )}
        />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="teamTag" />
        </Form.Label>
        <Controller
          name="aTeamTagFilters"
          control={control}
          render={({ field: { onChange, value = [], ref } }) => (
            <Select
              ref={ref}
              value={value}
              options={teamTagList}
              getOptionLabel={(option) => option.sName}
              getOptionValue={(option) => option._id}
              isMulti
              isSearchable
              className="react-select"
              classNamePrefix="select"
              closeMenuOnSelect={false}
              isLoading={tagLoading}
              onMenuScrollToBottom={() => handleScroll('tt')}
              onMenuOpen={() => handleClick('tt')}
              onChange={(e) => {
                onChange(e)
              }}
            />
          )}
        />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="venueTag" />
        </Form.Label>
        <Controller
          name="aVenueTagFilters"
          control={control}
          render={({ field: { onChange, value = [], ref } }) => (
            <Select
              ref={ref}
              value={value}
              options={venueTagList}
              getOptionLabel={(option) => option.sName}
              getOptionValue={(option) => option._id}
              isMulti
              isSearchable
              className="react-select"
              classNamePrefix="select"
              closeMenuOnSelect={false}
              isLoading={tagLoading}
              onMenuScrollToBottom={() => handleScroll('vt')}
              onMenuOpen={() => handleClick('vt')}
              onChange={(e) => {
                onChange(e)
              }}
            />
          )}
        />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="series" />
        </Form.Label>
        <Controller
          name="aSeriesFilters"
          control={control}
          render={({ field: { onChange, value = [], ref } }) => (
            <Select
              ref={ref}
              value={value}
              options={seriesList}
              getOptionLabel={(option) => option.sTitle}
              getOptionValue={(option) => option._id}
              isMulti
              isSearchable
              className="react-select"
              classNamePrefix="select"
              closeMenuOnSelect={false}
              isLoading={seriesLoading}
              onMenuScrollToBottom={() => handleScroll('s')}
              onMenuOpen={() => handleClick('s')}
              onInputChange={(e, i) => handleSearch(e, i, 's')}
              onChange={(e) => {
                onChange(e)
              }}
            />
          )}
        />
      </Form.Group>
      <Form.Group className="form-group">
        <Form.Label>
          <FormattedMessage id="authors" />
        </Form.Label>
        <Controller
          name="aAuthorsFilters"
          control={control}
          render={({ field: { onChange, value = [], ref } }) => (
            <Select
              ref={ref}
              value={value}
              options={authorsList}
              getOptionLabel={(option) => option.sDisplayName}
              getOptionValue={(option) => option._id}
              isMulti
              isSearchable
              className="react-select"
              classNamePrefix="select"
              closeMenuOnSelect={false}
              isLoading={authorsLoading}
              onMenuScrollToBottom={() => handleScroll('a')}
              onMenuOpen={() => handleClick('a')}
              onChange={(e) => {
                onChange(e)
              }}
            />
          )}
        />
      </Form.Group>
    </Form>
  )
}
ArticleFilter.propTypes = {
  filterChange: PropTypes.func,
  defaultValue: PropTypes.object
}
export default ArticleFilter
