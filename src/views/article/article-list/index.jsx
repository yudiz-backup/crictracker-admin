import React, { useState, useEffect, useRef } from 'react'
import { useHistory } from 'react-router'
import { useQuery } from '@apollo/client'
import { Accordion } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import moment from 'moment'

import TopBar from 'shared/components/top-bar'
import DataTable from 'shared/components/data-table'
import { allRoutes } from 'shared/constants/AllRoutes'
import { parseParams, appendParams, setSortType } from 'shared/utils'
import ArticleItemRowAll from 'shared/components/article-item-row/article-item-row-all'
import Drawer from 'shared/components/drawer'
import ArticleFilter from 'shared/components/article-filters'
import { LIST_ARTICLE, COUNT_ARTICLES } from 'graph-ql/article/query'

function ArticleLIst() {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [articleList, setArticleList] = useState([])
  const [totalRecord, setTotalRecord] = useState(0)
  const articleCount = useRef()
  const [selectedTab, setSelectedTab] = useState('mine')
  const [columns, setColumns] = useState(getActionColumns(selectedTab))
  const [tabs, setTabs] = useState([
    { name: `${useIntl().formatMessage({ id: 'Mine' })}`, internalName: 'mine', active: true },
    { name: `${useIntl().formatMessage({ id: 'all' })}`, internalName: 'all', active: false },
    { name: `${useIntl().formatMessage({ id: 'published' })}`, internalName: 'published', active: false },
    { name: `${useIntl().formatMessage({ id: 'pending' })}`, internalName: 'pending', active: false },
    { name: `${useIntl().formatMessage({ id: 'scheduled' })}`, internalName: 'scheduled', active: false },
    { name: `${useIntl().formatMessage({ id: 'changes' })}`, internalName: 'changes', active: false },
    { name: `${useIntl().formatMessage({ id: 'draft' })}`, internalName: 'draft', active: false },
    { name: `${useIntl().formatMessage({ id: 'rejected' })}`, internalName: 'rejected', active: false },
    { name: `${useIntl().formatMessage({ id: 'trash' })}`, internalName: 'trash', active: false }
  ])

  const { loading } = useQuery(LIST_ARTICLE, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      if (data && data?.listArticle.aResults) {
        setArticleList(data?.listArticle?.aResults)
        setTotalRecord(data?.listArticle?.nTotal)
      }
    }
  })

  useQuery(COUNT_ARTICLES, {
    onCompleted: (data) => {
      if (data && data?.getArticleCounts) {
        articleCount.current = data?.getArticleCounts
        setTabs(
          tabs.map((e) => {
            if (e.internalName === 'all') {
              return { ...e, count: data?.getArticleCounts.nAll > 0 ? data?.getArticleCounts.nAll : '0' }
            } else if (e.internalName === 'pending') {
              return { ...e, count: data?.getArticleCounts.nPending > 0 ? data?.getArticleCounts.nPending : '0' }
            } else if (e.internalName === 'scheduled') {
              return { ...e, count: data?.getArticleCounts.nScheduled > 0 ? data?.getArticleCounts.nScheduled : '0' }
            } else if (e.internalName === 'changes') {
              return {
                ...e,
                count: (data?.getArticleCounts.nChangeSubmitted + data?.getArticleCounts.nChangeRequested).toString()
              }
            } else if (e.internalName === 'draft') {
              return { ...e, count: data?.getArticleCounts.nDraft > 0 ? data?.getArticleCounts.nDraft : '0' }
            } else if (e.internalName === 'published') {
              return { ...e, count: data?.getArticleCounts.nPublished > 0 ? data?.getArticleCounts.nPublished : '0' }
            } else if (e.internalName === 'rejected') {
              return { ...e, count: data?.getArticleCounts.nRejected > 0 ? data?.getArticleCounts.nRejected : '0' }
            } else if (e.internalName === 'mine') {
              return { ...e, count: data?.getArticleCounts.nMine > 0 ? data?.getArticleCounts.nMine : '0' }
            } else {
              return { ...e, count: data?.getArticleCounts.nTrash > 0 ? data?.getArticleCounts.nTrash : '0' }
            }
          })
        )
      }
    }
  })

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    const publishedDateFilter = data.aPublishDate ? data.aPublishDate.split('-') : []
    return {
      aState: data?.aState || ['mine'],
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || '',
      aPublishDate: publishedDateFilter.length ? [moment(publishedDateFilter[0]).set({ hour: 0, minute: 0 }).format(), moment(publishedDateFilter[1]).set({ hour: 23, minute: 59 }).format()] : [],
      aCategoryFilters: data.aCategoryFilters || [],
      aTagFilters: data.aTagFilters || [],
      aTeamTagFilters: data.aTeamTagFilters || [],
      aVenueTagFilters: data.aVenueTagFilters || [],
      aSeriesFilters: data.aSeriesFilters || [],
      aAuthorsFilters: data.aAuthorsFilters || []
    }
  }

  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'newArticle':
        history.push(allRoutes.addArticle)
        break
      case 'download':
        console.log('Download')
        break
      default:
        break
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
      case 'filter':
        setIsFilterOpen(value)
        break
      default:
        break
    }
  }

  function getActionColumns(name) {
    const data = params.current
    if (name === 'all') {
      const clm = [
        { name: <FormattedMessage id="title" />, internalName: 'sTitle', type: 0 },
        { name: <FormattedMessage id="categories" />, internalName: 'categories', type: 0 },
        { name: <FormattedMessage id="keyword" />, internalName: 'keyword', type: 0 }
      ]
      return clm.map((e) => {
        if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
        return e
      })
    } else {
      const clm = [
        { name: <FormattedMessage id="title" />, internalName: 'sTitle', type: 0 },
        { name: <FormattedMessage id="author" />, internalName: 'author', type: 0 },
        { name: <FormattedMessage id="categories" />, internalName: 'categories', type: 0 },
        { name: <FormattedMessage id="keyword" />, internalName: 'keyword', type: 0 }
      ]
      return clm.map((e) => {
        if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
        return e
      })
    }
  }

  function handleTabChange(name) {
    if (name === 'all') {
      setRequestParams({ ...requestParams, aState: ['all'], nSkip: 1 })
      appendParams({ aState: 'all', nSkip: 1 })
    } else if (name === 'pending') {
      setRequestParams({ ...requestParams, aState: ['p'], nSkip: 1 })
      appendParams({ aState: 'p', nSkip: 1 })
    } else if (name === 'scheduled') {
      setRequestParams({ ...requestParams, aState: ['s'], nSkip: 1 })
      appendParams({ aState: 's', nSkip: 1 })
    } else if (name === 'changes') {
      setRequestParams({ ...requestParams, aState: ['cr', 'cs'], nSkip: 1 })
      appendParams({ aState: ['cr', 'cs'], nSkip: 1 })
    } else if (name === 'draft') {
      setRequestParams({ ...requestParams, aState: ['d'], nSkip: 1 })
      appendParams({ aState: 'd', nSkip: 1 })
    } else if (name === 'published') {
      setRequestParams({ ...requestParams, aState: ['pub'], nSkip: 1 })
      appendParams({ aState: 'pub', nSkip: 1 })
    } else if (name === 'rejected') {
      setRequestParams({ ...requestParams, aState: ['r'], nSkip: 1 })
      appendParams({ aState: 'r', nSkip: 1 })
    } else if (name === 'trash') {
      setRequestParams({ ...requestParams, aState: ['t'], nSkip: 1 })
      appendParams({ aState: 't', nSkip: 1 })
    } else if (name === 'mine') {
      setRequestParams({ ...requestParams, aState: ['mine'], nSkip: 1 })
      appendParams({ aState: 'mine', nSkip: 1 })
    }
    changeTab(name)
  }

  function changeTab(name) {
    setSelectedTab(name)
    setColumns(getActionColumns(name))
    setTabs(
      tabs.map((e) => {
        return { ...e, active: e.internalName === name }
      })
    )
  }

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    if (data?.aState?.length) {
      if (data.aState.toString() === 'all') {
        return 'all'
      } else if (data.aState.toString() === 'p') {
        return 'pending'
      } else if (data.aState.toString() === 's') {
        return 'scheduled'
      } else if (data.aState.toString() === 'd') {
        return 'draft'
      } else if (data.aState.toString() === 'cr,cs') {
        return 'changes'
      } else if (data.aState.toString() === 'pub') {
        return 'published'
      } else if (data.aState.toString() === 'r') {
        return 'rejected'
      } else if (data.aState.toString() === 't') {
        return 'trash'
      } else if (data.aState.toString() === 'mine') {
        return 'mine'
      }
    }
  }

  function handleSort(field) {
    if (field.internalName === 'sTitle') {
      setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      const data = setSortType(columns, field.internalName)
      setColumns(data)
    }
  }

  function handleFilterChange(e) {
    let startDate, endDate
    if (e.data.aPublishDate) {
      const publishDate = e?.data?.aPublishDate?.split('-')
      // startDate = new Date(publishDate[0])
      startDate = moment(publishDate[0]).set({ hour: 0, minute: 0 }).format()
      // endDate = new Date(publishDate[1])
      endDate = moment(publishDate[1]).set({ hour: 23, minute: 59 }).format()
    }
    setRequestParams({
      ...requestParams,
      nSkip: 1,
      aTagFilters: e.data.aTagFilters,
      aCategoryFilters: e.data.aCategoryFilters,
      aPublishDate: e.data.aPublishDate ? [startDate, endDate] : [],
      aTeamTagFilters: e.data.aTeamTagFilters,
      aVenueTagFilters: e.data.aVenueTagFilters,
      aSeriesFilters: e.data.aSeriesFilters,
      aAuthorsFilters: e.data.aAuthorsFilters
    })
    appendParams({
      nSkip: 1,
      aTagFilters: e.data.aTagFilters,
      aCategoryFilters: e.data.aCategoryFilters,
      aPublishDate: e.data.aPublishDate,
      aTeamTagFilters: e.data.aTeamTagFilters,
      aVenueTagFilters: e.data.aVenueTagFilters,
      aSeriesFilters: e.data.aSeriesFilters,
      aAuthorsFilters: e.data.aAuthorsFilters
    })
    setIsFilterOpen(!isFilterOpen)
  }

  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }

  function handleStatusChange(id, changedData) {
    // articleList.map((a) => {
    //   if (a._id === id) {
    //     return {
    //       ...a,
    //       ...changedData
    //     }
    //   } else return a
    // })
    setArticleList(articleList.filter((a) => a._id !== id))
  }

  useEffect(() => {
    params.current?.aState?.length && changeTab(getActiveTabName())
  }, [])

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      setRequestParams(getRequestParams(e.search))
      changeTab(getActiveTabName(e.search))
    })
  }, [history])

  return (
    <>
      <TopBar
        buttons={[
          {
            text: useIntl().formatMessage({ id: 'newArticle' }),
            icon: 'icon-add',
            type: 'primary',
            clickEventName: 'newArticle',
            isAllowedTo: 'CREATE_ARTICLE'
          },
          {
            text: useIntl().formatMessage({ id: 'download' }),
            icon: 'icon-download',
            type: 'outline-secondary',
            clickEventName: 'download',
            isAllowedTo: 'CREATE_ARTICLE'
          }
        ]}
        btnEvent={handleBtnEvent}
      />
      <Accordion>
        <DataTable
          className="article-list"
          columns={columns}
          sortEvent={handleSort}
          totalRecord={totalRecord}
          isLoading={loading}
          header={{
            left: {
              rows: true
            },
            right: {
              search: true,
              filter: true
            }
          }}
          headerEvent={(name, value) => handleHeaderEvent(name, value)}
          pageChangeEvent={handlePageEvent}
          pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
          tabs={tabs}
          tabEvent={handleTabChange}
        >
          {articleList?.map((article, index) => {
            return (
              <ArticleItemRowAll key={article._id} activeTab={selectedTab} index={index} article={article} onChange={handleStatusChange} />
            )
          })}
        </DataTable>
      </Accordion>
      <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(!isFilterOpen)} title={useIntl().formatMessage({ id: 'filter' })}>
        <ArticleFilter filterChange={handleFilterChange} defaultValue={requestParams} />
      </Drawer>
    </>
  )
}
export default ArticleLIst
