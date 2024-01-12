import React, { useContext, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl'
import { useMutation, useQuery } from '@apollo/client'

import DataTable from 'shared/components/data-table'
import { GET_PLAYLISTS, BULK_OPERATION, UPDATE_PLAYLIST } from 'graph-ql/settings/youtube-video'
import { appendParams, setSortType, parseParams, debounce } from 'shared/utils'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { GET_CATEGORY_LIST } from 'graph-ql/management/category'
import YouTubeVideoItemRow from 'shared/components/youtube-video-item-row'
import YouTubeVideoSync from 'shared/components/youtube-video-sync'

function YouTubeVideo({ userPermission }) {
  const history = useHistory()
  const { dispatch } = useContext(ToastrContext)
  const params = useRef(parseParams(location.search))
  const [selectedYoutubeVideo, setSelectedYoutubeVideo] = useState([])
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [videoList, setVideoList] = useState([])
  const [categoryList, setCategoryList] = useState([])
  const totalVideo = useRef(0)
  const totalCategory = useRef(0)
  const isBottomReached = useRef(false)
  const loadingPlaylist = useRef()
  const columns = useRef([
    { name: <FormattedMessage id="playlistName" />, internalName: 'sName', type: 0 },
    { name: <FormattedMessage id="categoryName" />, internalName: 'sEmail', type: 0 }
  ])
  const labels = {
    close: useIntl().formatMessage({ id: 'close' })
  }
  const bulkActionDropDown = [
    { label: 'Enabel All', value: 'a', isAllowedTo: 'UPDATE_PLAYLIST' },
    { label: 'Disable All', value: 'i', isAllowedTo: 'UPDATE_PLAYLIST' }
  ]
  const bulkActionPermission = bulkActionDropDown.map((e) => e.isAllowedTo)
  const [requestParamsCategory, setRequestParamsCategory] = useState({ nSkip: 1, nLimit: 10, sSearch: '', aType: ['as', 's'] })
  const { loading, refetch } = useQuery(GET_PLAYLISTS, {
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        oGetPlaylistsPaginationInput: requestParams
      }
    },
    onCompleted: (data) => {
      if (data && data?.getPlaylists?.aResults) {
        setSelectedYoutubeVideo(
          data.getPlaylists.aResults.map((item) => {
            return {
              _id: item._id,
              value: false
            }
          })
        )
        setVideoList(data?.getPlaylists?.aResults)
        totalVideo.current = data.getPlaylists.nTotal
      }
    }
  })
  const { loading: loadingCategory } = useQuery(GET_CATEGORY_LIST, {
    variables: { input: requestParamsCategory },
    onCompleted: (data) => {
      if (data?.getCategory?.aResults) {
        const categoryData = data.getCategory.aResults.filter((item) => item.eStatus === 'a')
        if (isBottomReached.current) {
          setCategoryList([...categoryList, ...categoryData])
        } else {
          setCategoryList(categoryData)
        }
        totalCategory.current = data.getCategory.nTotal
        isBottomReached.current = false
      }
    }
  })
  const [bulkAction, { loading: bulkLoading }] = useMutation(BULK_OPERATION, {
    onCompleted: (data) => {
      if (data && data.bulkPlaylistUpdate) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkPlaylistUpdate.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })
  const [updatePlaylist, { loading: updateLoading }] = useMutation(UPDATE_PLAYLIST, {
    onCompleted: (data) => {
      if (data && data.updatePlaylist) {
        dispatch({ type: 'SHOW_TOAST', payload: { message: data.updatePlaylist.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close } })
      }
    }
  })
  useEffect(() => {
    const data = setSortType(columns.current, requestParams.sSortBy)
    columns.current = data
  }, [requestParams])

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      setRequestParams(getRequestParams(e.search))
    })
  }, [history])

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || ''
    }
  }

  function handleBulkResponse(aIds, eType) {
    if (['a', 'i'].includes(eType)) {
      setVideoList(
        videoList.map((item) => {
          if (aIds.includes(item._id)) return { ...item, eStatus: eType }
          return item
        })
      )
    }

    setSelectedYoutubeVideo(
      selectedYoutubeVideo.map((item) => {
        return {
          ...item,
          value: false
        }
      })
    )
  }
  async function handleHeaderEvent(name, value) {
    switch (name) {
      case 'bulkAction': {
        const video = selectedYoutubeVideo.map((a) => ({ ...a }))
        const obj = {
          bulkIds: video.filter((item) => item.value && delete item.value),
          eStatus: value
        }
        const { data } = await bulkAction({
          variables: {
            input: {
              aId: obj.bulkIds.map((id) => {
                return id._id
              }),
              eStatus: obj.eStatus
            }
          }
        })
        if (data) {
          handleBulkResponse(
            video.filter((item) => item.value === undefined && item).map((e) => e._id),
            value
          )
        }
        break
      }
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
  function handleCheckbox({ target }) {
    if (target.name === 'selectAll') {
      setSelectedYoutubeVideo(
        selectedYoutubeVideo.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else {
      if (target.checked) {
        setSelectedYoutubeVideo(
          selectedYoutubeVideo.map((item) => {
            if (item._id === target.name) item.value = true
            return item
          })
        )
      } else {
        setSelectedYoutubeVideo(
          selectedYoutubeVideo.map((item) => {
            if (item._id === target.name) item.value = false
            return item
          })
        )
      }
    }
  }
  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }
  function handleSort(field) {
    setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
    appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
  }
  const handleSearch = debounce((value, action, type) => {
    if (action.action !== 'input-blur') {
      if (type === 'category') {
        setRequestParamsCategory({ ...requestParamsCategory, sSearch: value, nSkip: 1 })
      }
    }
  })
  function handleScrollCategory() {
    if (totalCategory.current > requestParamsCategory.nSkip * 10) {
      setRequestParamsCategory({ ...requestParamsCategory, nSkip: requestParamsCategory.nSkip + 1 })
      isBottomReached.current = true
    }
  }

  async function handleStatusChange({ target }) {
    const { data } = await updatePlaylist({ variables: { input: { _id: target.name, eStatus: target.checked ? 'a' : 'i' } } })
    if (data) handleBulkResponse([target.name], target.checked ? 'i' : 'a')
  }
  async function onChangeCategory(e, id) {
    const { data } = await updatePlaylist({ variables: { input: { _id: id, iCategoryId: e ? e._id : null } } })
    if (data && data.updatePlaylist) {
      setVideoList(
        videoList.map((item) => {
          if (id.includes(item._id)) return { ...item, oCategory: e }
          return item
        })
      )
    }
  }
  function handleMenu(id) {
    loadingPlaylist.current = id
  }
  return (
    <>
      <DataTable
        bulkAction={bulkActionDropDown}
        columns={columns.current}
        sortEvent={handleSort}
        totalRecord={totalVideo.current}
        isLoading={loading || updateLoading || bulkLoading}
        header={{
          left: {
            bulkAction: !!userPermission.filter((p) => bulkActionPermission.includes(p)).length,
            rows: true
          },
          right: {
            search: true,
            component: true
          }
        }}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        selectAllEvent={handleCheckbox}
        pageChangeEvent={handlePageEvent}
        selectAllValue={selectedYoutubeVideo}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
        actionColumn
        component={<YouTubeVideoSync refetch={refetch} />}
      >
        {videoList?.map((video, index) => {
          return (
            <YouTubeVideoItemRow
              key={video._id}
              index={index}
              youtubeVideo={video}
              selectedYoutubeVideo={selectedYoutubeVideo}
              onStatusChange={handleStatusChange}
              onSelect={handleCheckbox}
              bulkPermission={bulkActionPermission}
              handleScrollCategory={handleScrollCategory}
              handleSearch={handleSearch}
              categoryList={categoryList}
              isCategoryLoading={loadingPlaylist.current === video._id && loadingCategory}
              onChangeCategory={onChangeCategory}
              handleMenu={handleMenu}
            />
          )
        })}
      </DataTable>
    </>
  )
}
YouTubeVideo.propTypes = {
  userPermission: PropTypes.array
}
export default YouTubeVideo
