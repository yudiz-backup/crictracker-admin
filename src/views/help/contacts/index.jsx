import React, { useContext, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useMutation, useQuery } from '@apollo/client'
import { useHistory } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl'
import { confirmAlert } from 'react-confirm-alert'

import { GET_CONTACTS_LIST, BULK_OPERATION } from 'graph-ql/help/contacts'
import CustomAlert from 'shared/components/alert'
import ContactItemRow from 'shared/components/contact-item-row'
import DataTable from 'shared/components/data-table'
import { ToastrContext } from 'shared/components/toastr'
import { setSortType, parseParams, appendParams } from 'shared/utils'
import { TOAST_TYPE } from 'shared/constants'
import Drawer from 'shared/components/drawer'
import FeedbackContactFilter from 'shared/components/feedback-contact-filter'

function Contacts({ userPermission }) {
  const history = useHistory()
  const { dispatch } = useContext(ToastrContext)
  const params = useRef(parseParams(location.search))
  const [selectedContact, setSelectedContact] = useState([])
  const [requestParams, setRequestParams] = useState(getRequestParams())
  const [contactList, setContactList] = useState([])
  const totalRecord = useRef(0)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [tabs, setTabs] = useState([
    { name: <FormattedMessage id="generalQuery" />, internalName: 'generalQuery', active: true },
    { name: <FormattedMessage id="technicalQuery" />, internalName: 'technicalQuery', active: false },
    { name: <FormattedMessage id="adQuery" />, internalName: 'adQuery', active: false },
    { name: <FormattedMessage id="contentQuery" />, internalName: 'contentQuery', active: false }
  ])
  const columns = useRef([
    { name: <FormattedMessage id="name" />, internalName: 'sName', type: 0 },
    { name: <FormattedMessage id="email" />, internalName: 'sEmail', type: 0 },
    { name: <FormattedMessage id="subject" />, internalName: 'sSubject', type: 0 }
  ])
  const labels = {
    close: useIntl().formatMessage({ id: 'close' }),
    yes: useIntl().formatMessage({ id: 'yes' }),
    no: useIntl().formatMessage({ id: 'no' }),
    confirmationTitle: useIntl().formatMessage({ id: 'confirmation' }),
    confirmationMessage: useIntl().formatMessage({ id: 'areYouSureYouWantToDeleteThisItem' })
  }
  const bulkActionDropDown = [{ label: 'Delete All', value: 'd', isAllowedTo: 'DELETE_CONTACT' }]
  const bulkActionPermission = bulkActionDropDown.map((e) => e.isAllowedTo)

  const { loading, refetch } = useQuery(GET_CONTACTS_LIST, {
    variables: { input: requestParams },
    onCompleted: (data) => {
      if (data && data?.getContacts?.aResults) {
        setSelectedContact(
          data.getContacts.aResults.map((item) => {
            return {
              _id: item._id,
              value: false
            }
          })
        )
        totalRecord.current = data.getContacts.nTotal
        setContactList(data?.getContacts?.aResults)
      }
    }
  })

  const [bulkAction, { loading: bulkLoading }] = useMutation(BULK_OPERATION, {
    onCompleted: (data) => {
      if (data && data.bulkContactDelete) {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data.bulkContactDelete.sMessage, type: TOAST_TYPE.Success, btnTxt: labels.close }
        })
        refetch()
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
      changeTab(getActiveTabName(e.search))
    })
  }, [history])

  useEffect(() => {
    params.current?.eQueryType?.length && changeTab(getActiveTabName())
  }, [])

  function getRequestParams(e) {
    const data = e ? parseParams(e) : params.current
    return {
      nSkip: Number(data.nSkip) || 1,
      nLimit: Number(data.nLimit) || 10,
      sSortBy: data.sSortBy || 'dCreated',
      nOrder: Number(data.nOrder) || -1,
      sSearch: data.sSearch || '',
      eQueryType: data.eQueryType || 'g',
      aState: ['r', 'ur']
    }
  }

  function handleDelete(id) {
    confirmAlert({
      title: labels.confirmationTitle,
      message: labels.confirmationMessage,
      customUI: CustomAlert,
      buttons: [
        {
          label: labels.yes,
          onClick: async () => {
            const { data } = await bulkAction({ variables: { input: { aId: id } } })
            if (data && data.bulkContactDelete) handleBulkResponse(id, 'd')
          }
        },
        {
          label: labels.no
        }
      ]
    })
  }
  function handleBulkResponse(aIds, eType) {
    if (eType === 'd') {
      setContactList(contactList.filter((item) => !aIds.includes(item._id)))
    }
    setSelectedContact(
      selectedContact.map((item) => {
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
        const contact = selectedContact.map((a) => ({ ...a }))
        const obj = {
          aId: contact.filter((item) => item.value && delete item.value),
          eStatus: value
        }
        if (obj.eStatus === 'd') {
          const { data } = await bulkAction({
            variables: {
              input: {
                aId: obj.aId.map((id) => {
                  return id._id
                })
              }
            }
          })
          if (data) {
            handleBulkResponse(
              contact.filter((item) => item.value === undefined && item).map((e) => e._id),
              value
            )
          }
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
      case 'filter':
        setIsFilterOpen(value)
        break
      default:
        break
    }
  }
  function handleCheckbox({ target }) {
    if (target.name === 'selectAll') {
      setSelectedContact(
        selectedContact.map((item) => {
          item.value = target.checked
          return item
        })
      )
    } else {
      if (target.checked) {
        setSelectedContact(
          selectedContact.map((item) => {
            if (item._id === target.name) item.value = true
            return item
          })
        )
      } else {
        setSelectedContact(
          selectedContact.map((item) => {
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
    if (field.internalName !== 'sSlug') {
      setRequestParams({ ...requestParams, sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
      appendParams({ sSortBy: field.internalName, nOrder: field.type === 0 ? -1 : field.type })
    }
  }
  function handleTabChange(name) {
    if (name === 'generalQuery') {
      setRequestParams({ ...requestParams, eQueryType: 'g', nSkip: 1 })
      appendParams({ eQueryType: 'g', nSkip: 1 })
    } else if (name === 'technicalQuery') {
      setRequestParams({ ...requestParams, eQueryType: 't', nSkip: 1 })
      appendParams({ eQueryType: 't', nSkip: 1 })
    } else if (name === 'adQuery') {
      setRequestParams({ ...requestParams, eQueryType: 'ad', nSkip: 1 })
      appendParams({ eQueryType: 'ad', nSkip: 1 })
    } else if (name === 'contentQuery') {
      setRequestParams({ ...requestParams, eQueryType: 'ct', nSkip: 1 })
      appendParams({ eQueryType: 'ct', nSkip: 1 })
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
  function getActiveTabName(e) {
    const data = e ? parseParams(e) : params.current
    if (data?.eQueryType?.length) {
      if (data.eQueryType.toString() === 'g') {
        return 'generalQuery'
      } else if (data.eQueryType.toString() === 't') {
        return 'technicalQuery'
      } else if (data.eQueryType.toString() === 'ad') {
        return 'adQuery'
      } else if (data.eQueryType.toString() === 'ct') {
        return 'contentQuery'
      }
    } else return 'generalQuery'
  }
  function handleFilterChange({ data }) {
    if (data.aState.length !== 0) {
      setRequestParams({ ...requestParams, nSkip: 1, aState: data.aState })
      appendParams({ nSkip: 1, aState: data.aState })
    } else {
      setRequestParams({ ...requestParams, nSkip: 1, aState: ['r', 'ur'] })
      appendParams({ nSkip: 1, aState: [] })
    }
    setIsFilterOpen(!isFilterOpen)
  }
  return (
    <>
      <DataTable
        bulkAction={bulkActionDropDown}
        columns={columns.current}
        sortEvent={handleSort}
        totalRecord={totalRecord.current}
        tabs={tabs}
        tabEvent={handleTabChange}
        isLoading={loading || bulkLoading}
        header={{
          left: {
            bulkAction: !!userPermission.filter((p) => bulkActionPermission.includes(p)).length,
            rows: true
          },
          right: {
            search: true,
            filter: true
          }
        }}
        headerEvent={(name, value) => handleHeaderEvent(name, value)}
        selectAllEvent={handleCheckbox}
        pageChangeEvent={handlePageEvent}
        selectAllValue={selectedContact}
        pagination={{ currentPage: requestParams.nSkip, pageSize: requestParams.nLimit }}
        checkbox={!!userPermission.filter((p) => bulkActionPermission.includes(p)).length}
        actionColumn
      >
        {contactList?.map((contact, index) => {
          return (
            <ContactItemRow
              key={contact._id}
              index={index}
              contact={contact}
              selectedContact={selectedContact}
              onDelete={handleDelete}
              onSelect={handleCheckbox}
              bulkPermission={bulkActionPermission}
            />
          )
        })}
        <Drawer isOpen={isFilterOpen} onClose={() => setIsFilterOpen(!isFilterOpen)} title={useIntl().formatMessage({ id: 'filterStatus' })}>
          <FeedbackContactFilter filterChange={handleFilterChange}/>
        </Drawer>
      </DataTable>
    </>
  )
}

Contacts.propTypes = {
  userPermission: PropTypes.array
}
export default Contacts
