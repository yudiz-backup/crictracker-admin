import React, { useState, useEffect, useContext, useRef } from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router'
import { useMutation, useLazyQuery, useQuery } from '@apollo/client'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import { GET_JOBS, GET_ENQUIRIES, GET_CAREER_COUNTS } from 'graph-ql/settings/job-post/query'
import { BULK_OPERATION_JOB_POST, BULK_OPERATION_ENQUIRIES } from 'graph-ql/settings/job-post/mutation'
import DataTable from 'shared/components/data-table'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { setSortType, parseParams, appendParams, getQueryVariable } from 'shared/utils'
import JobPostItemRow from 'shared/components/job-post-item-row/job-item-row'
import EnquiryItemRow from 'shared/components/job-post-item-row/enquiry-item-row'
import TopBar from 'shared/components/top-bar'
import { allRoutes } from 'shared/constants/AllRoutes'
import CustomAlert from 'shared/components/alert'
import Drawer from 'shared/components/drawer'
import JobPostFilters from 'shared/components/job-post-filters'
function JobPost({ userPermission }) {
  const history = useHistory()
  const params = useRef(parseParams(location.search))
  const { dispatch } = useContext(ToastrContext)
  const [jobList, setJobList] = useState([])
  const [enquiryList, setEnquiryList] = useState([])
  const totalRecord = useRef(0)
  const [selectedJob, setSelectedJob] = useState([])
  const [selectedEnquiry, setSelectedEnquiry] = useState([])
  const tabNameParam = getQueryVariable('tabName')
  const [selectedTab, setSelectedTab] = useState(userPermission?.includes('LIST_JOB') ? 'jobPost' : 'enquiriesReceived')
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [columns, setColumns] = useState(getActionColumns(selectedTab))
  const [tabs, setTabs] = useState([
    {
      name: <FormattedMessage id="jobPost" />,
      internalName: 'jobPost',
      active: userPermission?.includes('LIST_JOB'),
      isAllowedTo: 'LIST_JOB'
    },
    {
      name: <FormattedMessage id="enquiriesReceived" />,
      internalName: 'enquiriesReceived',
      active: !userPermission?.includes('LIST_JOB'),
      isAllowedTo: 'LIST_ENQUIRY'
    }
  ])
  const actionPermission = useRef([])
  const [bulkActionDropDown, setBulkActionDropDown] = useState(getBulkActionItem(selectedTab))
  const bulkActionPermission = useRef([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    deleteMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' }),
    approvalMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToApproveThisItem' }),
    rejectedMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToRejectThisItem' })
  }

  const { countLoading } = useQuery(GET_CAREER_COUNTS, {
    variables: { input: { eType: 'jp' } },
    onCompleted: (data) => {
      if (data && data?.getCountsCareer) {
        setTabs(
          tabs.map((e) => {
            if (e.internalName === 'jobPost') {
              return { ...e, count: data?.getCountsCareer?.nJP > 0 ? data?.getCountsCareer?.nJP : '0' }
            }
            if (e.internalName === 'enquiriesReceived') {
              return { ...e, count: data?.getCountsCareer?.nER > 0 ? data.getCountsCareer?.nER : '0' }
            } else {
              return { ...e }
            }
          })
        )
      }
    }
  })
  const [getJobs, { loading: loadingJobs }] = useLazyQuery(GET_JOBS, {
    onCompleted: (data) => {
      if (data && data?.getJobs?.aResults) {
        setSelectedJob(
          data.getJobs.aResults.map((item) => {
            return {
              _id: item._id,
              value: false
            }
          })
        )
        totalRecord.current = data.getJobs.nTotal
        setJobList(data.getJobs.aResults)
      }
    }
  })

  const [getEnquiries, { loading: loadingEnquiries }] = useLazyQuery(GET_ENQUIRIES, {
    onCompleted: (data) => {
      if (data && data?.getEnquiries?.aResults) {
        setSelectedEnquiry(
          data.getEnquiries.aResults.map((item) => {
            return {
              _id: item._id,
              value: false
            }
          })
        )
        totalRecord.current = data.getEnquiries.nTotal
        setEnquiryList(data.getEnquiries.aResults)
      }
    }
  })

  const [bulkActionJobPost, { loading: bulkLoadingJobPost }] = useMutation(BULK_OPERATION_JOB_POST, {
    onCompleted: (data) => {
      if (data && data.bulkJobUpdate) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkJobUpdate.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  const [bulkActionEnquiries, { loading: bulkLoadingEnquiry }] = useMutation(BULK_OPERATION_ENQUIRIES, {
    onCompleted: (data) => {
      if (data && data.bulkEnquiryUpdate) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkEnquiryUpdate.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
      }
    }
  })

  useEffect(() => {
    if (tabNameParam) {
      if (tabNameParam === 'jobPost') {
        getJobs({ variables: { input: requestParams } })
      } else if (tabNameParam === 'enquiriesReceived') {
        getEnquiries({ variables: { input: requestParams } })
      }
    } else {
      if (selectedTab === 'jobPost') {
        getJobs({ variables: { input: requestParams } })
      } else if (selectedTab === 'enquiriesReceived') {
        getEnquiries({ variables: { input: requestParams } })
      }
    }
  }, [selectedTab, requestParams])

  useEffect(() => {
    return history.listen((e) => {
      params.current = parseParams(e.search)
      setRequestParams(getRequestParams(e.search))
      changeTab(getActiveTabName(e.search))
    })
  }, [history])

  useEffect(() => {
    bulkActionPermission.current = bulkActionDropDown.map((e) => e.isAllowedTo)
  }, [bulkActionDropDown])

  useEffect(() => {
    params.current?.tabName && changeTab(getActiveTabName())
  }, [])
  function changeCount(action, digit, tabName) {
    setTabs(
      tabs.map((e) => {
        if (action === 'delete') {
          if (e.internalName === tabName) {
            return { ...e, count: e.count - digit }
          }
        }
        return e
      })
    )
  }
  function getActionColumns(name) {
    const data = params.current
    if (name === 'jobPost') {
      const clm = [
        { name: <FormattedMessage id="designation" />, internalName: 'eDesignation', type: 0 },
        { name: <FormattedMessage id="jobTitle" />, internalName: 'sTitle', type: 0 },
        { name: <FormattedMessage id="experience" />, internalName: 'fExperienceFrom', type: 0 },
        { name: <FormattedMessage id="salary" />, internalName: 'fSalaryFrom', type: 0 },
        { name: <FormattedMessage id="enquiries" />, internalName: 'nEnquiryCount', type: 0 }
      ]
      return clm.map((e) => {
        if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
        return e
      })
    } else if (name === 'enquiriesReceived') {
      const clm = [
        { name: <FormattedMessage id="name" />, internalName: 'sFullName', type: 0 },
        { name: <FormattedMessage id="designation" />, internalName: 'eDesignation', type: 0 },
        { name: <FormattedMessage id="jobTitle" />, internalName: 'sTitle', type: 0 },
        { name: <FormattedMessage id="email" />, internalName: 'sEmail', type: 0 },
        { name: <FormattedMessage id="contact" />, internalName: 'sContact', type: 0 }
      ]
      return clm.map((e) => {
        if (data?.sSortBy === e.internalName) return { ...e, type: data.nOrder === 1 ? -1 : 1 }
        return e
      })
    }
  }

  function handleTabChange(name) {
    if (name === 'jobPost') {
      setRequestParams({ nSkip: 1, nLimit: 10, sSearch: '', nOrder: -1, sSortBy: 'dCreated' })
      appendParams({ nSkip: 1, nLimit: 10, sSearch: '', nOrder: -1, sSortBy: 'dCreated', tabName: name })
    } else if (name === 'enquiriesReceived') {
      setRequestParams({ nSkip: 1, nLimit: 10, sSearch: '', nOrder: -1, sSortBy: 'dCreated' })
      appendParams({ nSkip: 1, nLimit: 10, sSearch: '', nOrder: -1, sSortBy: 'dCreated', tabName: name })
    }
    changeTab(name)
  }

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    const commonParams = {
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || '',
      eDesignation: data?.eDesignationFilter
    }
    if (tabNameParam === 'enquiriesReceived') {
      return {
        ...commonParams,
        aState: data?.aState
      }
    } else {
      return commonParams
    }
  }

  function changeTab(name) {
    setSelectedTab(name)
    setBulkActionDropDown(getBulkActionItem(name))
    setColumns(getActionColumns(name))
    setTabs(
      tabs.map((e) => {
        return { ...e, active: e.internalName === name }
      })
    )
  }

  function getBulkActionItem(name) {
    if (name === 'jobPost') {
      actionPermission.current = ['GET_JOB', 'EDIT_JOB', 'DELETE_JOB']
      return [
        { label: <FormattedMessage id="activeAll" />, value: 'a', isAllowedTo: 'EDIT_JOB' },
        { label: <FormattedMessage id="deactivateAll" />, value: 'i', isAllowedTo: 'EDIT_JOB' },
        { label: <FormattedMessage id="deleteAll" />, value: 'd', isAllowedTo: 'DELETE_JOB' }
      ]
    } else if (name === 'enquiriesReceived') {
      actionPermission.current = ['GET_ENQUIRY', 'EDIT_ENQUIRY']
      return [
        { label: <FormattedMessage id="readAll" />, value: 'r', isAllowedTo: 'GET_ENQUIRY' },
        { label: <FormattedMessage id="unreadAll" />, value: 'ur', isAllowedTo: 'GET_ENQUIRY' },
        { label: <FormattedMessage id="approveAll" />, value: 'ap', isAllowedTo: 'EDIT_ENQUIRY' },
        { label: <FormattedMessage id="rejectAll" />, value: 'rj', isAllowedTo: 'EDIT_ENQUIRY' },
        { label: <FormattedMessage id="deleteAll" />, value: 'd', isAllowedTo: 'EDIT_ENQUIRY' }
      ]
    }
  }

  function handleBulkResponse(aIds, eType) {
    if (selectedTab === 'jobPost') {
      if (eType === 'd') {
        setJobList(jobList.filter((item) => !aIds.includes(item._id)))
        setSelectedJob(selectedJob.filter((item) => !aIds.includes(item._id)))
      } else {
        setJobList(
          jobList.map((item) => {
            if (aIds.includes(item._id)) return { ...item, eStatus: eType }
            return item
          })
        )
      }
      setSelectedJob(
        selectedJob.map((item) => {
          return {
            ...item,
            value: false
          }
        })
      )
    } else if (selectedTab === 'enquiriesReceived') {
      if (eType === 'd') {
        setEnquiryList(enquiryList.filter((item) => !aIds.includes(item._id)))
        setSelectedEnquiry(selectedEnquiry.filter((item) => !aIds.includes(item._id)))
      } else {
        setEnquiryList(
          enquiryList.map((item) => {
            if (aIds.includes(item._id)) return { ...item, eStatus: eType }
            return item
          })
        )
      }
      setSelectedEnquiry(
        selectedEnquiry.map((item) => {
          return {
            ...item,
            value: false
          }
        })
      )
    }
  }

  function handleCheckbox({ target }) {
    if (selectedTab === 'jobPost') {
      if (target.name === 'selectAll') {
        setSelectedJob(
          selectedJob.map((item) => {
            item.value = target.checked
            return item
          })
        )
      } else {
        if (target.checked) {
          setSelectedJob(
            selectedJob.map((item) => {
              if (item._id === target.name) item.value = true
              return item
            })
          )
        } else {
          setSelectedJob(
            selectedJob.map((item) => {
              if (item._id === target.name) item.value = false
              return item
            })
          )
        }
      }
    } else if (selectedTab === 'enquiriesReceived') {
      if (target.name === 'selectAll') {
        setSelectedEnquiry(
          selectedEnquiry.map((item) => {
            item.value = target.checked
            return item
          })
        )
      } else {
        if (target.checked) {
          setSelectedEnquiry(
            selectedEnquiry.map((item) => {
              if (item._id === target.name) item.value = true
              return item
            })
          )
        } else {
          setSelectedEnquiry(
            selectedEnquiry.map((item) => {
              if (item._id === target.name) item.value = false
              return item
            })
          )
        }
      }
    }
  }

  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    if (data?.tabName) return data.tabName.toString()
    else return 'jobPost'
  }

  async function handleHeaderEvent(name, value) {
    switch (name) {
      case 'bulkAction':
        if (selectedTab === 'jobPost') {
          const job = selectedJob.map((a) => ({ ...a }))
          const obj = {
            aId: job.filter((item) => item.value && delete item.value),
            eStatus: value
          }
          const { data } = await bulkActionJobPost({
            variables: {
              input: {
                aId: obj.aId.map((id) => {
                  return id._id
                }),
                eStatus: obj.eStatus
              }
            }
          })
          if (data) {
            handleBulkResponse(
              job.filter((item) => item.value === undefined && item).map((e) => e._id),
              value
            )
            changeCount('delete', obj.aId.length, selectedTab)
          }
        } else if (selectedTab === 'enquiriesReceived') {
          const enquiry = selectedEnquiry.map((a) => ({ ...a }))
          const obj = {
            aId: enquiry.filter((item) => item.value && delete item.value),
            eStatus: value
          }
          const { data } = await bulkActionEnquiries({
            variables: {
              input: {
                aId: obj.aId.map((id) => {
                  return id._id
                }),
                eStatus: obj.eStatus
              }
            }
          })
          if (data) {
            handleBulkResponse(
              enquiry.filter((item) => item.value === undefined && item).map((e) => e._id),
              value
            )
            value === 'd' && changeCount('delete', obj.aId.length, selectedTab)
          }
        }
        break
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

  async function onIsApprove(target, type) {
    if (selectedTab === 'jobPost') {
      if (type === 'approved') {
        const { data: approveData } = await bulkActionJobPost({ variables: { input: { aId: [target], eStatus: 'a' } } })
        if (approveData && approveData.bulkSeoUpdate) handleBulkResponse([target], 'a')
      } else {
        const { data } = await bulkActionJobPost({ variables: { input: { aId: [target], eStatus: 'i' } } })
        if (data && data.bulkSeoUpdate) handleBulkResponse([target], 'i')
      }
    }
  }

  function handleSort(field) {
    setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
    appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
    const data = setSortType(columns, field.internalName)
    setColumns(data)
  }
  function handlePageEvent(page) {
    setRequestParams({ ...requestParams, nSkip: page })
    appendParams({ nSkip: page })
  }

  async function handleStatusChange({ target }) {
    if (selectedTab === 'jobPost') {
      const { data } = await bulkActionJobPost({ variables: { input: { aId: [target.name], eStatus: target.checked ? 'a' : 'i' } } })
      if (data && data.bulkJobUpdate) handleBulkResponse([target.name], target.checked ? 'i' : 'a')
    } else if (selectedTab === 'enquiriesReceived') {
      const { data } = await bulkActionEnquiries({ variables: { input: { aId: [target.name], eStatus: target.checked ? 'a' : 'i' } } })
      if (data && data.bulkEnquiryUpdate) handleBulkResponse([target.name], target.checked ? 'i' : 'a')
    }
  }

  function handleBtnEvent(eventName) {
    switch (eventName) {
      case 'newJobPost':
        history.push(allRoutes.addJobPost)
        break
      default:
        break
    }
  }

  const modalMessage = (action) => {
    if (action === 'd') {
      return labels.deleteMessage
    } else if (action === 'ap') {
      return labels.approvalMessage
    } else if (action === 'rj') {
      return labels.rejectedMessage
    } else {
      return labels.deleteMessage
    }
  }

  function handleAction(id, action) {
    confirmAlert({
      title: labels.confirmationTitle,
      message: modalMessage(action),
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            if (selectedTab === 'jobPost') {
              const { data } = await bulkActionJobPost({ variables: { input: { aId: [id], eStatus: 'd' } } })
              if (data && data.bulkJobUpdate) handleBulkResponse([id], 'd')
            } else if (selectedTab !== 'jobPost') {
              const { data } = await bulkActionEnquiries({ variables: { input: { aId: [id], eStatus: action } } })
              if (data && data.bulkEnquiryUpdate) handleBulkResponse([id], action)
            }
            action === 'd' && changeCount('delete', 1, selectedTab)
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }
  function handleFilterChange(e) {
    if (selectedTab === 'jobPost') {
      setRequestParams({ ...requestParams, nSkip: 1, eDesignation: e.data.eDesignationFilter })
      appendParams({ eDesignationFilter: e.data.eDesignationFilter, nSkip: 1 })
    } else {
      setRequestParams({ ...requestParams, nSkip: 1, eDesignation: e.data.eDesignationFilter, aState: e.data.aState })
      appendParams({ eDesignationFilter: e.data.eDesignationFilter, aState: e.data.aState, nSkip: 1 })
    }
    setIsFilterOpen(!isFilterOpen)
  }

  return (
    <>
      <TopBar
        buttons={[
          {
            text: useIntl().formatMessage({ id: 'newJobPost' }),
            icon: 'icon-add',
            type: 'primary',
            clickEventName: 'newJobPost',
            isAllowedTo: 'CREATE_JOB'
          }
        ]}
        btnEvent={handleBtnEvent}
      />
      <DataTable
        className="job-post-list"
        bulkAction={bulkActionDropDown}
        columns={columns}
        sortEvent={handleSort}
        totalRecord={totalRecord.current}
        isLoading={loadingJobs || loadingEnquiries || bulkLoadingJobPost || bulkLoadingEnquiry || countLoading}
        header={{
          left: {
            bulkAction: !!userPermission.filter((p) => bulkActionPermission.current.includes(p)).length,
            rows: true
          },
          right: {
            search: true,
            filter: true
          }
        }}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        selectAllEvent={handleCheckbox}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        selectAllValue={selectedTab === 'jobPost' ? selectedJob : selectedEnquiry}
        pageChangeEvent={handlePageEvent}
        tabs={tabs}
        tabEvent={handleTabChange}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.current.includes(p)).length}
        actionColumn={!!userPermission.filter((p) => actionPermission.current.includes(p)).length}
      >
        {selectedTab === 'jobPost' &&
          jobList.map((job, index) => {
            return (
              <JobPostItemRow
                key={job._id}
                index={index}
                job={job}
                selectedJob={selectedJob}
                selectedTab={selectedTab}
                onDelete={handleAction}
                onSelect={handleCheckbox}
                onIsApprove={onIsApprove}
                bulkPermission={bulkActionPermission.current}
                actionPermission={actionPermission.current}
                onStatusChange={handleStatusChange}
              />
            )
          })}
        {selectedTab === 'enquiriesReceived' &&
          enquiryList.map((enquiry, index) => {
            return (
              <EnquiryItemRow
                key={enquiry._id}
                index={index}
                enquiry={enquiry}
                selectedEnquiry={selectedEnquiry}
                selectedTab={selectedTab}
                onAction={handleAction}
                onSelect={handleCheckbox}
                bulkPermission={bulkActionPermission.current}
                actionPermission={actionPermission.current}
              />
            )
          })}
        <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(!isFilterOpen)} title={useIntl().formatMessage({ id: 'filterJob' })}>
          <JobPostFilters filterChange={handleFilterChange} selectedTab={selectedTab} type="player" />
        </Drawer>
      </DataTable>
    </>
  )
}
JobPost.propTypes = {
  userPermission: PropTypes.array
}
export default JobPost
