import React from 'react'
import { Draggable } from 'react-beautiful-dnd'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'

import { WIDGET } from 'shared/enum/widget'

const WidgetColumnsItemRow = ({ item, index, position, onRemove }) => {
  return (
    <Draggable key={item?._id} draggableId={item?._id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`dnd-card m-2 p-2 rounded-3 ${snapshot.isDragging ? 'dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>#{index + 1}</div>
            <span className="text-end text-lowercase fw-light fs-6 text-muted me-0 ms-auto">{item?.eType}</span>
            {(position === 'Left' || position === 'Right') && (
              <Button variant="link" className="square icon-btn ms-1" onClick={() => onRemove(item, position)}>
                <i className="icon-close" />
              </Button>
            )}
          </div>
          <div className="text-start text-break mt-1">{WIDGET[item?.eType] || item?.mValue?.sTitle || item?.sTitle || item?.eType || '-'}</div>
        </div>
      )}
    </Draggable>
  )
}
WidgetColumnsItemRow.propTypes = {
  item: PropTypes.object,
  index: PropTypes.number,
  position: PropTypes.string,
  onRemove: PropTypes.func
}
export default WidgetColumnsItemRow
