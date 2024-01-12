import { useLazyQuery, useQuery } from '@apollo/client'
import React, { useEffect, useRef, useState } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { FormattedMessage } from 'react-intl'
import Select from 'react-select'
import CategoryDND from './category-drag-drop'
import { GET_MINISCORECARD_CATEGORY_PRIORITY } from 'graph-ql/mini-scorecard/query'
import { GET_CATEGORY_LIST_ARTICLE } from 'graph-ql/article/query'

function MiniscoreCardCategory() {
  const [category, setCategory] = useState([])
  const [seriesList, setSeriesList] = useState()

  const isBottomReached = useRef(false)
  const [payloadCat, setPayloadCat] = useState({
    eStatus: 'a',
    aType: ['as'],
    nSkip: 1,
    nLimit: 10,
    sSortBy: 'dCreated',
    nOrder: -1,
    sSearch: ''
  })
  const totalRecords = useRef(0)

  const {
    control,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      aCategory: []
    }
  })

  useQuery(GET_MINISCORECARD_CATEGORY_PRIORITY, {
    onCompleted: (data) => {
      setValue('aCategory', data.getMiniScoreCardPriority)
      setSeriesList(data.getMiniScoreCardPriority)
    }
  })

  function handleSearch(txt, { action, prevInputValue }, type) {
    if (action === 'input-change') {
      if (txt) setPayloadCat({ ...payloadCat, sSearch: txt, nSkip: 1 })
      else setPayloadCat({ ...payloadCat, sSearch: '', nSkip: 1 })
      return txt
    }

    if (action === 'menu-close' && prevInputValue) {
      setPayloadCat({ ...payloadCat, sSearch: '', nSkip: 1 })
      return ''
    } else if (action === 'set-value') {
      setPayloadCat({ ...payloadCat, sSearch: '', nSkip: 1 })
    }
  }

  const handleChange = (value, action) => {
    const addSeries = value[value?.length - 1]
    const removeSeries = action?.removedValue
    const clearSeries = action?.removedValues
    let newSeriesList = [...seriesList]
    if (removeSeries) {
      newSeriesList = newSeriesList?.filter((s) => s?.iSeriesId !== removeSeries?.iSeriesId)
    } else if (clearSeries) {
      newSeriesList = []
    } else {
      newSeriesList.push(addSeries)
    }
    setSeriesList(newSeriesList)
  }

  const [getCategory, { loading }] = useLazyQuery(GET_CATEGORY_LIST_ARTICLE, {
    variables: { input: payloadCat },
    onCompleted: (data) => {
      if (data && data.getCategory.aResults) {
        const categories = data.getCategory.aResults.map(cat => ({
          sSrtTitle: cat?.oSeries?.sSrtTitle,
          sTitle: cat?.sName,
          iSeriesId: cat?.oSeries?._id,
          sSeriesTitle: cat?.oSeries?.sTitle,
          _id: cat?._id
        }))
        isBottomReached.current ? setCategory([...category, ...categories]) : setCategory(categories)
        totalRecords.current = data.getCategory.nTotal
      }
      isBottomReached.current = false
    }
  })

  useEffect(() => {
    getCategory()
  }, [payloadCat])

  function handleScroll() {
    if (category.length < totalRecords.current) {
      setPayloadCat({ ...payloadCat, nSkip: category.length / 10 + 1 })
      isBottomReached.current = true
    }
  }

  return (
    <div>
      <form>
        <Row>
          <Col sm="12" lg="8">
            <Form.Group className="form-group">
              <Form.Label>
                <FormattedMessage id="series" />
              </Form.Label>
              <Controller
                name="aCategory"
                control={control}
                render={({ field: { onChange, value = [], ref } }) => (
                  <Select
                    ref={ref}
                    isLoading={loading}
                    placeholder={<FormattedMessage id="series" />}
                    value={value}
                    options={category}
                    getOptionLabel={(option) => option?.sTitle || option?.sSrtTitle}
                    getOptionValue={(option) => option?.iSeriesId}
                    className={`react-select ${errors.aCategory && 'error'}`}
                    classNamePrefix="select"
                    onInputChange={(e, i) => handleSearch(e, i, 'c')}
                    onMenuScrollToBottom={() => handleScroll()}
                    onSelectResetsInput={false}
                    onBlurResetsInput={false}
                    // isDisabled={disabled}
                    isMulti
                    closeMenuOnSelect={false}
                    onChange={(e, action) => {
                      onChange(e)
                      handleChange(e, action)
                    }}
                  />
                )}
              />
            </Form.Group>
          </Col>
        </Row>
      </form>
      <div className="mt-4">
        <CategoryDND seriesList={seriesList} setSeriesList={setSeriesList} />
      </div>
    </div>
  )
}
export default MiniscoreCardCategory
