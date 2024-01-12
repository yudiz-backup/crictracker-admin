import React from 'react'
import PropTypes from 'prop-types'
import { Form, Row, Col } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import Select from 'react-select'
import { Controller } from 'react-hook-form'

import { validationErrors } from 'shared/constants/ValidationErrors'
import { TEAM_TYPES } from 'shared/constants'
import CommonInput from '../common-input'

function EditTeam({
  register,
  errors,
  control,
  // nameChanged,
  // data,
  // watch,
  values,
  // setValue,
  handleScrollCountry,
  optimizedSearch,
  loadingCountry,
  countryList
}) {
  // const [name, setName] = useState()

  // useEffect(() => {
  //   name && nameChanged(name)
  // }, [name])

  // function handleBlur(e) {
  //   e.target.value && setName(e.target.value)
  // }
  return (
  <>
      <Row>
        <Col sm="6">
          <CommonInput
            type="text"
            // onBlur={handleBlur}
            register={register}
            errors={errors}
            className={errors.sTitle && 'error'}
            name="sTitle"
            label="teamName"
            validation={{ maxLength: { value: 40, message: validationErrors.maxLength(40) } }}
            required
          />
        </Col>
        <Col sm="6">
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={errors.sAbbr && 'error'}
            name="sAbbr"
            label="shortName"
            validation={{ maxLength: { value: 10, message: validationErrors.maxLength(10) } }}
          />
        </Col>
        <Col sm="6">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="type" />
            </Form.Label>
            <Controller
              name="sTeamType"
              control={control}
              rules={{ required: validationErrors.required }}
              render={({ field: { onChange, value = [], ref } }) => (
                <Select
                  ref={ref}
                  value={value || values?.sTeamType}
                  options={TEAM_TYPES}
                  className={`react-select ${errors?.sTeamType && 'error'}`}
                  classNamePrefix="select"
                  isSearchable={false}
                  onChange={(e) => {
                    onChange(e)
                  }}
                />
              )}
            />
            {errors.sTeamType && <Form.Control.Feedback type="invalid">{errors.sTeamType.message}</Form.Control.Feedback>}
          </Form.Group>
        </Col>
        <Col sm="6">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="country" />
            </Form.Label>
            <Controller
              name="sCountry"
              control={control}
              rules={{ required: validationErrors.required }}
              render={({ field: { onChange, value = [], ref } }) => (
                <Select
                  ref={ref}
                  value={value || values?.sCountry}
                  options={countryList}
                  getOptionLabel={(option) => option.sTitle}
                  getOptionValue={(option) => option.sISO}
                  className={`react-select ${errors?.sCountry && 'error'}`}
                  classNamePrefix="select"
                  onInputChange={(value, action) => optimizedSearch(value, action)}
                  isSearchable={true}
                  isLoading={loadingCountry}
                  onMenuScrollToBottom={handleScrollCountry}
                  onChange={(e) => {
                    onChange(e)
                  }}
                />
              )}
            />
            {errors.sCountry && <Form.Control.Feedback type="invalid">{errors.sCountry.message}</Form.Control.Feedback>}
          </Form.Group>
        </Col>
      </Row>
      <Row></Row>
    </>
  )
}
EditTeam.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  control: PropTypes.object,
  nameChanged: PropTypes.func,
  data: PropTypes.object,
  watch: PropTypes.func,
  values: PropTypes.object,
  setValue: PropTypes.func,
  handleMenuCountry: PropTypes.func,
  handleMenuRole: PropTypes.func,
  handleScrollCountry: PropTypes.func,
  optimizedSearch: PropTypes.func,
  loadingCountry: PropTypes.bool,
  countryList: PropTypes.array
}
export default EditTeam
