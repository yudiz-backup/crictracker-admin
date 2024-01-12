import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Badge, Col, Dropdown } from 'react-bootstrap'
import moment from 'moment'
import { FormattedMessage, useIntl } from 'react-intl'
import { Link } from 'react-router-dom'

import { colorBadge, dateCheck, getArticleState } from 'shared/utils'
import { allRoutes } from 'shared/constants/AllRoutes'
import { S3_PREFIX } from 'shared/constants'
import ToolTip from 'shared/components/tooltip'

function ListWebStory({ webStory, onChangeStatus }) {
  const [action, setAction] = useState([])
  const [isDropDown, setIsDropDown] = useState(false)
  const restore = useIntl().formatMessage({ id: 'restoreToDraft' })
  const trash = useIntl().formatMessage({ id: 'moveToTrash' })

  const imgSrc = S3_PREFIX + webStory?.oCoverImg?.sUrl

  useEffect(() => {
    if (webStory?.eState === 't') {
      setAction([restore])
    } else {
      setAction([trash])
    }
  }, [webStory])

  return (
    <Col xl="2" md="3" xs="6" as={Link} to={allRoutes.editWebStory(webStory?._id)}>
      <div className="story-card">
        <img src={imgSrc} alt="Card Image" />

        <div className="overlay"></div>
        <div className="content">
          <div className="text-light story-title">{webStory?.sTitle}</div>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div className="text-light card-sub-title mt-1 mb-1">{moment(dateCheck(webStory?.dCreated)).format('DD MMM YYYY LT')}</div>
              <Badge bg={colorBadge(webStory?.eState)}>
                <FormattedMessage id={getArticleState(webStory?.eState)} />
              </Badge>
            </div>

            <div>
              <Dropdown
                className="text-end"
                show={isDropDown}
                onMouseEnter={() => setIsDropDown(true)}
                onMouseLeave={() => setIsDropDown(false)}
              >
                <Dropdown.Toggle variant="div" className="actionButton px-2 border-0" onClick={(e) => e.preventDefault()}>
                  <i className="icon-dots-verticle d-block" />
                </Dropdown.Toggle>
                <Dropdown.Menu className='border-0'>
                  {action.map((item) => (
                    <ToolTip toolTipMessage={<FormattedMessage id={item} />} key={item} position="left">
                      <Dropdown.Item
                        variant="button"
                        onClick={() => {
                          onChangeStatus(item, webStory?._id)
                        }}
                      >
                        {item}
                      </Dropdown.Item>
                    </ToolTip>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </Col>
  )
}

ListWebStory.propTypes = {
  webStory: PropTypes.object,
  onChangeStatus: PropTypes.func
}

export default ListWebStory
