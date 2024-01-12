import React, { useContext, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { Accordion, Row } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'

import { LIST_WEB_STORY } from 'graph-ql/web-story/query'
import { UPDATE_STORY_STATUS } from 'graph-ql/web-story/mutation'
import { appendParams, getStoryEnum, parseParams } from 'shared/utils'
import { ToastrContext } from 'shared/components/toastr'
import { FETCH_STORY_URL, TOAST_TYPE } from 'shared/constants'
import DataTable from 'shared/components/data-table'
import TopBar from 'shared/components/top-bar'
import ListWebStory from 'shared/components/web-story/listWebStory'

function WebStories() {
  const { dispatch } = useContext(ToastrContext)
  const [webStoryList, setWebStoryList] = useState([])
  const params = useRef(parseParams(location.search))
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [totalRecord, setTotalRecord] = useState(0)
  const [tabs, setTabs] = useState([
    { name: `${useIntl().formatMessage({ id: 'all' })}`, internalName: 'all', active: true },
    { name: `${useIntl().formatMessage({ id: 'published' })}`, internalName: 'published', active: false },
    { name: `${useIntl().formatMessage({ id: 'draft' })}`, internalName: 'draft', active: false },
    { name: `${useIntl().formatMessage({ id: 'trash' })}`, internalName: 'trash', active: false }
  ])

  const { loading, refetch } = useQuery(LIST_WEB_STORY, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      setTotalRecord(data?.listWebStory?.nTotal || 0)
      if (data && data?.listWebStory?.aWebStory) {
        setWebStoryList(data?.listWebStory?.aWebStory)
      }
    }
  })

  const [changeStatus] = useMutation(UPDATE_STORY_STATUS, {
    onCompleted: (data) => {
      if (data && data.editWebStoryStatus) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.editWebStoryStatus.sMessage, type: TOAST_TYPE.Success }
        })
        refetch()
      }
    }
  })

  const fetchStories = async () => {
    const apiUrl = FETCH_STORY_URL
    const requestOptions = {
      method: 'PUT'
    }
    try {
      const response = await fetch(apiUrl, requestOptions)
      const data = await response.json()
      if (data) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.message, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
      }
    } catch (error) {
      console.error('Error in Fetching Story:', error)
    }
  }

  useEffect(() => {
    params.current?.aState?.length && changeTab(getActiveTabName())
  }, [])

  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'fetchStoriesFromApi':
        fetchStories()
        break
      default:
        break
    }
  }

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    if (data?.aState?.length) {
      if (data.aState.toString() === 'all') {
        return 'all'
      } else if (data.aState.toString() === 'd') {
        return 'draft'
      } else if (data.aState.toString() === 'pub') {
        return 'published'
      } else if (data.aState.toString() === 't') {
        return 'trash'
      }
    }
  }

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      aState: data?.aState || ['all'],
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSearch: data.sSearch || ''
    }
  }

  function handleHeaderEvent(name, value) {
    switch (name) {
      case 'rows':
        setRequestParams({ ...requestParams, nLimit: Number(value), nSkip: 1 })
        appendParams({ nLimit: value, nSkip: 1 })
        break
      case 'search':
        setRequestParams({ ...requestParams, sSearch: value, nSkip: 1 })
        appendParams({ sSearch: value, nSkip: 1 })
        break
      default:
        break
    }
  }

  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }

  function handleTabChange(name) {
    if (name === 'all') {
      setRequestParams({ ...requestParams, aState: ['all'], nSkip: 1 })
      appendParams({ aState: 'all', nSkip: 1 })
    } else if (name === 'draft') {
      setRequestParams({ ...requestParams, aState: ['d'], nSkip: 1 })
      appendParams({ aState: 'd', nSkip: 1 })
    } else if (name === 'published') {
      setRequestParams({ ...requestParams, aState: ['pub'], nSkip: 1 })
      appendParams({ aState: 'pub', nSkip: 1 })
    } else if (name === 'trash') {
      setRequestParams({ ...requestParams, aState: ['t'], nSkip: 1 })
      appendParams({ aState: 't', nSkip: 1 })
    }
    changeTab(name)
  }

  function changeTab(name) {
    setTabs(
      tabs.map((e) => {
        return { ...e, active: e.internalName === name }
      })
    )
  }

  async function onChangeStatus(item, id) {
    await changeStatus({ variables: { input: { _id: id, eState: getStoryEnum(item) } } })
  }

  return (
    <>
      <Accordion>
        <TopBar
          buttons={[
            {
              text: useIntl().formatMessage({ id: 'fetchStoriesFromApi' }),
              icon: 'icon-refresh',
              type: 'primary',
              clickEventName: 'fetchStoriesFromApi',
              isAllowedTo: 'LIST_WEB_STORY'
            }
          ]}
          btnEvent={handleBtnEvent}
        />
        <DataTable
          className="web-story-list"
          isLoading={loading}
          header={{
            left: {
              rows: true
            },
            right: {
              search: true
            }
          }}
          totalRecord={totalRecord}
          tabs={tabs}
          tabEvent={handleTabChange}
          pageChangeEvent={handlePageEvent}
          headerEvent={(name, value) => handleHeaderEvent(name, value)}
          pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        >
          {webStoryList?.length > 0 && (
            <tr>
              <td className='px-0'>
                <Row className="g-2 ">
                  {webStoryList?.map((webStory) => {
                    return (
                      <ListWebStory
                        key={webStory._id}
                        webStory={webStory}
                        onChangeStatus={onChangeStatus}
                      />
                    )
                  })}
                </Row>
              </td>
            </tr>
          )}
        </DataTable>
      </Accordion>
    </>
  )
}

export default WebStories
