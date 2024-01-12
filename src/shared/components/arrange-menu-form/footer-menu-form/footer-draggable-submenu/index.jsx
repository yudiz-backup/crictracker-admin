import React from 'react'
import { Button, Form } from 'react-bootstrap'
import DragIcon from 'assets/images/drag-icon.svg'
import PropTypes from 'prop-types'
import { Draggable } from 'react-beautiful-dnd'
import { FormattedMessage, useIntl } from 'react-intl'

import CommonInput from 'shared/components/common-input'
import ToolTip from 'shared/components/tooltip'

const FooterDraggableSubMenu = ({ category, item, index, categoryIndex, register, errors, subAppend, subRemove }) => {
  return (
    <Draggable key={item?._id || item?.sSlug + index} type="droppable-item" draggableId={item?._id || item?.sSlug + index} index={index}>
      {(provided, snapshot) => {
        return (
          <div ref={provided.innerRef} {...provided.draggableProps}>
            <Form.Group className="d-flex align-items-start justify-content-center" style={{ marginLeft: '24px', gap: '12px' }}>
              <CommonInput
                register={register}
                errors={errors}
                className={errors?.category?.[`${categoryIndex}`]?.aResults?.[`${index}`]?.sTitle && 'error'}
                placeholder={useIntl().formatMessage({ id: 'subMenu' })}
                as="input"
                type="text"
                name={`category[${categoryIndex}].aResults[${index}].sTitle`}
                required
              >
                {errors && errors?.category?.[`${categoryIndex}`]?.aResults?.[`${index}`]?.sTitle && (
                  <Form.Control.Feedback type="invalid">
                    {errors?.category?.[`${categoryIndex}`]?.aResults?.[`${index}`]?.sTitle.message}
                  </Form.Control.Feedback>
                )}
              </CommonInput>
              <CommonInput
                register={register}
                errors={errors}
                className={errors?.category?.[`${categoryIndex}`]?.aResults?.[`${index}`]?.sUrl && 'error'}
                placeholder={useIntl().formatMessage({ id: 'subMenuSlug' })}
                as="input"
                type="text"
                name={`category[${categoryIndex}].aResults[${index}].sUrl`}
                required
              >
                {errors && errors?.category?.[`${categoryIndex}`]?.aResults?.[`${index}`]?.sUrl && (
                  <Form.Control.Feedback type="invalid">
                    {errors?.category?.[`${categoryIndex}`]?.aResults?.[`${index}`]?.sUrl.message}
                  </Form.Control.Feedback>
                )}
              </CommonInput>
              <div className="w-100 d-flex align-items-center" style={{ gap: '12px' }}>
                <ToolTip toolTipMessage={<FormattedMessage id='addNewMenu' />}>
                  <Button
                    variant="outline-primary"
                    size="lg"
                    className="square icon-btn"
                    onClick={(item) => subAppend({ sTitle: '', sUrl: '' })}
                  >
                    <i className="icon-add d-block" />
                  </Button>
                </ToolTip>
                {category?.aResults?.length > 1 && (
                  <ToolTip toolTipMessage={<FormattedMessage id='delete' />}>
                    <Button variant="outline-danger" size="lg" className="square icon-btn" onClick={() => subRemove(index)}>
                      <i className="icon-delete d-block" />
                    </Button>
                  </ToolTip>
                )}
                {category?.aResults?.length > 1 && <img src={DragIcon} alt="drag-icon" {...provided.dragHandleProps} width={20} />}
              </div>
            </Form.Group>
          </div>
        )
      }}
    </Draggable>
  )
}

FooterDraggableSubMenu.propTypes = {
  item: PropTypes.object,
  index: PropTypes.number,
  categoryIndex: PropTypes.number,
  category: PropTypes.object,
  append: PropTypes.func,
  remove: PropTypes.func,
  register: PropTypes.func,
  errors: PropTypes.object,
  getValues: PropTypes.func,
  subAppend: PropTypes.func,
  subRemove: PropTypes.func
}
export default FooterDraggableSubMenu
