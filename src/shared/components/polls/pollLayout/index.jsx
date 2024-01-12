import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import PropTypes from 'prop-types'

export function PollLayout({ children, onSlideChange, defaultTab }) {
  const defaultSelectedTab = { sp: 0, ip: 1, mp: 2, vs: 3, rp: 4 }
  const [selectedChild, setSelectedChild] = useState(defaultSelectedTab[defaultTab] || 0)

  useEffect(() => {
    setSelectedChild(defaultSelectedTab[defaultTab] || 0)
  }, [defaultTab])

  const childComponents = React.Children.toArray(children)

  const handleChangeChild = (index, type) => {
    setSelectedChild(index)
    onSlideChange(type)
  }

  const icons = {
    sp: 'icon-simplePoll',
    ip: 'icon-imgPoll',
    mp: 'icon-mediaPoll',
    vs: 'icon-vsPoll',
    rp: 'icon-reactionPoll'
  }

  return (
    <div className="mb-4">
      {childComponents[selectedChild]}
      <div className="poll-actions position-relative text-center d-flex mx-auto">
        <div className="action-list mx-auto">
          {childComponents.map((child, index) => {
            const icon = icons[child?.props?.type]
            const isActive = selectedChild === index
            const iconColor = isActive ? 'orange' : 'grey'
            return (
              <Button key={index} variant='link' className="square icon-btn mx-1" onClick={() => handleChangeChild(index, child?.props?.type)}>
                <i className={icon} style={{ color: iconColor }}></i>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

PollLayout.propTypes = {
  children: PropTypes.node,
  onSlideChange: PropTypes.func,
  defaultTab: PropTypes.string
}

export default PollLayout
