import React from 'react'
import { Form } from 'react-bootstrap'
import DragIcon from 'assets/images/drag-icon.svg'
import PropTypes from 'prop-types'
import { Draggable } from 'react-beautiful-dnd'
import { Drop } from 'shared/components/drag-and-drop'
import CommonInput from 'shared/components/common-input'
import FooterDraggableSubMenu from '../footer-draggable-submenu'
import { useIntl } from 'react-intl'
import { useFieldArray } from 'react-hook-form'

const FooterDraggableMenu = ({ category, categoryIndex, control, watch, register, errors, setValue, footerMenu, setFooterMenu }) => {
  const { append: subAppend, remove: subRemove } = useFieldArray({
    control,
    name: `category[${categoryIndex}].aResults`
  })
  const watchFields = watch(`category[${categoryIndex}].aResults`)

  return (
    <Draggable key={category?._id} draggableId={category?._id} index={categoryIndex}>
      {(provided, snapshot) => {
        return (
          <div ref={provided.innerRef} {...provided.draggableProps}>
            <Form.Group className='d-flex flex-column justify-content-center'>
              <div className='d-flex align-items-center' style={{ gap: '12px' }}>
                <CommonInput
                  register={register}
                  errors={errors}
                  placeholder={useIntl().formatMessage({ id: 'menu' })}
                  className={errors?.category?.[`${categoryIndex}`]?.eType && 'error'}
                  as='input'
                  type="text"
                  name={`category[${categoryIndex}].eType`}
                  required
                  disabled
                >
                  {errors && errors?.category?.[`${categoryIndex}`]?.eType && <Form.Control.Feedback type="invalid">{errors?.category?.[`${categoryIndex}`]?.eType.message}</Form.Control.Feedback>}
                </CommonInput>
                <div className='w-100 d-flex align-items-center' style={{ gap: '12px' }}>
                  <img src={DragIcon} alt="drag-icon" style={{ marginBottom: '22px' }} {...provided.dragHandleProps} width={20} height={20} />
                </div>
              </div>

              <Drop key={category?._id} id={category?._id} type="droppable-item">
                {
                  watchFields?.map((item, index) => {
                    return (
                      <FooterDraggableSubMenu
                        key={item?.sUrl + index}
                        item={item}
                        category={category}
                        index={index}
                        register={register}
                        categoryIndex={categoryIndex}
                        errors={errors}
                        subAppend={subAppend}
                        subRemove={subRemove}
                        setValue={setValue}
                        footerMenu={footerMenu}
                        setFooterMenu={setFooterMenu}
                      />
                    )
                  }
                  )
                }
              </Drop>
            </Form.Group>
          </div>
        )
      }}
    </Draggable>
  )
}

FooterDraggableMenu.propTypes = {
  category: PropTypes.object,
  categoryIndex: PropTypes.number,
  control: PropTypes.object,
  watch: PropTypes.func,
  register: PropTypes.func,
  errors: PropTypes.object,
  getValues: PropTypes.func,
  setValue: PropTypes.func,
  footerMenu: PropTypes.array,
  setFooterMenu: PropTypes.func
}
export default FooterDraggableMenu
