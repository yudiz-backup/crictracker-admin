import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'
import { Form } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import Select from 'react-select'

import { GET_ALL_POLL } from 'graph-ql/widgets/poll/query'
import useReactSelect from 'shared/hooks/useReactSelect'
import { LIST_QUIZ } from 'graph-ql/quiz/query'

function WidgetFilter({ selectedPoll, handleChange, isMulti = true }, ref) {
  const {
    onApiResponce: onPollResponce,
    handleScroll: onPollScroll,
    handleSearch: onPollSearch,
    selected: pollSelected,
    setSelected: setSelectedPoll,
    loading: pollLoading,
    items: poll
  } = useReactSelect({
    query: GET_ALL_POLL,
    requestParams: {
      aStatus: ['s', 'pub'],
      nLimit: 10,
      nSkip: 1,
      sSearch: ''
    },
    selectedItem: selectedPoll?.poll,
    responceCallBack: (data) => {
      onPollResponce(data?.listPoll?.aPolls)
    }
  })

  const {
    onApiResponce: onQuizResponce,
    handleScroll: onQuizScroll,
    handleSearch: onQuizSearch,
    selected: quizSelected,
    setSelected: setSelectedQuiz,
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
    selectedItem: selectedPoll?.quiz,
    responceCallBack: (data) => {
      onQuizResponce(data?.listQuiz?.aQuiz)
    }
  })

  return (
    <Form.Group className="form-group mb-2">
      <div className="poll-group">
        <Select
          ref={ref}
          isLoading={pollLoading}
          placeholder={<FormattedMessage id="selectPoll" />}
          value={pollSelected}
          options={poll}
          getOptionLabel={(option) => option?.mValue?.sTitle || option?.sTitle}
          getOptionValue={(option) => option?.mValue?._id || option?._id}
          className="react-select"
          classNamePrefix="select"
          isSearchable
          onInputChange={onPollSearch}
          onMenuScrollToBottom={onPollScroll}
          // onSelectResetsInput={false}
          // isDisabled={disabled}
          isMulti={isMulti}
          closeMenuOnSelect={!isMulti}
          onChange={(p, a) => {
            setSelectedPoll(p)
            handleChange(p, a, 'poll')
          }}
        />
      </div>
      <div className="poll-group">
        <Select
          ref={ref}
          isLoading={quizLoading}
          placeholder={<FormattedMessage id="selectQuiz" />}
          value={quizSelected}
          options={quiz}
          getOptionLabel={(option) => option?.mValue?.sTitle || option?.sTitle}
          getOptionValue={(option) => option?.mValue?._id || option?._id}
          className="react-select"
          classNamePrefix="select"
          isSearchable
          onInputChange={onQuizSearch}
          onMenuScrollToBottom={onQuizScroll}
          // onSelectResetsInput={false}
          // isDisabled={disabled}
          isMulti={isMulti}
          closeMenuOnSelect={!isMulti}
          onChange={(p, a) => {
            console.log(p)
            setSelectedQuiz(p)
            handleChange(p, a, 'quiz')
          }}
        />
      </div>
    </Form.Group>
  )
}

WidgetFilter.propTypes = {
  selectedPoll: PropTypes.object,
  isMulti: PropTypes.bool,
  handleChange: PropTypes.func
}
export default forwardRef(WidgetFilter)
