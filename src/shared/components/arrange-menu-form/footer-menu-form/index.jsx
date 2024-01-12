import React, { useContext } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { DragAndDrop, Drop } from '../../drag-and-drop'
import { ADD_FOOTER_MENU, FOOTER_MENU } from 'graph-ql/settings/arrange-menu'
import { useMutation, useQuery } from '@apollo/client'
import { useFieldArray, useForm } from 'react-hook-form'
import FooterDraggableMenu from './footer-draggable-menu'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { handleDragEnd } from 'shared/utils'
import PermissionProvider from 'shared/components/permission-provider'

const FooterMenuForm = () => {
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
  useQuery(FOOTER_MENU, {
    onCompleted: (data) => {
      reset({ category: getDefaultValue(data?.getFrontFooter) })
    }
  })

  const [addFooterMenu, { loading }] = useMutation(ADD_FOOTER_MENU,
    {
      onCompleted: (data) => {
        dispatch({
          type: 'SHOW_TOAST',
          payload: { message: data?.addFooterMenu, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
        })
      }
    })

  function getDefaultValue(data) {
    if (data) {
      return data.map((i, index) => {
        return {
          _id: i?._id,
          eType: i?.eType,
          aResults: i?.aResults || [],
          nPriority: index + 1
        }
      })
    } else {
      return [{ eType: '', aResults: [], _id: 'footerDragId' }]
    }
  }
  function onSubmit(data) {
    const footerData = data?.category?.map((rest, i) => {
      return {
        eType: rest?.eType,
        nPriority: i + 1,
        aResults: rest?.aResults?.map((subRest, i) => {
          return {
            sTitle: subRest?.sTitle,
            sUrl: subRest?.sUrl
          }
        })
      }
    })
    addFooterMenu({ variables: { input: footerData } })
  }
  return (
    <div className='d-flex flex-column align-items-start'>
      <div className='data-table w-100'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DragAndDrop onDragEnd={(result) => handleDragEnd(result, 'aResults', watchFields, setValue)}>
            <Drop id='droppable' type='droppable-category'>
              {watchFields.map((category, categoryIndex) => {
                return (
                  <FooterDraggableMenu
                    key={category?._id}
                    categoryIndex={categoryIndex}
                    category={category}
                    register={register}
                    watch={watch}
                    errors={errors}
                    getValues={getValues}
                    setValue={setValue}
                    control={control}
                    append={append}
                    remove={remove} />
                )
              })}
            </Drop>
          </DragAndDrop>
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
export default FooterMenuForm
