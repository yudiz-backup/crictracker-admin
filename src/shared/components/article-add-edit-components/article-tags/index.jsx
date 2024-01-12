import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Nav, Tab } from 'react-bootstrap'
import { useQuery } from '@apollo/client'

import ArticleTab from 'shared/components/article-tab'
import Search from 'shared/components/search'
import Loading from 'shared/components/loading'
import { bottomReached } from 'shared/utils'
import { GET_TAG_LIST_ARTICLE } from 'graph-ql/article/query'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { FormattedMessage } from 'react-intl'

function ArticleTags({ register, setValue, errors, articleData, disabled }) {
  const [tagList, setTagList] = useState([])
  const [totalRecord, setTotalRecord] = useState(0)
  const [selectedTag, setSelectedTag] = useState([])
  const [isBottomReached, setIsBottomReached] = useState(false)
  const [requestParams, setRequestParams] = useState({
    aStatusFiltersInput: ['a'],
    getTagsPaginationInput: {
      nSkip: 1,
      nLimit: 5,
      sSortBy: 'dCreated',
      nOrder: -1,
      sSearch: ''
    }
  })
  const { loading } = useQuery(GET_TAG_LIST_ARTICLE, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      if (data && data.getTags) {
        isBottomReached ? setTagList([...tagList, ...data.getTags.results]) : setTagList(data.getTags.results)
        setTotalRecord(data.getTags.total)
        setIsBottomReached(false)
      }
    }
  })

  function handleChangeTab(val) {
    if (val === 'all') {
      setRequestParams({
        ...requestParams,
        getTagsPaginationInput: { ...requestParams.getTagsPaginationInput, nSkip: 1, sSortBy: 'dCreated' }
      })
    } else {
      setRequestParams({
        ...requestParams,
        getTagsPaginationInput: { ...requestParams.getTagsPaginationInput, nSkip: 1, sSortBy: 'nCount' }
      })
    }
  }

  function handleSearch(e) {
    setRequestParams({ ...requestParams, getTagsPaginationInput: { ...requestParams.getTagsPaginationInput, nSkip: 1, sSearch: e } })
  }

  function handleCheckbox({ target }) {
    if (target.checked) {
      setSelectedTag([...selectedTag, target.name])
    } else {
      setSelectedTag((data) => data.filter((item) => item !== target.name))
    }
  }

  useEffect(() => {
    setValue('aTags', selectedTag)
  }, [selectedTag])

  useEffect(() => {
    articleData && setSelectedTag(articleData.aTags)
  }, [articleData])

  useEffect(() => {
    if (isBottomReached && tagList.length < totalRecord) {
      setRequestParams({
        ...requestParams,
        getTagsPaginationInput: { ...requestParams.getTagsPaginationInput, nSkip: requestParams.getTagsPaginationInput.nSkip + 1 }
      })
    } else if (isBottomReached && !(tagList.length < totalRecord)) {
      setIsBottomReached(false)
    }
  }, [isBottomReached])

  return (
    <ArticleTab title="Tags">
      <input
        type="hidden"
        {...register('aTags', {
          required: validationErrors.required
        })}
        disabled={disabled}
      />
      <Search className="search-box only-border m-0" searchEvent={(e) => handleSearch(e)} disabled={disabled} />
      <Tab.Container defaultActiveKey="All">
        <Nav variant="tabs" className="article-tabs">
          <Nav.Item>
            <Nav.Link eventKey="All" onClick={() => handleChangeTab('all')}>
              <FormattedMessage id="all" />
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="MostUsed" onClick={() => handleChangeTab('mostUsed')}>
              <FormattedMessage id="mostUsed" />
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content className="article-content position-relative">
          <Tab.Pane eventKey="All" onScroll={(e) => setIsBottomReached(bottomReached(e))}>
            {tagList.map((item) => {
              return (
                <Form.Check
                  key={`all${item._id}`}
                  checked={selectedTag.includes(item._id)}
                  type="checkbox"
                  className="ms-0"
                  label={item.sName}
                  id={`all${item._id}`}
                  name={item._id}
                  onChange={handleCheckbox}
                  disabled={disabled}
                />
              )
            })}
            {!tagList.length && (
              <p className="text-center">
                <FormattedMessage id="noRecordFound" />
              </p>
            )}
          </Tab.Pane>
          <Tab.Pane eventKey="MostUsed" onScroll={(e) => setIsBottomReached(bottomReached(e))}>
            {tagList.map((item) => {
              return (
                <Form.Check
                  key={`ms${item._id}`}
                  checked={selectedTag.includes(item._id)}
                  type="checkbox"
                  className="ms-0"
                  label={item.sName}
                  id={`ms${item._id}`}
                  name={item._id}
                  onChange={handleCheckbox}
                  disabled={disabled}
                />
              )
            })}
            {!tagList.length && (
              <p className="text-center">
                <FormattedMessage id="noRecordFound" />
              </p>
            )}
          </Tab.Pane>
          {loading && <Loading />}
          {errors.aTags && (
            <Form.Control.Feedback className="pt-1" type="invalid">
              {errors.aTags.message}
            </Form.Control.Feedback>
          )}
        </Tab.Content>
      </Tab.Container>
    </ArticleTab>
  )
}
ArticleTags.propTypes = {
  register: PropTypes.func,
  setValue: PropTypes.func,
  errors: PropTypes.object,
  articleData: PropTypes.object,
  disabled: PropTypes.bool
}
export default ArticleTags
