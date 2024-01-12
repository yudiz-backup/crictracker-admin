import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'

import ToolTip from 'shared/components/tooltip'

const FantasyTipsInfo = () => {
  return (
    <>
      <Dropdown className="d-inline ms-2">
        <Dropdown.Toggle variant="link" className="actionButton info-button">
          <ToolTip toolTipMessage={<FormattedMessage id='information'/>}>
            <i className="icon-info"></i>
          </ToolTip>
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-Menu menu-info" align="end">
          <Dropdown.Item disabled>
            <i className="round-separator success me-4"></i>
            <span className="info-font">
              <FormattedMessage id="published" />
            </span>
          </Dropdown.Item>
          <Dropdown.Item disabled>
            <i className="round-separator info"></i>
            <i className="round-separator danger ms-1 me-2"></i>
            <span className="info-font">
              <FormattedMessage id="changesRemaining" />
            </span>
          </Dropdown.Item>
          <Dropdown.Item disabled>
            <i className="round-separator info"></i>
            <i className="round-separator success ms-1 me-2"></i>
            <span className="info-font">
              <FormattedMessage id="changesSubmitted" />
            </span>
          </Dropdown.Item>
          <Dropdown.Item disabled>
            <i className="round-separator warning"></i>
            <i className="icon-lock lock-size me-1"></i>
            <span className="info-font">
              <FormattedMessage id="pendingButLocked" />
            </span>
          </Dropdown.Item>
          <Dropdown.Item disabled>
            <i className="round-separator warning me-4"></i>
            <span className="info-font">
              <FormattedMessage id="pending" />
            </span>
          </Dropdown.Item>
          <Dropdown.Item disabled>
            <i className="round-separator danger me-4"></i>
            <span className="info-font">
              <FormattedMessage id="rejected" />
            </span>
          </Dropdown.Item>
          <Dropdown.Item disabled>
            <i className="round-separator secondary me-4"></i>
            <span className="info-font">
              <FormattedMessage id="draft" />
            </span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </>
  )
}

export default FantasyTipsInfo
