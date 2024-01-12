import React from 'react'
import PropTypes from 'prop-types'
import { Form, Row, Col } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { Controller } from 'react-hook-form'
import Select from 'react-select'

import TinyEditor from 'shared/components/editor'
import { validationErrors } from 'shared/constants/ValidationErrors'
import { ROLES } from 'shared/constants'
import DatePicker from 'react-datepicker'
import CommonInput from '../common-input'

function EditPlayer({ register, errors, control, nameChanged, values, countryList, loadingCountry, handleScrollCountry, optimizedSearch }) {
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
            className={errors.sFullName && 'error'}
            name="sFullName"
            label="name"
            validation={{ maxLength: { value: 40, message: validationErrors.maxLength(40) } }}
            required
          />
        </Col>
        <Col sm="3">
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={errors.sFirstName && 'error'}
            name="sFirstName"
            label="firstName"
            validation={{ maxLength: { value: 20, message: validationErrors.maxLength(20) } }}
          />
        </Col>
        <Col sm="3">
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={errors?.sLastName && 'error'}
            name="sLastName"
            label="lastName"
            validation={{ maxLength: { value: 20, message: validationErrors.maxLength(20) } }}
          />
        </Col>
        <Col sm="3">
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={errors?.sNickName && 'error'}
            name="sNickName"
            label="nickName"
            validation={{ maxLength: { value: 20, message: validationErrors.maxLength(20) } }}
          />
        </Col>
        <Col sm="3">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="role" />*
            </Form.Label>
            <Controller
              name="sPlayingRole"
              control={control}
              render={({ field: { onChange, value = [], ref } }) => (
                <Select
                  ref={ref}
                  value={value || values?.oPlayingRole}
                  options={ROLES}
                  isSearchable
                  className="react-select"
                  classNamePrefix="select"
                  onChange={(e) => {
                    onChange(e)
                  }}
                />
              )}
            />
          </Form.Group>
        </Col>
        <Col sm="3">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="birthDate" />
            </Form.Label>
            <Controller
              name="dBirthDate"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  selected={value}
                  className="form-control"
                  dateFormat="dd-MM-yyyy"
                  onChange={onChange}
                  maxDate={new Date()}
                />
              )}
            />
            {errors.aPublishDate && (
              <Form.Control.Feedback className="pt-1" type="invalid">
                {errors.aPublishDate.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col sm="3">
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={errors?.sBirthPlace && 'error'}
            name="sBirthPlace"
            label="birthPlace"
            validation={{ maxLength: { value: 40, message: validationErrors.maxLength(40) } }}
          />
        </Col>
        <Col sm="4">
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={errors?.sBattingStyle && 'error'}
            name="sBattingStyle"
            label="battingStyle"
            validation={{ maxLength: { value: 100, message: validationErrors.maxLength(100) } }}
          />
        </Col>
        <Col sm="4">
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={errors?.sBowlingStyle && 'error'}
            name="sBowlingStyle"
            label="bowlingStyle"
            validation={{ maxLength: { value: 100, message: validationErrors.maxLength(100) } }}
          />
        </Col>
        <Col sm="4">
          <CommonInput
            type="text"
            register={register}
            errors={errors}
            className={errors?.sFieldingPosition && 'error'}
            name="sFieldingPosition"
            label="fieldingPosition"
            validation={{ maxLength: { value: 100, message: validationErrors.maxLength(100) } }}
          />
        </Col>
        <Col sm="6">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="country" />*
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
                  isSearchable
                  className={`react-select ${errors?.sCountry && 'error'}`}
                  classNamePrefix="select"
                  onMenuScrollToBottom={handleScrollCountry}
                  onInputChange={(value, action) => optimizedSearch(value, action)}
                  isLoading={loadingCountry}
                  onChange={(e) => {
                    onChange(e)
                  }}
                />
              )}
            />
            {errors.sCountry && <Form.Control.Feedback type="invalid">{errors.sCountry.message}</Form.Control.Feedback>}
          </Form.Group>
        </Col>
        <Col sm="6">
          <Form.Group className="form-group radio-group">
            <Form.Label>
              <FormattedMessage id="gender" />
            </Form.Label>
            <div className="d-flex">
              <Form.Check
                {...register('sSex', { required: validationErrors.required })}
                value="male"
                type="radio"
                label={useIntl().formatMessage({ id: 'male' })}
                className="mb-0 mt-0"
                name="sSex"
                id="Male"
              />
              <Form.Check
                {...register('sSex', { required: validationErrors.required })}
                value="female"
                type="radio"
                label={useIntl().formatMessage({ id: 'female' })}
                className="mb-0 mt-0"
                name="sSex"
                id="Female"
              />
              <Form.Check
                {...register('sSex', { required: validationErrors.required })}
                value="other"
                type="radio"
                label={useIntl().formatMessage({ id: 'other' })}
                className="mb-0 mt-0"
                name="sSex"
                id="Other"
              />
            </div>
            {errors.eGender && <Form.Control.Feedback type="invalid">{errors.eGender.message}</Form.Control.Feedback>}
          </Form.Group>
        </Col>
        <Col xs="12">
          <Form.Group className="form-group">
            <Form.Label>
              <FormattedMessage id="content" />
            </Form.Label>
            <TinyEditor className={`form-control ${errors.sContent && 'error'}`} name="sContent" control={control} onlyTextFormatting />
            {errors.sContent && <Form.Control.Feedback type="invalid">{errors.sContent.message}</Form.Control.Feedback>}
          </Form.Group>
        </Col>
      </Row>
    </>
  )
}
EditPlayer.propTypes = {
  register: PropTypes.func,
  errors: PropTypes.object,
  control: PropTypes.object,
  nameChanged: PropTypes.func,
  values: PropTypes.object,
  handleMenuCountry: PropTypes.func,
  handleMenuRole: PropTypes.func,
  countryList: PropTypes.array,
  loadingCountry: PropTypes.bool,
  handleScrollCountry: PropTypes.func,
  optimizedSearch: PropTypes.func
}
export default EditPlayer
