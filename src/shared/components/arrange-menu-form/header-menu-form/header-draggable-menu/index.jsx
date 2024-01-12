/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import DragIcon from 'assets/images/drag-icon.svg'
import AddSubmenuIcon from 'assets/images/add-submenu-icon.svg'
import PropTypes from 'prop-types'
import { Draggable } from 'react-beautiful-dnd'
import { FormattedMessage, useIntl } from 'react-intl'
import { useFieldArray } from 'react-hook-form'

import CommonInput from 'shared/components/common-input'
import { Drop } from 'shared/components/drag-and-drop'
import HeaderDraggableSubMenu from '../header-draggable-submenu'
import ToolTip from 'shared/components/tooltip'

const HeaderDraggableMenu = ({ category, categoryIndex, append, remove, control, register, errors, setValue, mainMenu, watch }) => {
  const { append: subAppend, remove: subRemove } = useFieldArray({
    control,
    name: `category[${categoryIndex}].oChildren`
  })
  const watchFields = watch(`category[${categoryIndex}].oChildren`)
  return (
    <Draggable draggableId={category?._id} drop index={categoryIndex}>
      {(provided, snapshot) => {
        return (
          <div ref={provided.innerRef} {...provided.draggableProps}>
            <Form.Group className="d-flex flex-column justify-content-center">
              <div className="d-flex align-items-start" style={{ gap: '12px' }}>
                <CommonInput
                  register={register}
                  errors={errors}
                  className={errors?.category?.[`${categoryIndex}`]?.sTitle && 'error'}
                  placeholder={useIntl().formatMessage({ id: 'menu' })}
                  as="input"
                  type="text"
                  name={`category[${categoryIndex}].sTitle`}
                  required
                >
                  {errors && errors?.category?.[`${categoryIndex}`]?.sTitle && (
                    <Form.Control.Feedback type="invalid">{errors?.category?.[`${categoryIndex}`]?.sTitle.message}</Form.Control.Feedback>
                  )}
                </CommonInput>
                {(category?.oChildren === undefined || category?.oChildren?.length < 1) && (
                  <CommonInput
                    register={register}
                    errors={errors}
                    placeholder={useIntl().formatMessage({ id: 'menuSlug' })}
                    className={errors?.category?.[`${categoryIndex}`]?.sSlug && 'error'}
                    as="input"
                    type="text"
                    name={`category[${categoryIndex}].sSlug`}
                    required
                  >
                    {errors && errors?.category?.[`${categoryIndex}`]?.sSlug && (
                      <Form.Control.Feedback type="invalid">{errors?.category?.[`${categoryIndex}`]?.sSlug.message}</Form.Control.Feedback>
                    )}
                  </CommonInput>
                )}
                <div className="w-100 d-flex align-items-center" style={{ gap: '12px' }}>
                  <ToolTip toolTipMessage={<FormattedMessage id='addSubMenu'/>}>
                    <Button
                      variant="outline-secondary"
                      className="square icon-btn"
                      size="lg"
                      onClick={(item) => subAppend({ sTitle: '', sSlug: '' })}
                    >
                      <img src={AddSubmenuIcon} alt="add-submenu-icon" width={20} />
                    </Button>
                  </ToolTip>
                  <ToolTip toolTipMessage={<FormattedMessage id='addNewMenu'/>}>
                    <Button
                      variant="outline-primary"
                      size="lg"
                      className="square icon-btn"
                      onClick={() => append({ sTitle: '', sSlug: '', oChildren: [] })}
                    >
                      <i className="icon-add d-block" />
                    </Button>
                  </ToolTip>
                  {mainMenu?.length > 5 && (
                    <ToolTip toolTipMessage={<FormattedMessage id='delete'/>}>
                      <Button variant="outline-danger" onClick={() => remove(categoryIndex)} size="lg" className="square icon-btn">
                        <i className="icon-delete d-block" />
                      </Button>
                    </ToolTip>
                  )}
                  <img src={DragIcon} alt="drag-icon" {...provided.dragHandleProps} width={20} />
                </div>
              </div>

              <Drop key={category?._id} id={category?._id} type="droppable-item">
                {watchFields?.map((item, index) => {
                  return (
                    <HeaderDraggableSubMenu
                      key={item?._id + categoryIndex}
                      item={item}
                      subRemove={subRemove}
                      control={control}
                      category={category}
                      categoryIndex={categoryIndex}
                      index={index}
                      register={register}
                      errors={errors}
                      setValue={setValue}
                    />
                  )
                })}
              </Drop>
            </Form.Group>
          </div>
        )
      }}
    </Draggable>
  )
}

HeaderDraggableMenu.propTypes = {
  category: PropTypes.object,
  control: PropTypes.object,
  watch: PropTypes.func,
  categoryIndex: PropTypes.number,
  append: PropTypes.func,
  remove: PropTypes.func,
  register: PropTypes.func,
  errors: PropTypes.object,
  getValues: PropTypes.func,
  mainMenu: PropTypes.array,
  setHeaderMenu: PropTypes.func,
  setValue: PropTypes.func
}
export default HeaderDraggableMenu
