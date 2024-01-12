import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Nav, Tab } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import Select from 'react-select'

import PopUpModal from '../pop-up-modal'
import NewAddPoll from 'views/widgets/global-poll/new-add-poll'
import useReactSelect from 'shared/hooks/useReactSelect'
import { GET_ALL_POLL } from 'graph-ql/widgets/poll/query'

export default function PollPopup({ isPollShowing, closeModal, handlePollSubmit, pollIdRef }) {
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
    // selectedItem: selectedPoll?.poll,
    responceCallBack: (data) => {
      onPollResponce(data?.listPoll?.aPolls)
    }
  })
  function handleChange(data) {
    pollIdRef.current.value = data._id
  }
  return (
    <PopUpModal title="Add Poll" size="lg" isOpen={isPollShowing} onClose={closeModal} isCentered>
      <Tab.Container defaultActiveKey="create">
        <Nav variant="tabs" className="common-tabs">
          <Nav.Item className="flex-grow-1">
            <Nav.Link eventKey="create">
              <FormattedMessage id="Create" />
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="flex-grow-1">
            <Nav.Link eventKey="attach">
              <FormattedMessage id="Attach" />
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content className="">
          <Tab.Pane eventKey="create">
            <NewAddPoll asComponent onSubmit={handlePollSubmit} />
          </Tab.Pane>
          <Tab.Pane eventKey="attach">
            <Form.Group className="form-group">
              <Form.Label htmlFor="pollId">
                <FormattedMessage id="addPollId" />
              </Form.Label>
              <Select
                ref={pollIdRef}
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
                // isMulti={isMulti}
                // closeMenuOnSelect={!isMulti}
                onChange={(p, a) => {
                  setSelectedPoll(p)
                  handleChange(p, a, 'poll')
                }}
              />
              {/* <Form.Control id='pollId' ref={pollIdRef} placeholder={useIntl().formatMessage({ id: 'pollId' })} /> */}
              <Button variant="primary" onClick={() => handlePollSubmit(pollIdRef.current, true)} className="mt-3">
                <FormattedMessage id="add" />
              </Button>
            </Form.Group>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </PopUpModal>
  )
}

PollPopup.propTypes = {
  isPollShowing: PropTypes.bool,
  closeModal: PropTypes.func,
  handlePollSubmit: PropTypes.func,
  pollIdRef: PropTypes.object
}
