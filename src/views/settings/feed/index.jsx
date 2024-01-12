import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { GET_CATEGORY_LIST_ARTICLE } from 'graph-ql/article/query'
import { UPDATE_DAILY_HUNT_FEED } from 'graph-ql/feed/mutation'
import { GET_DAILY_HUNT_FEED } from 'graph-ql/feed/query'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Button, Form, Spinner } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import Select from 'react-select'
import ToastrContext from 'shared/components/toastr/ToastrContext'
import { TOAST_TYPE } from 'shared/constants'
import { debounce } from 'shared/utils'

function Feed() {
  const isBottomReached = useRef(false)
  const totalRecords = useRef(0)
  const [selected, setSelected] = useState()
  const [category, setCategory] = useState([])
  const { dispatch } = useContext(ToastrContext)
  const payload = useRef({
    eStatus: 'a',
    aType: ['as'],
    nSkip: 1,
    nLimit: 10,
    sSortBy: 'dCreated',
    nOrder: 1,
    sSearch: ''
  })

  useQuery(GET_DAILY_HUNT_FEED, {
    onCompleted: (data) => {
      if (data?.getFeedSeriesCategory?.oCategory) {
        setSelected(data?.getFeedSeriesCategory?.oCategory)
      }
    }
  })

  const [getCategory, { loading }] = useLazyQuery(GET_CATEGORY_LIST_ARTICLE, {
    variables: { input: payload.current },
    onCompleted: (data) => {
      if (data && data.getCategory.aResults) {
        const latest = data.getCategory.aResults
        isBottomReached.current ? setCategory([...category, ...latest]) : setCategory(latest)
        totalRecords.current = data.getCategory.nTotal
      }
      isBottomReached.current = false
    }
  })

  const [updateCategory, { loading: updateLoading }] = useMutation(UPDATE_DAILY_HUNT_FEED, {
    onCompleted: (data) => {
      if (data?.updateFeedSeriesCategory?.sMessage) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.updateFeedSeriesCategory?.sMessage, type: TOAST_TYPE.Success }
        })
      }
    }
  })

  function handleScroll() {
    if (category.length < totalRecords.current) {
      payload.current = { ...payload.current, nSkip: category.length / 10 + 1 }
      getCategory()
      isBottomReached.current = true
    }
  }

  const handleSearch = debounce((txt, { action, prevInputValue }) => {
    if (action === 'input-change') {
      if (txt) {
        payload.current = { ...payload.current, sSearch: txt, nSkip: 1 }
      } else {
        payload.current = { ...payload.current, sSearch: '', nSkip: 1 }
      }
      getCategory()
      return txt
    } else if (action === 'menu-close' && prevInputValue) {
      payload.current = { ...payload.current, sSearch: '', nSkip: 1 }
      getCategory()
    }
  })

  function handleUpdate() {
    if (selected?._id) {
      updateCategory({ variables: { input: { iCategoryId: selected?._id } } })
    }
  }

  useEffect(() => {
    getCategory()
  }, [payload])

  return (
    <div className='row'>
      <div className='col-md-4'>
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="dailyHuntLiveBlogCategory" />
          </Form.Label>
          <Select
            isLoading={loading}
            placeholder={<FormattedMessage id="select" />}
            value={selected}
            options={category}
            getOptionLabel={(option) => option?.sName || option?.sSrtTitle}
            getOptionValue={(option) => option?._id}
            className="react-select"
            classNamePrefix="select"
            onInputChange={(e, i) => handleSearch(e, i)}
            onMenuScrollToBottom={() => handleScroll()}
            isSearchable
            onChange={(e) => {
              setSelected(e)
            }}
          />
        </Form.Group>
        <Button variant="primary" className="" onClick={handleUpdate} disabled={updateLoading}>
          <FormattedMessage id="update" /> {updateLoading && <Spinner animation="border" size="sm" />}
        </Button>
      </div>
    </div>
  )
}
export default Feed
