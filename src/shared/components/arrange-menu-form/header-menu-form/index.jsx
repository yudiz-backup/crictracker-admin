import React, { useContext } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { ADD_HEADER_MENU, HEADER_MENU } from 'graph-ql/settings/arrange-menu'
import { useMutation, useQuery } from '@apollo/client'
import { useFieldArray, useForm } from 'react-hook-form'
import HeaderDraggableMenu from './header-draggable-menu'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { handleDragEnd } from 'shared/utils'
import PermissionProvider from 'shared/components/permission-provider'

const HeaderMenuForm = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    watch,
    setValue,
    reset
  } = useForm({ defaultValues: { category: getDefaultValue() } })

  const { append, remove } = useFieldArray({
    control,
    name: 'category'
  })
  const { dispatch } = useContext(ToastrContext)

  const watchFields = watch('category')

  useQuery(HEADER_MENU, {
    onCompleted: (data) => {
      reset({ category: getDefaultValue(data?.getMenuTree?.aResults) })
    }
  })

  const [addHeaderMenu, { loading }] = useMutation(ADD_HEADER_MENU, {
    onCompleted: (data) => {
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: data?.addHeaderMenu, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
      })
    }
  })

  function onSubmit(data) {
    const headerData = data?.category?.map((rest, i) => {
      return {
        eMenuType: rest?.eMenuType,
        eUrlTarget: rest?.eUrlTarget,
        nSort: i + 1,
        sSlug: rest?.sSlug,
        sTitle: rest?.sTitle,
        oChildren: rest?.oChildren?.map((subRest) => {
          return {
            sTitle: subRest?.sTitle,
            sSlug: subRest?.sSlug
          }
        }),
        sUrl: rest?.oChildren?.length > 0 ? null : rest?.sUrl || 'null'
      }
    })
    addHeaderMenu({ variables: { input: headerData } })
  }

  function getDefaultValue(data) {
    if (data) {
      return data.map((i) => {
        return {
          _id: i?._id,
          sTitle: i?.sTitle,
          oChildren: i?.oChildren || [],
          sSlug: i?.sSlug,
          eMenuType: i?.eMenuType,
          eUrlTarget: i?.eUrlTarget,
          sUrl: i?.sUrl
        }
      })
    } else {
      return [{ sTitle: '', sSlug: '', _id: 'dragId' }]
    }
  }

  return (
    <div className='d-flex flex-column align-items-start'>
      <div className='data-table w-100'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DragDropContext onDragEnd={(result) => handleDragEnd(result, 'oChildren', watchFields, setValue)}>
            <Droppable droppableId='droppable' type='droppable-category'>
              {(provided) => {
                return (
                  <div ref={provided.innerRef} {...provided.droppableProps} >
                    {watchFields.map((category, categoryIndex) => {
                      return (
                        <HeaderDraggableMenu
                          key={category?._id + categoryIndex}
                          category={category}
                          mainMenu={watchFields}
                          categoryIndex={categoryIndex}
                          register={register}
                          watch={watch}
                          errors={errors}
                          getValues={getValues}
                          control={control}
                          setValue={setValue}
                          append={append}
                          remove={remove} />
                      )
                    })}
                    {provided.placeholder}
                  </div>)
              }}
            </Droppable>
          </DragDropContext>
          <PermissionProvider isAllowedTo="EDIT_MENU_ARRANGEMENT">
            <Button variant="primary" type="submit" className="mt-3">
              {loading ? <Spinner animation="border" size="sm" /> : <FormattedMessage id="update" />}
            </Button>
          </PermissionProvider>
        </form>
      </div>
    </div>
  )
}
export default HeaderMenuForm
