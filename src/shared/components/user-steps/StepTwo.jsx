import React, { Fragment, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Accordion, Button, Col, Form, Row } from 'react-bootstrap'
import { Controller, useFieldArray } from 'react-hook-form'
import { useQuery } from '@apollo/client'
import { confirmAlert } from 'react-confirm-alert'
import Select from 'react-select'

import CustomToggle from '../custom-toggle'
import RolePermissionDropdown from '../role-permission-dropdown'
import { SOCIAL_LIST, IFSC_CODE, ACCOUNT_NO, URL_REGEX, S3_PREFIX } from 'shared/constants'
import { validationErrors } from 'shared/constants/ValidationErrors'
import Drawer from '../drawer'
import RoleAddEdit from '../role-add-edit'
import { GET_DEFAULT_ROLE } from 'graph-ql/settings/role'
import CustomAlert from '../alert'
import { FormattedMessage } from 'react-intl'
import CommonInput from '../common-input'

function StepTwo({
  nextStep,
  previous,
  register,
  submit,
  errors,
  control,
  setValue,
  values,
  setError,
  clearErrors,
  trigger,
  id,
  hidden,
  sPanPicture,
  sBankDetailPic,
  selectedRole
}) {
  const [isRoleOpen, setIsRoleOpen] = useState(false)
  const [panImage, setPanImage] = useState()
  const [bankDetailImage, setBankDetailImage] = useState()
  const [defaultRole, setDefaultRole] = useState([])
  const [extraPermission, setExtraPermission] = useState([])
  const [socialValidation, setSocialValidation] = useState([{ eSocialNetworkType: false, sDisplayName: false, sLink: false }])
  const [selectedMedia, setSelectedMedia] = useState([])
  const [roleError, setRoleError] = useState(false)
  !id &&
    useQuery(GET_DEFAULT_ROLE, {
      onCompleted: (data) => {
        if (data && data.getDefaultRoles) {
          setDefaultRole(data.getDefaultRoles)
        }
      }
    })

  useEffect(() => {
    if (defaultRole && !defaultRole.length && !extraPermission?.length) {
      setRoleError(true)
    } else {
      setRoleError(false)
    }
  }, [defaultRole, extraPermission])

  useEffect(() => {
    if (values.aSocialProfiles.length && id) {
      const data = values.aSocialProfiles.map((ele) => {
        return {
          eSocialNetworkType: ele.eSocialNetworkType ? validationErrors.required : false,
          sDisplayName: ele.sDisplayName ? validationErrors.required : false,
          sLink: ele.sLink ? validationErrors.required : false
        }
      })
      setSocialValidation(data)
    }
  }, [values?.aSocialProfiles])

  useEffect(() => {
    if (selectedRole) {
      const extraPermissions = []
      const role = []
      const permission = selectedRole.aPermissions.map((item) => {
        if (!item.aRoles.length) extraPermissions.push(item.iPermissionId)
        return { ...item, aRoles: item.aRoles.map((role) => role._id) }
      })
      selectedRole.aRoleId.forEach((item) => {
        permission.map((ele) => {
          if (ele.aRoles.includes(item._id)) {
            if (role.map((e) => e._id).includes(item._id)) {
              // if role added then add only permission
              role.forEach((dRole) => {
                dRole._id === item._id && dRole.aPermissions.push(ele.iPermissionId)
              })
            } else {
              // Add role if it's not added
              role.push({ ...item, aPermissions: [ele.iPermissionId] })
            }
          }
          ele.aRoles = ele.aRoles.filter((role) => role !== item._id) // Delete Role from permission it it's match
          return ele
        })
      })
      setDefaultRole(role)
      extraPermissions.length && setExtraPermission(extraPermissions)
    }
    const mediaSelected = values.aSocialProfiles.map((ele) => ele.eSocialNetworkType)
    setSelectedMedia(mediaSelected)
  }, [selectedRole])

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'aSocialProfiles'
  })

  function handlePanImgChange(e) {
    setPanImage(URL.createObjectURL(e.target.files[0]))
  }

  function handleBankDetailImgChange(e) {
    setBankDetailImage(URL.createObjectURL(e.target.files[0]))
  }

  function handleAddRole(data) {
    const changedRole = data?.sParentRole?.map((a) => ({ ...a }))
    const editedPermission = Object.keys(data.aPermissions).filter((key) => data.aPermissions[key])
    changedRole?.forEach((item) => {
      item.aPermissions = item.aPermissions.filter((permission) => editedPermission.includes(permission._id) && permission)
    })
    setExtraPermission(data.extraPermission)
    setDefaultRole(changedRole)
    setIsRoleOpen(!isRoleOpen)
  }

  function removeRole(id) {
    confirmAlert({
      title: 'Confirmation',
      message: 'Are you sure you want to remove this role?',
      customUI: CustomAlert,
      buttons: [
        {
          label: 'Yes',
          onClick: () => {
            setDefaultRole(defaultRole.filter((item) => item._id !== id))
          }
        },
        {
          label: 'No'
        }
      ]
    })
  }

  function handleChange(e, index) {
    const data = socialValidation
    if (e.target.value) {
      Object.keys(data[index]).forEach((key) => {
        data[index][key] = validationErrors.required
      })
      setSocialValidation(data)
    } else if (e.target.value === '') {
      if (Object.values(values.aSocialProfiles[index]).every((x) => x === '')) {
        Object.keys(data[index]).forEach((key) => {
          data[index][key] = false
        })
        setSocialValidation(data)
        clearErrors([
          `aSocialProfiles[${index}].eSocialNetworkType`,
          `aSocialProfiles[${index}].sDisplayName`,
          `aSocialProfiles[${index}].sLink`
        ])
      }
    }
    const mediaSelected = values.aSocialProfiles.map((ele) => ele.eSocialNetworkType)
    setSelectedMedia(mediaSelected)
    trigger()
  }

  function createSocialField(value) {
    return {
      eSocialNetworkType: value,
      sDisplayName: value,
      sLink: value
    }
  }

  function addMoreSocialProfile() {
    setSocialValidation([...socialValidation, createSocialField(false)])
    append(createSocialField(''))
  }

  function removeSocialProfile(index) {
    remove(index)
    socialValidation.splice(index, 1)
    setSocialValidation(socialValidation)
    setSelectedMedia(selectedMedia.filter((item) => item !== values.aSocialProfiles[index].eSocialNetworkType))
  }

  function onSubmit(data) {
    trigger()
    const aPermissions = convertRole({ defaultRole, extraPermission })
    const aRoleId = defaultRole.map((item) => item._id)
    if (data.aSocialProfiles.length && data.aSocialProfiles[data.aSocialProfiles.length - 1].sLink === '') {
      data.aSocialProfiles.length = data.aSocialProfiles.length - 1
    }
    nextStep(3, { ...data, oRole: { aRoleId, aPermissions } })
  }

  function convertRole(oRole) {
    const array = []
    oRole.defaultRole.forEach((s) => {
      s.aPermissions.forEach((p) => {
        const index = array.map((x) => x.iPermissionId).indexOf(p._id)
        if (index >= 0) {
          array[index].aRoles.push(s._id)
        } else {
          array.push({ iPermissionId: p._id, aRoles: [s._id] })
        }
      })
    })

    oRole.extraPermission.forEach((s) => {
      array.push({ iPermissionId: s._id })
    })
    return array
  }

  useEffect(() => {
    setValue('bIsCustom', !!extraPermission.length)
  }, [extraPermission])

  const panImg = register('sPanPicture')
  const bankImg = register('sBankDetailPic')
  return (
    <>
      <Form hidden={hidden} className="step-two" onSubmit={submit(onSubmit)} autoComplete="off">
        <Row>
          <h2 className="title-txt d-flex align-items-center justify-content-between">
            <FormattedMessage id="panDetails" />
          </h2>
          <Col md="4">
            <div className="step-two-left">
              <div className="pan-img d-flex align-items-center justify-content-center">
                {sPanPicture || panImage ? (
                  <img src={panImage || `${S3_PREFIX}${sPanPicture}`} alt="Pan Image" className="cover" />
                ) : (
                  <i className="icon-id-card"></i>
                )}
              </div>
              <input
                type="file"
                id="pan-img"
                name="sPanPicture"
                accept=".jpg,.png,.webp"
                {...panImg}
                onChange={(e) => {
                  panImg.onChange(e)
                  handlePanImgChange(e)
                }}
                hidden
              />
              <label htmlFor="pan-img" className="btn btn-outline-secondary">
                <FormattedMessage id="uploadImage" />
              </label>
            </div>
          </Col>
          <Col md="8">
            <Row>
              <Col md="6">
                <Form.Group className="form-group">
                  <Form.Label>
                    <FormattedMessage id="panNumber" />
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="sPanNumber"
                    className={errors.sPanNumber && 'error'}
                    {...register('sPanNumber', {
                      maxLength: { value: 10, message: validationErrors.number },
                      minLength: { value: 10, message: validationErrors.number }
                    })}
                  />
                  {errors.sPanNumber && <Form.Control.Feedback type="invalid">{errors.sPanNumber.message}</Form.Control.Feedback>}
                </Form.Group>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mt-4 add-border">
          <h2 className="title-txt d-flex align-items-center justify-content-between">
            <FormattedMessage id="bankDetails" />
          </h2>
          <Col md="4">
            <div className="step-two-left">
              <div className="pan-img d-flex align-items-center justify-content-center">
                {sBankDetailPic || bankDetailImage ? (
                  <img src={bankDetailImage || `${S3_PREFIX}${sBankDetailPic}`} alt="Bank Detail Image" className="cover" />
                ) : (
                  <i className="icon-id-card"></i>
                )}
              </div>
              <input
                type="file"
                id="bank-img"
                name="sBankDetailPic"
                accept=".jpg,.png,.webp"
                {...bankImg}
                onChange={(e) => {
                  bankImg.onChange(e)
                  handleBankDetailImgChange(e)
                }}
                hidden
              />
              <label htmlFor="bank-img" className="btn btn-outline-secondary">
                <FormattedMessage id="uploadImage" />
              </label>
            </div>
          </Col>
          <Col md="8">
            <Row>
              <Col sm="6">
                <CommonInput
                  type="text"
                  register={register}
                  errors={errors}
                  className={`form-control ${errors?.sPanName && 'error'}`}
                  name="sPanName"
                  label="nameAsPerPANCard"
                />
              </Col>
              <Col sm="6">
                <Form.Group className="form-group">
                  <Form.Label>
                    <FormattedMessage id="ifscCode" />
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="sIfsc"
                    className={errors.sIfsc && 'error'}
                    {...register('sIfsc', { pattern: { value: IFSC_CODE, message: validationErrors.IFSCCode } })}
                  />
                  {errors.sIfsc && <Form.Control.Feedback type="invalid">{errors.sIfsc.message}</Form.Control.Feedback>}
                </Form.Group>
              </Col>
              <Col sm="6">
                <Form.Group className="form-group">
                  <Form.Label>
                    <FormattedMessage id="accountNo" />
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="sAccountNumber"
                    className={errors.sAccountNumber && 'error'}
                    {...register('sAccountNumber', { pattern: { value: ACCOUNT_NO, message: validationErrors.accountNumber } })}
                  />
                  {errors.sAccountNumber && <Form.Control.Feedback type="invalid">{errors.sAccountNumber.message}</Form.Control.Feedback>}
                </Form.Group>
              </Col>
              <Col sm="6">
                <CommonInput
                  type="text"
                  register={register}
                  errors={errors}
                  className={`form-control ${errors?.sAccountName && 'error'}`}
                  name="sAccountName"
                  label="accountName"
                />
              </Col>
              {/* new */}
              <Col sm="6">
                <CommonInput
                  type="text"
                  register={register}
                  errors={errors}
                  className={`form-control ${errors?.sBankName && 'error'}`}
                  name="sBankName"
                  label="bankName"
                />
              </Col>
              <Col sm="6">
                <CommonInput
                  type="text"
                  register={register}
                  errors={errors}
                  className={`form-control ${errors?.sBranchName && 'error'}`}
                  name="sBranchName"
                  label="branchName"
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <input type="checkbox" className="d-none" {...register('bIsCustom')} defaultValue={false} />
        <div className="add-border role-listing">
          <h2 className="title-txt d-flex align-items-center justify-content-between">
            <FormattedMessage id="Roles" />

            <Button variant="outline-primary" onClick={() => setIsRoleOpen(!isRoleOpen)}>
              <FormattedMessage id="add/EditRole" />
            </Button>
          </h2>
          <Accordion>
            <table className="w-100 role-table data-table">
              <thead>
                <tr>
                  <th>
                    <FormattedMessage id="roleTitle" />
                  </th>
                  <th className="text-end"></th>
                </tr>
              </thead>
              <tbody>
                {defaultRole?.map((role, index) => {
                  return (
                    <Fragment key={role._id}>
                      <tr>
                        <td className="title-b">
                          <CustomToggle Tag="i" className="icon-arrow-drop-down" eventKey={index} />
                          <span>{role.sName}</span>
                        </td>
                        <td>
                          <Button onClick={() => removeRole(role._id)} variant="link" className="square icon-btn">
                            <i className="icon-delete d-block" />
                          </Button>
                        </td>
                      </tr>
                      <RolePermissionDropdown data={role.aPermissions} eventKey={index} colSpan={2} />
                    </Fragment>
                  )
                })}
                {extraPermission.length > 0 && (
                  <>
                    <tr>
                      <td className="title-b" colSpan="2">
                        <CustomToggle Tag="i" className="icon-arrow-drop-down" eventKey={defaultRole?.length + 1} />
                        <span>
                          <FormattedMessage id="extraPermissions" />
                        </span>
                      </td>
                    </tr>
                    <RolePermissionDropdown data={extraPermission} eventKey={defaultRole?.length + 1} colSpan={2} />
                  </>
                )}
              </tbody>
            </table>
            {roleError && (
              <Form.Control.Feedback className="mt-2" type="invalid">
                {validationErrors.selectRoleAndPermission}
              </Form.Control.Feedback>
            )}
          </Accordion>
        </div>
        <div className="add-border social-links border-top-0">
          <h2 className="title-txt">
            <FormattedMessage id="socialLinks" />
          </h2>
          {fields.map((field, index) => {
            return (
              <Row key={field.id}>
                <Col md="3" sm="6">
                  <Form.Group className="form-group">
                    <Form.Label>
                      <FormattedMessage id="socialNetwork" />
                    </Form.Label>
                    <i className="icon-chevron-down"></i>
                    <Controller
                      name={`aSocialProfiles[${index}].eSocialNetworkType`}
                      control={control}
                      rules={{ required: socialValidation[index]?.eSocialNetworkType }}
                      render={({ field: { onChange, value, ref } }) => (
                        <Select
                          ref={ref}
                          value={SOCIAL_LIST.filter((x) => x.value === value)[0]}
                          options={SOCIAL_LIST.map((s) => (selectedMedia.includes(s.value) ? { ...s, isDisabled: true } : s))}
                          className={`react-select ${
                            errors?.aSocialProfiles && errors?.aSocialProfiles[index]?.eSocialNetworkType && 'error'
                          }`}
                          classNamePrefix="select"
                          isSearchable={false}
                          onChange={(e) => {
                            onChange(e.value)
                          }}
                          onBlur={(e) => handleChange({ target: { value } }, index)}
                        />
                      )}
                    />
                    {errors?.aSocialProfiles && errors?.aSocialProfiles[index]?.eSocialNetworkType && (
                      <Form.Control.Feedback type="invalid">
                        {errors?.aSocialProfiles[index]?.eSocialNetworkType.message}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
                <Col md="3" sm="6">
                  <Form.Group className="form-group">
                    <Form.Label>
                      <FormattedMessage id="displayName" />
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name={`aSocialProfiles[${index}].sDisplayName`}
                      className={errors?.aSocialProfiles && errors?.aSocialProfiles[index]?.sDisplayName && 'error'}
                      {...register(`aSocialProfiles[${index}].sDisplayName`, { required: socialValidation[index]?.sDisplayName })}
                      onBlur={(e) => handleChange(e, index)}
                    />
                    {errors?.aSocialProfiles && errors?.aSocialProfiles[index]?.sDisplayName && (
                      <Form.Control.Feedback type="invalid">{errors?.aSocialProfiles[index]?.sDisplayName.message}</Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
                <Col md="5" sm="10">
                  <Form.Group className="form-group">
                    <Form.Label>
                      <FormattedMessage id="link" />
                    </Form.Label>
                    <Form.Control
                      type="text"
                      className={errors?.aSocialProfiles && errors?.aSocialProfiles[index]?.sLink && 'error'}
                      name={`aSocialProfiles[${index}].sLink`}
                      {...register(`aSocialProfiles[${index}].sLink`, {
                        required: socialValidation[index]?.sLink,
                        pattern: { value: URL_REGEX, message: validationErrors.url }
                      })}
                      onBlur={(e) => handleChange(e, index)}
                    />
                    {errors?.aSocialProfiles && errors?.aSocialProfiles[index]?.sLink && (
                      <Form.Control.Feedback type="invalid">{errors?.aSocialProfiles[index]?.sLink.message}</Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
                <Col md="1" sm="2">
                  <Button onClick={() => removeSocialProfile(index)} variant="link" className="social-btn icon-btn">
                    <i className="icon-delete d-block" />
                  </Button>
                </Col>
              </Row>
            )
          })}
          {fields.length < SOCIAL_LIST.length && (
            <Button
              onClick={addMoreSocialProfile}
              variant="link"
              className="square add-media hover-none"
              disabled={!values.aSocialProfiles.every((item) => Object.values(item).every((x) => x !== ''))}
            >
              <i className="icon-add" />
              <FormattedMessage id="addSocialProfiles" />
            </Button>
          )}
        </div>
        <div className="btn-bottom add-border">
          <Button onClick={() => previous(1)} variant="outline-secondary">
            <FormattedMessage id="back" />
          </Button>
          <Button type="submit" variant="primary" disabled={roleError}>
            <FormattedMessage id="next" />
          </Button>
        </div>
      </Form>
      <Drawer isOpen={isRoleOpen} onClose={() => setIsRoleOpen(!isRoleOpen)} title={'Add / Edit Role'}>
        <RoleAddEdit onAddRole={handleAddRole} defaultRole={{ role: defaultRole, extraPermission }} />
      </Drawer>
    </>
  )
}
StepTwo.propTypes = {
  nextStep: PropTypes.func,
  previous: PropTypes.func,
  register: PropTypes.func,
  submit: PropTypes.func,
  setValue: PropTypes.func,
  errors: PropTypes.object,
  control: PropTypes.object,
  values: PropTypes.object,
  setError: PropTypes.func,
  clearErrors: PropTypes.func,
  trigger: PropTypes.func,
  id: PropTypes.string,
  sPanPicture: PropTypes.string,
  sBankDetailPic: PropTypes.string,
  hidden: PropTypes.bool,
  selectedRole: PropTypes.object
}
export default StepTwo
