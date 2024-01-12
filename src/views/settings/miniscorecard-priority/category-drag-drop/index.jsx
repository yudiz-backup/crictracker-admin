import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import DragIcon from 'assets/images/drag-icon.svg'
import { Button, Col, Row, Spinner, Table } from 'react-bootstrap'
import { useMutation } from '@apollo/client'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'
import { UPDATE_SERIES_PRIORITY } from 'graph-ql/mini-scorecard/query'
import PermissionProvider from 'shared/components/permission-provider'

const CategoryDND = ({ seriesList, setSeriesList }) => {
  const { dispatch } = useContext(ToastrContext)

  const [updateSeriesPriority, { loading }] = useMutation(UPDATE_SERIES_PRIORITY, {
    onCompleted: (data) => {
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: data?.updateMiniScoreCardPriority, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
      })
    }
  })

  const getItemStyle = (isDragging, draggableStyle) => ({
    background: isDragging ? '#025DE9' : 'transparent',
    ...draggableStyle
  })

  const handleDragEnd = (result, menu, setMenu) => {
    const { type, source, destination } = result
    if (!destination) return

    const reorder = (list, startIndex, endIndex) => {
      const result = Array.from(list)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return result
    }

    // Reordering categories
    if (type === 'droppable-category') {
      const updatedCategories = reorder(menu, source.index, destination.index)

      setMenu(updatedCategories)
    }
  }

  const handleUpdate = () => {
    updateSeriesPriority({
      variables: {
        input: seriesList?.map((item, index) => {
          return {
            nPriority: index + 1,
            iSeriesId: item?.oSeries?._id || item?.iSeriesId,
            sTitle: item?.sSeriesTitle || item?.sTitle,
            sSrtTitle: item?.sSrtTitle
          }
        })
      }
    })
  }
  return (
    <Row>
      <Col sm="12" lg="8" className="data-table">
        {seriesList?.length > 0 && (
          <>
            <DragDropContext onDragEnd={(result) => handleDragEnd(result, seriesList, setSeriesList)}>
              <Table className="table-borderless" responsive="sm">
                <thead>
                  <tr>
                    <th className="">#</th>
                    <th className="w-100">
                      <FormattedMessage id="name" />
                    </th>
                    <th>
                      <FormattedMessage id="action" />
                    </th>
                  </tr>
                </thead>
                <Droppable droppableId="droppable" type="droppable-category">
                  {(provided) => {
                    return (
                      <tbody ref={provided.innerRef} {...provided.droppableProps}>
                        {seriesList?.map((category, categoryIndex) => {
                          return (
                            <Draggable key={category?._id} draggableId={category?._id} index={categoryIndex}>
                              {(provided, snapshot) => {
                                return (
                                  <tr
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                                  >
                                    <td>{categoryIndex + 1}</td>
                                    <td className="w-100">{category?.sTitle || category?.sSrtTitle}</td>
                                    <td {...provided.dragHandleProps}>
                                      <img src={DragIcon} alt="drag icon" width={20} height={20} />
                                    </td>
                                  </tr>
                                )
                              }}
                            </Draggable>
                          )
                        })}
                        {provided.placeholder}
                      </tbody>
                    )
                  }}
                </Droppable>
              </Table>
            </DragDropContext>
            <PermissionProvider isAllowedTo="EDIT_MINISCORECARD_PRIO">
              <Button variant="primary" className="" onClick={handleUpdate}>
                {loading ? <Spinner animation="border" size="sm" /> : <FormattedMessage id="update" />}
              </Button>
            </PermissionProvider>
          </>
        )}
      </Col>
    </Row>
  )
}
export default CategoryDND

CategoryDND.propTypes = {
  seriesList: PropTypes.array,
  setSeriesList: PropTypes.func,
  getValues: PropTypes.func
}
