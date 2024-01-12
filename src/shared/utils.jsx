/* eslint-disable no-useless-escape */
/* eslint-disable multiline-ternary */
import React from 'react'
import { Crypt } from 'hybrid-crypto-js'
import { FormattedMessage } from 'react-intl'
import { PUBLIC_KEY, DESIGNATION, ROLES, SEO_REDIRECTS_TYPE_BY_CODE, DESIGNATION_IN_JOB, S3_PREFIX, API_URL, GTPHY_API_URL, GTPHY_API_KEY } from './constants'
import moment from 'moment'

let currentUser

export const setCurrentUser = (data) => {
  currentUser = data
}

export const getCurrentUser = () => currentUser

export const encryption = (data) => {
  const crypt = new Crypt()
  const encrypted = crypt.encrypt(PUBLIC_KEY, data)
  return encrypted.toString()
}

export const convertDate = (date) => {
  const t = new Date(Number(date))
  return t.toDateString()
}

export const convertDateWithTime = (date) => {
  const t = new Date(Number(date))
  return t.toString()
}

export const convertDateInDMY = (date) => {
  const t = new Date(Number(date))
  const Day = t.getDate()
  const Month = t.getMonth() + 1
  const Year = t.getFullYear()
  return Day + '-' + Month + '-' + Year
}
export const convertDateInYear = (date) => {
  const t = new Date(Number(date))
  const Year = t.getFullYear()
  return Year
}
export const setSortType = (data, fieldName) => {
  return data.map((data) => {
    if (data.internalName === fieldName) {
      data.type = data.type === 1 ? -1 : 1
    } else {
      data.type = 0
    }
    return data
  })
}

export const sortArray = (data, fieldName, sortOrder) => {
  return data.sort((a, b) => (sortOrder === 1 ? b[fieldName].localeCompare(a[fieldName]) : a[fieldName].localeCompare(b[fieldName])))
}

export const searchFromArray = (data, searchTxt, fieldName) => {
  const searchData = []
  data.filter((item) => {
    item[fieldName].toLowerCase().toString().indexOf(searchTxt.toLowerCase()) > -1 && searchData.push(item)
    return item
  })
  return searchData
}

export const generatePassword = () => {
  const char = String.fromCharCode(65 + Math.floor(Math.random() * 26))
  const specialChar = '!%&?'
  const number = '1234567890'
  return `${char}${specialChar.substr(Math.floor(specialChar.length * Math.random()), 1)}${Math.random()
    .toString(36)
    .substr(2, 5)}${number.substr(Math.floor(number.length * Math.random()), 1)}${char.toLowerCase()}`
}

export const range = (start, end) => {
  const length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}

export const scrollTop = (value = 0) => {
  const container = document.getElementsByClassName('main-container')
  container[0].scrollTop = value
}

export const scrollBottom = (className) => {
  const container = document.getElementsByClassName(className)
  container[0].scrollTop = container[0].scrollHeight
}

export const bottomReached = ({ target }, early = 5) => {
  return target.offsetHeight + target.scrollTop + early >= target.scrollHeight
}

export const eTypeName = (para) => {
  switch (para) {
    case 'gt':
      return 'General'
    case 'l':
      return 'League'
    case 'p':
      return 'Player'
    case 's':
      return 'Series'
    case 't':
      return 'Team'
    case 'v':
      return 'Venue'
    default:
      return ''
  }
}

// For comments
export const eStatus = (para) => {
  switch (para) {
    case 'a':
      return 'Approved'
    case 'd':
      return 'Delete'
    case 'p':
      return 'Pending'
    case 'r':
      return 'Rejected'
    case 'sp':
      return 'Spam'
    case 't':
      return 'Trash'
    default:
      return ''
  }
}

// Color of Comments,article badges
export const colorBadge = (para) => {
  switch (para) {
    case 'a':
    case 'pub':
      return 'success'
    case 'p':
      return 'warning'
    case 'r':
      return 'danger'
    case 's':
      return 'warning-light'
    case 'sp':
      return 'danger-light'
    case 't':
    case 'd':
      return 'secondary'
    case 'i':
    case 'cr':
    case 'cd':
    case 'cs':
      return 'info'
    default:
      return ''
  }
}

export const getArticleState = (state) => {
  switch (state) {
    case 'd':
      return 'draft'
    case 'cr':
      return 'changesRemaining'
    case 'crs':
      return 'changesResubmitted'
    case 'cs':
      return 'changesSubmitted'
    case 'p':
      return 'pending'
    case 'pub':
      return 'published'
    case 's':
      return 'scheduled'
    case 'r':
      return 'rejected'
    case 't':
      return 'trash'
    default:
      return ''
  }
}

export const parseParams = (params = '') => {
  const urlParams = new URLSearchParams(params)
  const array = [
    'aFilters',
    'aStatusFiltersInput',
    'aStatus',
    'aCountryFilter',
    'aRoleFilter',
    'aCodeFilters',
    'eDesignationFilter',
    'aCategoryFilters',
    'aTagFilters',
    'aFilter',
    'eState',
    'aState',
    'aTeamTagFilters',
    'aVenueTagFilters',
    'aSeriesFilters',
    'aAuthorsFilters',
    'aType',
    'aPollType'
  ]
  const value = Object.fromEntries(urlParams.entries())
  Object.keys(value).forEach((key) => {
    if (array.includes(key)) {
      value[key] = value[key].split(',')
    }
  })
  return value
}

export const appendParams = (value) => {
  const params = parseParams(location.search)
  const data = { ...params, ...value }
  Object.keys(data).filter((e) => (data[e] === '' || !data[e].toString().length) && delete data[e])
  window.history.pushState({}, null, `${location.pathname}?${new URLSearchParams(data).toString()}`)
}

// Short month with Date and Time with (AM/PM)

export const formatAMPM = (date) => {
  const t = new Date(Number(date))
  const shortMonth = t.toLocaleString('default', { month: 'short' })
  const Day = t.getDate()
  const Year = t.getFullYear()
  const timeWithAMPM = t.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
  return shortMonth + ' ' + Day + ',' + Year + ' ' + timeWithAMPM
}

// Image Type check function

export const checkImageType = (e) => {
  try {
    if (e === 'image/png' || e === 'image/jpeg' || e === 'image/jpg' || e === 'image/webp') {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
  }
}
/**
 * @description Remove __typeName key from the object
 * @param obj Graph ql api object
 */
export const removeTypeName = (obj) => {
  const data = { ...obj }
  delete data.__typename
  return data
}

export function removeTypenameKey(data) {
  if (Array.isArray(data)) {
    return data.map(removeTypenameKey)
  } else if (data !== null && typeof data === 'object') {
    const newObj = {}
    Object.entries(data).forEach(([key, value]) => {
      if (key !== '__typename') {
        newObj[key] = removeTypenameKey(value)
      }
    })
    return newObj
  }
  return data
}

export const removeTypeId = (obj, type) => {
  const data = { ...obj }
  delete data.nTotalVote
  delete data?.oBgImgUrl?.__typename
  delete data?.oMediaUrl?.__typename
  delete data?.__typename
  delete data?.eType
  return data
}

export const checkTag = (data) => {
  switch (data) {
    case 'Requested':
      return 're'
    case 'Requests':
      return 'r'
    case 'activeTags':
      return 'a'
    default:
      return ''
  }
}
export const getCommentEnum = (data) => {
  switch (data) {
    case 'Reject':
      return 'r'
    case 'Approve':
      return 'a'
    case 'Move to Trash':
      return 't'
    case 'Move to Spam':
      return 'sp'
    case 'Delete':
      return 'd'
    case 'Pending':
      return 'p'
    default:
      return ''
  }
}

export const getCompleteCommentName = (data) => {
  switch (data) {
    case 'Reject':
      return 'rejected'
    case 'Approve':
      return 'approved'
    case 'Move to Trash':
      return 'trash'
    case 'Move to Spam':
      return 'spam'
    case 'Delete':
      return 'delete'
    case 'Pending':
      return 'pending'
  }
}

export const abbreviateNumber = (n) => {
  if (n < 1e3) return n
  if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + 'K'
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + 'M'
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + 'B'
  if (n >= 1e12) return +(n / 1e12).toFixed(1) + 'T'
}

export const getDesignation = (type) => {
  return DESIGNATION.find((item) => type !== item.value).label
}
export const getDesignationInJob = (type) => {
  return DESIGNATION_IN_JOB.find((item) => type === item.value)?.label
}
export const getRole = (type) => {
  return ROLES.find((item) => type === item.value).label
}

export const getSeoRedirectTypeByCode = (type) => {
  return SEO_REDIRECTS_TYPE_BY_CODE.find((item) => type === item.value)
}

export const debounce = (callBack, delay = 500) => {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      callBack(...args)
    }, delay)
  }
}

// Sep 17, 2020 12:00 PM
export const convertDateTimeAMPM = (data) => {
  const t = new Date(Number(data))
  const Day = t.getDate()
  const Month = t.toLocaleString('en-us', { month: 'short' })
  const Year = t.getFullYear()
  const timeWithAMPM = t.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
  return Month + ' ' + Day + ', ' + Year + ' ' + timeWithAMPM
}

// platformType Global Function
export const platFormType = (data) => {
  switch (data) {
    case 'de':
      return 'Dream11'
    case 'ew':
      return '11Wickets'
    default:
      return ''
  }
}

// contact us query type
export const queryType = (data) => {
  switch (data) {
    case 'g':
      return 'General Issue'
    case 't':
      return 'Technical Issue'
    default:
      return ''
  }
}

// feedback query type
export const feedbackQueryType = (data) => {
  switch (data) {
    case 's':
      return 'Site Feedback'
    case 'e':
      return 'Editorial Feedback'
    default:
      return ''
  }
}

export const getQueryVariable = (variable) => {
  const query = window.location.search.substring(1)
  const vars = query.split('&')
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=')
    if (pair[0] === variable) {
      return pair[1]
    }
  }
  return false
}

export function getFileInfo(file, mime) {
  if (typeof file === 'string') {
    const type = file.split('.').pop()
    const fileName = file.split('/').pop()
    return {
      filename: fileName,
      mime: `image/${type}`
    }
  } else {
    const pos = file.name.lastIndexOf('.')
    if (mime === 'image/jpeg') {
      const filename = `${String(file.name).substr(0, pos < 0 ? String(file.name).length : pos)}.jpg`
      return {
        filename,
        mime: 'image/jpeg'
      }
    }
    return {
      filename: file.name,
      mime: file.type
    }
  }
}

export const getGender = (gender) => {
  switch (gender) {
    case 'm':
      return 'Male'
    case 'f':
      return 'Female'
    case 'o':
      return 'Other'
    default:
      return ''
  }
}

export const getImgURL = (url) => {
  return url ? (url?.indexOf('www.crictracker.com') !== -1 ? url : S3_PREFIX + url) : ''
}

export const stripHtml = (content) => {
  if (content) {
    const str = content.toString()
    return str.replace(/(<([^>]+)>)/gi, '')
  } else return ''
}

export async function graphQlToRest(query, variables, apiName) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { input: variables }
    })
  })
  const { data } = await response.json()
  const html = JSON.parse(data[apiName]?.oData || '')
  return html
}

export const getAdvanceFeature = (id, isFantasy) => {
  const advanceFeatures = [
    // { label: <FormattedMessage id="allowCommentsOnThisArticle" />, value: 'bAllowComments', defaultChecked: !id },
    { label: <FormattedMessage id="allowCommentsOnThisArticle" />, value: 'bAllowComments', defaultChecked: !id },
    { label: <FormattedMessage id="requireAdminApprovalForComments" />, value: 'bRequireAdminApproval' },
    { label: <FormattedMessage id="ampEnable" />, value: 'bAmp', defaultChecked: !id },
    { label: <FormattedMessage id="facebookInstantEnable" />, value: 'bFBEnable', defaultChecked: !id },
    { label: <FormattedMessage id="thisArticleHasBrandedContent" />, value: 'bBrandedContent' },
    { label: <FormattedMessage id="selectAsExclusiveArticle" />, value: 'bExclusiveArticle' },
    { label: <FormattedMessage id="selectAsEditorSPick" />, value: 'bEditorsPick' }
  ]
  if (isFantasy) {
    return [
      ...advanceFeatures,
      { label: <FormattedMessage id="markAsImportant" />, value: 'bImp' },
      { label: <FormattedMessage id="showPitchReport" />, value: 'bPitchReport' },
      { label: <FormattedMessage id="showPlayerStats" />, value: 'bPlayerStats' },
      { label: <FormattedMessage id="showTeamForm" />, value: 'bTeamForm' }
    ]
  } else {
    return [
      { label: <FormattedMessage id="allowClapsOnThisArticle" />, value: 'bAllowLike', defaultChecked: !id },
      ...advanceFeatures
    ]
  }
}

/**
 * @description Removes style and class attributes from the element
 * @param string HTML For ex: '<div>Hello</div>'
 * @returns DOM HTML For ex: DocumentFragment
 */
export const removeStylesFromString = (string) => {
  const htmlNode = document.createElement('div')
  htmlNode.innerHTML = string
  htmlNode.querySelectorAll('*').forEach((node) => {
    node.removeAttribute('style')
    // node.removeAttribute('class')
  })
  return htmlNode.innerHTML
}

// Handle Drag and Drop items
export const handleDragEnd = (result, submenu, menu, setMenu) => {
  const { type, source, destination } = result
  if (!destination) return

  const sourceCategoryId = source.droppableId
  const destinationCategoryId = destination.droppableId

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
  }

  // Reordering items
  if (type === 'droppable-item') {
    // If drag and dropping within the same category
    if (sourceCategoryId === destinationCategoryId) {
      const updatedOrder = reorder(
        menu.find((category) => category._id === sourceCategoryId)?.[submenu],
        source.index,
        destination.index
      )

      const updatedCategories = menu.map((category) =>
        category._id !== sourceCategoryId ? category : { ...category, [submenu]: updatedOrder }
      )

      setMenu('category', updatedCategories)
    } else {
      const sourceOrder = menu.find(
        (category) => category._id === sourceCategoryId
      )?.[submenu]
      const destinationOrder = menu.find(
        (category) => category._id === destinationCategoryId
      )?.[submenu]

      const [removed] = sourceOrder.splice(source.index, 1)
      destinationOrder.splice(destination.index, 0, removed)

      destinationOrder[removed] = sourceOrder[removed]
      delete sourceOrder[removed]

      const updatedCategories = menu.map((category) =>
        category._id === sourceCategoryId ? { ...category, [submenu]: sourceOrder } : category._id === destinationCategoryId ? { ...category, [submenu]: destinationOrder } : category
      )
      setMenu('category', updatedCategories)
    }
  }

  // Reordering categories
  if (type === 'droppable-category') {
    const updatedCategories = reorder(
      menu,
      source.index,
      destination.index
    )

    setMenu('category', updatedCategories)
  }
}

/**
 * @description Convert string HTML to DOM HTML
 * @param str String HTML For ex: '<div>Hello</div>'
 * @returns DOM HTML For ex: DocumentFragment
 */
export const HTMLParser = (str) => {
  const parser = new DOMParser()
  return parser.parseFromString(str, 'text/html')
}

export const trimAllValues = (formData) => {
  Object.keys(formData).forEach((item) => {
    if (typeof formData[item] === 'string') {
      formData[item] = formData[item].trim()
    } else if (typeof formData[item] === 'object') {
      formData[item] = trimAllValues(formData[item])
    } else if (Array.isArray(formData[item])) {
      formData[item] = formData[item].forEach((j) => {
        trimAllValues(j)
      })
    }
  })
  return formData
}

/**
 * @description Convert date intoUTC formate
 * @param date String date
 * @returns date in UTC format
 * @developer Vrund Shah
 */
export const dateCheck = (data) => {
  if (data && isNaN(Number(data))) {
    return new Date(data)
  } else if (data) {
    return new Date(Number(data))
  } else {
    return new Date()
  }
}

/**
 * @description Compare date to current date
 * @param Date String date in any format
 * @returns Boolean true or false
 * @developer Kuldip Dobariya
 */
export const compareDateToCurrentDate = (date) => {
  return moment(date).isBefore(new Date(), 'h:mm aa')
}

/**
 * @description Check time with current time
 * @param time String date in any format
 * @returns Boolean true or false
 * @developer Kuldip Dobariya
 */
export const filterPassedTime = (time) => {
  const currentDate = new Date()
  const date = new Date(time)
  return currentDate.getTime() < date.getTime()
}
/**
 * @description Check time with current time
 * @param time String date in any format
 * @returns Boolean true or false
 * @developer Kuldip Dobariya
 */
export const filterFutureTime = (time) => {
  const currentDate = new Date()
  const date = new Date(time)
  return currentDate.getTime() > date.getTime()
}

// Add 0 value in start
export const addLeadingZeros = (value) => {
  value = String(value)
  while (value.length < 2) {
    value = '0' + value
  }
  return value
}

// current date and month convert '2022-01-24'
export const currentDateMonth = (date) => {
  const currentMonth = date ? new Date(date).getMonth() + 1 : new Date().getMonth() + 1
  const currentYear = date ? new Date(date).getFullYear() : new Date().getFullYear()
  const currentDay = date ? new Date(date).getDate() : new Date().getDate()
  return currentYear + '-' + addLeadingZeros(currentMonth) + '-' + addLeadingZeros(currentDay)
}

export function isBottomReached(id, callBack) {
  document.getElementsByTagName('body')[0].onscroll = () => {
    const ele = document.getElementById(id)
    if (ele) {
      callBack(ele.offsetTop <= window.scrollY + window.innerHeight)
    } else {
      document.getElementsByTagName('body')[0].onscroll = null
    }
  }
}

export function convertIntoKb(data) {
  const modifiedData = data / 1000
  return Math.round(modifiedData)
}

// export function getImageHeightWidth(event) {
//   var width, height
//   const img = new Image()
//   console.log(event)
//   img.src = window.URL.createObjectURL(event)
//   img.onload = () => {
//     width = img.width
//     height = img.height
//   }
//   return { width, height }
// }

/**
 * @description For Differentiate month between two Dates
 * @param DateRange (Ex - 2022-05-02 to 2022-11-01)
 * @returns Array of Month with Year
 * @developer Vrund Shah
 */
export function DiffMonthBetweenTwoDates(dMax, dMin) {
  const minDate = moment(+dMax).format('YYYY-M-D')
  const maxDate = moment(+dMin).format('YYYY-M-D')
  let startDate = moment(minDate, 'YYYY-M-DD')
  const endDate = moment(maxDate, 'YYYY-M-DD').endOf('month')

  const allMonthsInPeriod = []

  while (startDate.isBefore(endDate)) {
    allMonthsInPeriod.push(startDate.format('MMM YYYY'))
    startDate = startDate.add(1, 'month')
  }
  return allMonthsInPeriod
}

export function inverseMonth(data) {
  const mData = moment(data).format('YYYY-MM-01')
  return mData
}

/**
 * @description Wrap table responsive class on table tag
 * @param htmlString String HTML
 * @returns Modified String HTML
 * @developer Kuldip Dobariya
 */
export function wrapTable(htmlString) {
  const div = document.createElement('div')
  div.innerHTML = htmlString || ''

  const scrollTable = div.getElementsByTagName('table')
  for (let i = 0; i < scrollTable.length; i++) {
    const parentClass = scrollTable[i].parentNode?.classList
    if (![...parentClass].includes('table-responsive')) {
      const wrapper = document.createElement('div')
      wrapper.classList.add('table-responsive')
      wrapper.append(scrollTable[i].cloneNode(true))
      scrollTable[i].replaceWith(wrapper)
    }
  }
  return div.innerHTML
}

export async function getGiphyImage(category, offset, search) {
  const response = await fetch(`${GTPHY_API_URL}${category}?api_key=${GTPHY_API_KEY}&limit=20&offset=${offset}&q=${search || ''}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  const { data } = await response.json()
  return data
}

export function spreadOutText(text) {
  const firstLetters = text?.substring(0, 4) + '...'

  return firstLetters
}

export function handleContentToArray(content) {
  const data = HTMLParser(content)

  const eTypeLabels = {
    'ct-poll mceNonEditable': 'p',
    'ct-liveBlog mceNonEditable': 'la',
    'cts-ads mceNonEditable': 'a',
    'ct-twitter mceNonEditable': 'x',
    'ct-insta mceNonEditable': 'i'
  }

  const elements = data.body.children
  const dataArray = []

  for (let i = 0; i < elements.length; i++) {
    const { innerHTML, attributes, tagName } = elements[i]
    const oProps = {}

    for (let i = 0; i < attributes.length; i++) {
      const { name, nodeValue } = attributes[i]
      if (name === 'class') {
        oProps.className = nodeValue
      } else if (name === 'style') {
        const styles = covertStyleFromHtml(nodeValue)
        oProps.style = styles
      } else if (name.includes('-')) {
        const reactPropName = name.replace(/-([a-z])/g, (letter) => letter.toUpperCase())
        oProps[reactPropName] = nodeValue
      } else if (/^on[A-Z]/.test(name)) {
        const reactPropName = 'on' + name.charAt(2).toUpperCase() + name.slice(3)
        oProps[reactPropName] = nodeValue
      } else {
        oProps[name] = nodeValue
      }
    }
    const eType = eTypeLabels[oProps?.className] || 'h'

    // if (oProps?.className === 'twitter-tweet' || oProps?.className === 'instagram-media') {
    //   dataArray.push({ eType, sTagName: 'P', sContent: outerHTML, oProps })
    // } else {
    dataArray.push({ eType, sTagName: tagName, sContent: innerHTML, oProps })
    // }
  }

  return dataArray
}

// const string = 'color: red; font-size: 16px;'
// Parse the style string and convert it to an object
export function covertStyleFromHtml(styleString) {
  const convertedStyle = {}
  const stylePairs = styleString?.split(';')
  stylePairs?.forEach((pair) => {
    const [property, value] = pair?.split(':')
    const trimmedValue = value?.trim()
    if (trimmedValue) {
      const reactProperty = property?.trim()?.replace(/-./g, (s) => s?.charAt(1).toUpperCase())
      convertedStyle[reactProperty] = trimmedValue
    }
  })
  return convertedStyle
}

export const getStoryEnum = (data) => {
  switch (data) {
    case 'Move to Trash':
      return 't'
    case 'Restore To Draft':
      return 'd'
    default:
      return ''
  }
}

export function convertToEmbed(url) {
  const embedConfig = {
    autoplay: 1,
    loop: 1,
    disablekb: 1,
    controls: 0,
    mute: 1,
    rel: 0,
    fs: 0
  }
  const params = Object.entries(embedConfig).map(([key, value]) => `${key}=${value}`).join('&')

  const regEx = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/
  const id = url.match(regEx)?.[2]

  if (id) return `https://www.youtube.com/embed/${id}?${params}`
  else return null
}

/**
 * @description Convert second into human time (hh:mm:ss)
 * @param d = Duration Number of seconds
 * @returns Modified String HTML
 * @developer Kuldip Dobariya
 */
export function secondsToHms(d = 0) {
  d = Number(d)
  const h = Math.floor(d / 3600)
  const m = Math.floor(d % 3600 / 60)
  const s = Math.floor(d % 3600 % 60)

  const hDisplay = h > 0 ? (h < 10 ? '0' + h : h) + ':' : ''
  const mDisplay = m > 0 ? (m < 10 ? '0' + m : m) + ':' : '00:'
  const sDisplay = s > 0 ? (s < 10 ? '0' + s : s) : '00'
  return h > 0 ? hDisplay + mDisplay + sDisplay : mDisplay + sDisplay
}
