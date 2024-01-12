import React, { useContext, useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'
import { Controller, useWatch } from 'react-hook-form'
import { useMutation, useQuery } from '@apollo/client'
import { useParams } from 'react-router'
import { FormattedMessage } from 'react-intl'
import { CHANGE_DISPLAY_AUTHOR } from 'graph-ql/article/mutation'
import { S3_PREFIX, TOAST_TYPE } from 'shared/constants'
import { GET_DISPLAY_AUTHOR } from 'graph-ql/article/query'
import { ToastrContext } from 'shared/components/toastr'
import { CHANGE_FANTASY_DISPLAY_AUTHOR } from 'graph-ql/fantasy-tips/mutation'
import Img from 'shared/components/image'
import { debounce } from 'shared/utils'
import { CHANGE_WEB_STORY_AUTHOR } from 'graph-ql/web-story/mutation'

function DisplayAuthor({ control, disabled, articleData, type, isMultiple, className, placeholder }) {
  const { id } = useParams()
  const { dispatch } = useContext(ToastrContext)
  const [payload, setPayload] = useState({ eType: type, nLimit: 10, nOrder: -1, nSkip: 1, sSortBy: 'dCreated', sSearch: '' })
  const [users, setUsers] = useState([])
  const total = useRef(0)
  const isBottomReached = useRef(false)
  const currentRecord = useRef(0)

  const { loading } = useQuery(GET_DISPLAY_AUTHOR, {
    variables: { input: payload },
    onCompleted: (data) => {
      if (data?.getDisplayAuthor) {
        if (isBottomReached.current) {
          currentRecord.current = users.length
          setUsers([...users, ...data.getDisplayAuthor.aResults])
        } else {
          setUsers(data.getDisplayAuthor.aResults)
        }
        total.current = data.getDisplayAuthor.nTotal
      }
    }
  })

  const [articleAuthorChange] = useMutation(CHANGE_DISPLAY_AUTHOR, {
    onCompleted: (data) => {
      if (data?.editDisplayAuthor) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editDisplayAuthor.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
      }
    }
  })

  const [fantasyArticleAuthorChange] = useMutation(CHANGE_FANTASY_DISPLAY_AUTHOR, {
    onCompleted: (data) => {
      if (data?.editFantasyDisplayAuthor) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editFantasyDisplayAuthor.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
      }
    }
  })

  const [webStoryAuthorChange] = useMutation(CHANGE_WEB_STORY_AUTHOR, {
    onCompleted: (data) => {
      if (data?.editWebStoryDisplayAuthor) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editWebStoryDisplayAuthor.sMessage, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
      }
    }
  })

  const values = useWatch({
    control,
    name: 'iAuthorDId'
  })

  useEffect(() => {
    if (isBottomReached.current) {
      isBottomReached.current = false
    }
  }, [users])

  function handleChange(e) {
    if (id && articleData) {
      if (type === 'a') {
        articleAuthorChange({ variables: { input: { iArticleId: articleData._id, iAuthorDId: e._id } } })
      } else if (type === 'ws') {
        webStoryAuthorChange({ variables: { input: { iWebStoryId: articleData._id, iAuthorDId: e._id } } })
      } else {
        fantasyArticleAuthorChange({ variables: { input: { iArticleId: articleData._id, iAuthorDId: e._id } } })
      }
    }
  }

  function handleScroll() {
    if (users.length < total.current) {
      isBottomReached.current = true
      setPayload({ ...payload, nSkip: payload.nSkip + 1 })
    }
  }

  const handleSearch = debounce((sSearch, { action }) => {
    if (action === 'input-change') {
      setPayload({ ...payload, nSkip: 1, sSearch })
    }
  })

  return (
    <Controller
      name="iAuthorDId"
      control={control}
      render={({ field: { onChange, value = [] } }) => {
        return (
        <Select
          isLoading={loading}
          value={value || values}
          isMulti={isMultiple}
          options={users}
          getOptionLabel={(option) => option.sFName}
          getOptionValue={(option) => {
            return option._id || option.id
          }}
          className={`react-select display-author on-hover arrow ${className || ''}`}
          classNamePrefix="select"
          isSearchable={true}
          isDisabled={disabled}
          placeholder={placeholder || 'Select...'}
          onMenuScrollToBottom={handleScroll}
          onInputChange={(e, i) => handleSearch(e, i)}
          menuIsOpen
          formatOptionLabel={(user) => (
            <div className="country-option">
              {user.sUrl ? <Img src={S3_PREFIX + user.sUrl} className='authorImg' alt={user.sFName} /> : <i className="icon-account-fill no-img" />}
              <span>{user.sFName}</span>
            </div>
          )}
          onChange={(e) => {
            onChange(e)
            handleChange(e)
          }}
        />
        )
      }}
    />
  )
}
DisplayAuthor.propTypes = {
  disabled: PropTypes.bool,
  isMultiple: PropTypes.bool,
  articleData: PropTypes.object,
  control: PropTypes.object,
  type: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.string
}
export default DisplayAuthor
