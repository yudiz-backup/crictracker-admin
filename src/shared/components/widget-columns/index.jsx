import React from 'react'
import { Droppable } from 'react-beautiful-dnd'
import PropTypes from 'prop-types'
import { Col } from 'react-bootstrap'

import WidgetColumnsItemRow from 'shared/components/widget-columns-item-row'
import WidgetFilter from './widget-filter'

const WidgetColumns = ({ col, onRemove, selectedPoll, handleChange }) => {
  return (
    <Droppable droppableId={col?.id}>
      {(provided, snapshot) => (
        <Col lg={4} className="">
          <div className="dnd-column rounded-3 h-100">
            <h3 className="py-2 px-3 widget-title mb-0">{col?.id}</h3>
            {col?.id === 'All' && <WidgetFilter selectedPoll={selectedPoll} handleChange={handleChange} />}
            <div ref={provided.innerRef} {...provided.droppableProps} className={`drop-zone ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}>
              {col?.list?.map((item, index) => (
                <WidgetColumnsItemRow key={item?._id} item={item} index={index} position={col?.id} onRemove={onRemove} />
              ))}
              {provided.placeholder}
            </div>
          </div>
        </Col>
      )}
    </Droppable>
  )
}

WidgetColumns.propTypes = {
  col: PropTypes.object,
  selectedPoll: PropTypes.object,
  onRemove: PropTypes.func,
  handleChange: PropTypes.func
}

export default WidgetColumns
