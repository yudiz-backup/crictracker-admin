import React, { useState, useRef, useEffect } from 'react'
import Select from 'react-select'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import { Controller } from 'react-hook-form'
import { useLazyQuery } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'

import ArticleTab from 'shared/components/article-tab'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { GET_CATEGORY_LIST_ARTICLE, GET_TAG_LIST_ARTICLE } from 'graph-ql/article/query'
import { debounce } from 'shared/utils'
import { GET_ALL_POLL } from 'graph-ql/widgets/poll/query'
import { LIST_QUIZ } from 'graph-ql/quiz/query'
import useReactSelect from 'shared/hooks/useReactSelect'

function TagYourContent({ control, disabled, setValue, watch, values, addCategoryURL, errors, isCategoryDisabled }) {
  const [simpleCategory, setSimpleCategory] = useState([])
  const [category, setCategory] = useState([])
  const [tag, setTag] = useState([])
  const [team, setTeam] = useState([])
  const [player, setPlayer] = useState([])
  const [polls, setPolls] = useState([])
  const currentDropdown = useRef()
  const [isMenuOpen, setIsMenuOpen] = useState({})
  const isBottomReached = useRef(false)
  const totalRecords = useRef({ sc: 0, c: 0, gt: 0, t: 0, p: 0, poll: 0 })
  const singleCategory = watch('iCategoryId')
  const secondaryCategory = watch('aSecCategories')
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
      nOrder: 1,
      sSearch: ''
    }
  })
  const [payloadPoll, setPayloadPoll] = useState({
    aStatus: ['pub'],
    nLimit: 10,
    nSkip: 1,
    sSearch: ''
  })
  const {
    onApiResponce: onQuizResponce,
    handleScroll: onQuizScroll,
    handleSearch: onQuizSearch,
    // selected: quizSelected,
    // setSelected: setSelectedQuiz,
    loading: quizLoading,
    items: quiz
  } = useReactSelect({
    query: LIST_QUIZ,
    requestParams: {
      aStatus: ['pub'],
      nLimit: 10,
      nSkip: 1,
      sSearch: '',
      sSortBy: 'dCreated',
      nOrder: -1
    },
    // selectedItem: selectedPoll?.quiz,
    responceCallBack: (data) => {
      onQuizResponce(data?.listQuiz?.aQuiz)
    }
  })

  useEffect(() => {
    setValue('aSecCategories', secondaryCategory?.filter((category) => category?._id !== singleCategory?._id))
  }, [singleCategory])

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
        } else if (currentDropdown.current === 't') {
          isBottomReached.current ? setTeam([...team, ...data.getTags.aResults]) : setTeam(data.getTags.aResults)
        } else if (currentDropdown.current === 'p') {
          isBottomReached.current ? setPlayer([...player, ...data.getTags.aResults]) : setPlayer(data.getTags.aResults)
        }
        totalRecords.current[currentDropdown.current] = data.getTags.nTotal
        isBottomReached.current = false
      }
    }
  })

  const [getPoll, { loading: pollLoading }] = useLazyQuery(GET_ALL_POLL, {
    variables: { input: payloadPoll },
    onCompleted: (data) => {
      if (data && data.listPoll) {
        isBottomReached.current ? setPolls([...polls, ...data.listPoll.aPolls]) : setPolls(data.listPoll.aPolls)
        totalRecords.current[currentDropdown.current] = data.listPoll.nTotal
        isBottomReached.current = false
      }
    }
  })

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
    } else if (type === 't' && team.length < totalRecords.current.t) {
      setPayloadTag({
        ...payloadTag,
        getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, nSkip: team.length / 10 + 1, aType: ['t'] }
      })
      isBottomReached.current = true
    } else if (type === 'p' && player.length < totalRecords.current.p) {
      setPayloadTag({
        ...payloadTag,
        getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, nSkip: player.length / 10 + 1, aType: ['p'] }
      })
      isBottomReached.current = true
    } else if (type === 'poll' && polls.length < totalRecords.current.poll) {
      setPayloadPoll({
        ...payloadPoll,
        nSkip: payloadPoll.nSkip + 1
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
    } else if (type === 't' && !team.length) {
      setPayloadTag({ ...payloadTag, getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, nSkip: 1, aType: ['t'] } })
    } else if (type === 'p' && !player.length) {
      setPayloadTag({ ...payloadTag, getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, nSkip: 1, aType: ['p'] } })
    } else if (type === 'poll' && !polls.length) {
      getPoll({ variables: { input: payloadPoll } })
    }
    currentDropdown.current = type
  }

  const handleSearch = debounce((txt, { action, prevInputValue }, type) => {
    if (action === 'input-change') {
      if (type === 'sc' || type === 'c') {
        if (txt) setPayloadCat({ ...payloadCat, sSearch: txt, nSkip: 1 })
        else if (type !== 'sc') setPayloadCat({ ...payloadCat, sSearch: '', nSkip: 1 })
      } else if (type === 'gt' || type === 't' || type === 'p') {
        if (txt) setPayloadTag({ ...payloadTag, getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, sSearch: txt, nSkip: 1 } })
        else setPayloadTag({ ...payloadTag, getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, sSearch: '', nSkip: 1 } })
      } else if (type === 'poll') {
        setPayloadPoll({ ...payloadPoll, sSearch: txt, nSkip: 1 })
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
        else if (type === 'poll') setPayloadPoll({ ...payloadPoll, sSearch: '', nSkip: 1 })
        else if (type === 'gt' || type === 't' || type === 'p') {
          setPayloadTag({ ...payloadTag, getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, sSearch: '', nSkip: 1 } })
        }
        setIsMenuOpen({ ...delete isMenuOpen[type], ...isMenuOpen })
        return ''
      } else if (action === 'set-value') {
        if (type === 'c') setPayloadCat({ ...payloadCat, sSearch: '', nSkip: 1 })
        else if (type === 'poll') setPayloadPoll({ ...payloadPoll, sSearch: '', nSkip: 1 })
        else if (type === 'gt' || type === 't' || type === 'p') {
          setPayloadTag({ ...payloadTag, getTagsPaginationInput: { ...payloadTag.getTagsPaginationInput, sSearch: '', nSkip: 1, aType: [type] } })
        }
      }
    }
  })

  useEffect(() => {
    currentDropdown.current && getCategory()
  }, [payloadCat])

  useEffect(() => {
    currentDropdown.current && getTag()
  }, [payloadTag])

  useEffect(() => {
    currentDropdown.current && getPoll()
  }, [payloadPoll])

  return (
    <>
      <ArticleTab title={useIntl().formatMessage({ id: 'tagYourContent' })}>
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="selectCategory" />*
          </Form.Label>
          <Controller
            name="iCategoryId"
            rules={{ required: validationErrors.required }}
            control={control}
            render={({ field: { onChange, value = [], ref } }) => {
              return (
                <Select
                  ref={ref}
                  isLoading={currentDropdown.current === 'sc' && loading}
                  placeholder={<FormattedMessage id="categoryOnlyOne" />}
                  value={value || values?.iCategoryId}
                  options={simpleCategory}
                  getOptionLabel={(option) => option.sName}
                  getOptionValue={(option) => option._id}
                  className={`react-select ${errors?.iCategoryId && 'error'}`}
                  classNamePrefix="select"
                  onInputChange={(e, i) => handleSearch(e, i, 'sc')}
                  isSearchable
                  isDisabled={disabled || isCategoryDisabled}
                  onMenuScrollToBottom={() => handleScroll('sc')}
                  onMenuOpen={() => handleClick('sc')}
                  menuIsOpen={isMenuOpen.sc}
                  onChange={(e) => {
                    onChange(e)
                    addCategoryURL(e.oSeo.sSlug + '/')
                  }}
                />
              )
            }}
          />
          {errors.iCategoryId && (
            <Form.Control.Feedback className="pt-1" type="invalid">
              {errors.iCategoryId.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        {
          !isCategoryDisabled && (
            <Form.Group className="form-group">
              <Form.Label>
                <FormattedMessage id="secondaryCategory" />
              </Form.Label>
              <Controller
                name="aSecCategories"
                control={control}
                render={({ field: { onChange, value = [], ref } }) => {
                  return (
                    <Select
                      ref={ref}
                      isLoading={currentDropdown.current === 'sc' && loading}
                      placeholder={<FormattedMessage id="categoryMultiple" />}
                      value={value || values?.aSecCategories}
                      isMulti={true}
                      options={simpleCategory}
                      getOptionLabel={(option) => option.sName}
                      getOptionValue={(option) => option._id}
                      filterOption={(option) => option?.value !== singleCategory?._id}
                      className={`react-select ${errors?.aSecCategories && 'error'}`}
                      classNamePrefix="select"
                      onInputChange={(e, i) => handleSearch(e, i, 'sc')}
                      isSearchable
                      isDisabled={disabled || isCategoryDisabled}
                      onMenuScrollToBottom={() => handleScroll('sc')}
                      onMenuOpen={() => handleClick('sc')}
                      menuIsOpen={isMenuOpen.sc}
                      onChange={(e) => {
                        onChange(e)
                      }}
                    />
                  )
                }}
              />
              {errors.aSecCategories && (
                <Form.Control.Feedback className="pt-1" type="invalid">
                  {errors.aSecCategories.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          )
        }
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
                getOptionValue={(option) => option._id}
                className="react-select"
                classNamePrefix="select"
                onSelectResetsInput={false}
                onBlurResetsInput={false}
                isDisabled={disabled}
                onInputChange={(e, i) => handleSearch(e, i, 'c')}
                onMenuScrollToBottom={() => handleScroll('c')}
                onMenuOpen={() => handleClick('c')}
                menuIsOpen={isMenuOpen.c}
                isMulti
                closeMenuOnSelect={false}
                onChange={(e) => {
                  onChange(e)
                }}
              />
            )}
          />
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="teams" />
          </Form.Label>
          <Controller
            name="aTeam"
            control={control}
            render={({ field: { onChange, value = [], ref } }) => (
              <Select
                ref={ref}
                isLoading={currentDropdown.current === 't' && tagLoading}
                placeholder={<FormattedMessage id="teams" />}
                value={value || values?.aTeam}
                options={team}
                getOptionLabel={(option) => option.sName}
                getOptionValue={(option) => option._id}
                className="react-select"
                classNamePrefix="select"
                onInputChange={(e, i) => handleSearch(e, i, 't')}
                isDisabled={disabled}
                onMenuScrollToBottom={() => handleScroll('t')}
                onMenuOpen={() => handleClick('t')}
                menuIsOpen={isMenuOpen.t}
                isMulti
                closeMenuOnSelect={false}
                onChange={(e) => {
                  onChange(e)
                }}
              />
            )}
          />
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="players" />
          </Form.Label>
          <Controller
            name="aPlayer"
            control={control}
            render={({ field: { onChange, value = [], ref } }) => (
              <Select
                ref={ref}
                isLoading={currentDropdown.current === 'p' && tagLoading}
                placeholder={<FormattedMessage id="players" />}
                value={value || values?.aPlayer}
                options={player}
                getOptionLabel={(option) => option.sName}
                getOptionValue={(option) => option._id}
                className="react-select"
                classNamePrefix="select"
                onInputChange={(e, i) => handleSearch(e, i, 'p')}
                isDisabled={disabled}
                onMenuScrollToBottom={() => handleScroll('p')}
                onMenuOpen={() => handleClick('p')}
                menuIsOpen={isMenuOpen.p}
                isMulti
                closeMenuOnSelect={false}
                onChange={(e) => {
                  onChange(e)
                }}
              />
            )}
          />
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="generalTags" />
          </Form.Label>
          <Controller
            name="aTags"
            control={control}
            render={({ field: { onChange, value = [], ref } }) => (
              <Select
                ref={ref}
                isLoading={currentDropdown.current === 'gt' && tagLoading}
                placeholder={<FormattedMessage id="generalTags" />}
                value={value || values?.aTags}
                options={tag}
                getOptionLabel={(option) => option.sName}
                getOptionValue={(option) => option._id}
                className={`react-select ${errors.aTags && 'error'}`}
                classNamePrefix="select"
                onInputChange={(e, i) => handleSearch(e, i, 'gt')}
                isDisabled={disabled}
                onMenuScrollToBottom={() => handleScroll('gt')}
                onMenuOpen={() => handleClick('gt')}
                menuIsOpen={isMenuOpen.gt}
                closeMenuOnSelect={false}
                isMulti
                onChange={(e) => {
                  onChange(e)
                }}
              />
            )}
          />
          {errors.aTags && (
            <Form.Control.Feedback className="pt-1" type="invalid">
              {' '}
              {errors.aTags.message}{' '}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="polls" />
          </Form.Label>
          <Controller
            name="aPolls"
            control={control}
            render={({ field: { onChange, value = [], ref } }) => (
              <Select
                ref={ref}
                isLoading={currentDropdown.current === 'poll' && pollLoading}
                placeholder={<FormattedMessage id="polls" />}
                value={value || values?.aPolls}
                options={polls}
                getOptionLabel={(option) => option?.sTitle}
                getOptionValue={(option) => option._id}
                className={`react-select ${errors.aPolls && 'error'}`}
                classNamePrefix="select"
                onInputChange={(e, i) => handleSearch(e, i, 'poll')}
                isDisabled={disabled}
                onMenuScrollToBottom={() => handleScroll('poll')}
                onMenuOpen={() => handleClick('poll')}
                menuIsOpen={isMenuOpen.poll}
                closeMenuOnSelect={false}
                isMulti
                onChange={(e) => {
                  onChange(e)
                }}
              />
            )}
          />
          {errors.aPolls && (
            <Form.Control.Feedback className="pt-1" type="invalid">
              {' '}
              {errors.aPolls.message}{' '}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>
            <FormattedMessage id="quiz" />
          </Form.Label>
          <Controller
            name="aQuizId"
            control={control}
            render={({ field: { onChange, value = [], ref } }) => (
              <Select
                ref={ref}
                isLoading={quizLoading}
                placeholder={<FormattedMessage id="quiz" />}
                value={value || values?.aQuizId}
                options={quiz}
                getOptionLabel={(option) => option?.sTitle}
                getOptionValue={(option) => option._id}
                className={`react-select ${errors.aQuizId && 'error'}`}
                classNamePrefix="select"
                onInputChange={onQuizSearch}
                isDisabled={disabled}
                onMenuScrollToBottom={onQuizScroll}
                // onMenuOpen={() => handleClick('poll')}
                // menuIsOpen={isMenuOpen.poll}
                closeMenuOnSelect={false}
                isMulti
                onChange={(e) => {
                  onChange(e)
                }}
              />
            )}
          />
        </Form.Group>
      </ArticleTab>
    </>
  )
}
TagYourContent.propTypes = {
  control: PropTypes.object,
  values: PropTypes.object,
  watch: PropTypes.func,
  setValue: PropTypes.func,
  errors: PropTypes.object,
  disabled: PropTypes.bool,
  isCategoryDisabled: PropTypes.bool,
  addCategoryURL: PropTypes.func
}
export default TagYourContent
