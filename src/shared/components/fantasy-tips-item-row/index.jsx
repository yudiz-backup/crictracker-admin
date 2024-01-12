import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import { Button, Form, Dropdown } from 'react-bootstrap'

import PermissionProvider from '../permission-provider'
import { PLATFORM_TYPE, SERIES_PRIORITY } from 'shared/constants'
import { allRoutes } from 'shared/constants/AllRoutes'
import { platFormType, getArticleState, colorBadge, dateCheck } from 'shared/utils'
import Select from 'react-select'

const FantasyTipsItemRow = ({ fantasy, selectedTab, onPriorityChange, onStatusChange, onDelete, handleAddCopy, handleChangeStatus }) => {
  function getFetchPriority(eFetchPriority) {
    return SERIES_PRIORITY.find((p) => p.value === eFetchPriority) || SERIES_PRIORITY[0]
  }
  return (
    <>
      <tr>
        <td>
          <p className="title">{fantasy?.sTitle}</p>
          <p className="fantasy-data">
            {fantasy?.oSeries?.sTitle}
            <i className="round-separator ms-1"></i>
            <span className="ms-1">{fantasy?.sSubtitle}</span>
            <i className="round-separator ms-1"></i>
            <span className="ms-1">{fantasy?.oVenue?.sLocation}</span>
          </p>
          <p className="date">
            <span>
              <FormattedMessage id="d" />
            </span>
            {moment(dateCheck(fantasy?.dStartDate)).format('DD MMM YYYY LT')}
          </p>
        </td>
        <td className='d-flex'>
          <Select
            value={getFetchPriority(fantasy?.eFetchPriority)}
            options={SERIES_PRIORITY}
            className={'react-select w-25 me-3 h-100'}
            classNamePrefix="select"
            onChange={(e) => onPriorityChange(fantasy?._id, e.value)}
          />
          <div>
            {selectedTab === 'upcomingMatches' && (
              <Button variant="outline-secondary-min-radius">
                <FormattedMessage id="addFantasyTips" />
                <Form.Check
                  type="switch"
                  name={fantasy?._id}
                  className={`d-inline-block ms-1 ${fantasy?.bFantasyTips ? 'success' : 'danger'}`}
                  checked={fantasy?.bFantasyTips}
                  onChange={onStatusChange}
                />
              </Button>
            )}
            {((selectedTab === 'upcomingMatches' && fantasy?.bFantasyTips) ||
              selectedTab === 'completedMatches' ||
              selectedTab === 'trash') && (
              <div>
                {selectedTab !== 'trash' && (
                  <PermissionProvider isAllowedTo="MATCH_OVERVIEW_FANTASY_ARTICLE">
                    <Button className="over-view mt-2 me-2" as={Link} to={allRoutes.editFantasyOverview(fantasy._id)}>
                      <i className="round-separator warning me-2"></i>
                      <FormattedMessage id="overView" />
                      <i className="icon-add ms-1"></i>
                    </Button>
                  </PermissionProvider>
                )}
                {fantasy?.aFantasyTips.length !== 0 &&
                  fantasy?.aFantasyTips?.map((platform) => {
                    return (
                      <Dropdown key={platform._id} className="d-inline me-2">
                        <Dropdown.Toggle className="over-view actionButton mt-2">
                          <i className={'round-separator ' + colorBadge(platform?.eState)}></i>
                          {platform?.eState === 'cr' && <i className={'ms-1 round-separator danger'}></i>}
                          {platform?.eState === 'cs' && <i className={'ms-1 round-separator success'}></i>}
                          <span className="ms-2">{platFormType(platform?.ePlatformType)}</span>
                          <i className="icon-dots-verticle" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className="dropdown-Menu">
                          <div className="menu-body">
                            <span className="menu-title">{platFormType(platform?.ePlatformType)}</span>
                            <p className="menu-status">
                              <i className={'round-separator ' + colorBadge(platform?.eState)}></i>
                              {platform?.eState === 'cr' && <i className={'ms-1 round-separator danger'}></i>}
                              {platform?.eState === 'cs' && <i className={'ms-1 round-separator success'}></i>}
                              <span className="ms-2">
                                <FormattedMessage id={getArticleState(platform?.eState)} />
                              </span>
                            </p>
                            <p className="menu-info">
                              <i className="me-2 icon-add"></i>
                              {moment(Number(platform.dCreated)).format('DD MMMM YYYY LT')}
                            </p>
                            <p className="menu-info">
                              <i className="me-2 icon-account"></i>
                              {platform?.oDisplayAuthor?.sDisplayName}
                            </p>
                          </div>
                          <div className="menu-footer">
                            <PermissionProvider isArray isAllowedTo={['FANTASY_EDIT_ARTICLE', 'FANTASY_PUBLISH_SAVE_CHANGES']}>
                              <Button
                                variant="link"
                                className="square icon-btn"
                                as={Link}
                                to={allRoutes.editFantasyTips(platFormType(platform.ePlatformType), platform._id)}
                              >
                                <i className="icon-create"></i>
                              </Button>
                            </PermissionProvider>
                            {selectedTab !== 'trash' &&
                              selectedTab !== 'completedMatches' &&
                              PLATFORM_TYPE.length > fantasy?.aFantasyTips?.length && (
                                <PermissionProvider isArray isAllowedTo={['FANTASY_PUBLISH_SAVE_CHANGES', 'FANTASY_EDIT_ARTICLE']}>
                                  <Button
                                    variant="link"
                                    className="square icon-btn"
                                    onClick={() =>
                                      handleAddCopy({
                                        _id: platform._id,
                                        selectedPlatform: fantasy?.aFantasyTips.map((p) => p.ePlatformType),
                                        type: 'copy'
                                      })
                                    }
                                  >
                                    <i className="icon-copy"></i>
                                  </Button>
                                </PermissionProvider>
                            )}
                            {!['r', 't', 's'].includes(platform?.eState) && (
                              <PermissionProvider isArray isAllowedTo={['FANTASY_DELETE_ARTICLE', 'FANTASY_PUBLISH_DELETE_ARTICLE']}>
                                <Button variant="link" className="square icon-btn" onClick={() => onDelete(platform._id)}>
                                  <i className="icon-delete"></i>
                                </Button>
                              </PermissionProvider>
                            )}
                            {platform?.eState === 't' && (
                              <PermissionProvider isArray isAllowedTo={['FANTASY_EDIT_ARTICLE', 'FANTASY_PUBLISH_SAVE_CHANGES']}>
                                <Button
                                  variant="link"
                                  className="square hover-none"
                                  size="sm"
                                  onClick={() =>
                                    handleChangeStatus({
                                      _id: platform._id,
                                      eState: 'd'
                                    })
                                  }
                                >
                                  <FormattedMessage id="restoreToDraft" />
                                </Button>
                              </PermissionProvider>
                            )}
                          </div>
                        </Dropdown.Menu>
                      </Dropdown>
                    )
                  })}
                {selectedTab === 'upcomingMatches' && PLATFORM_TYPE.length > fantasy?.aFantasyTips?.length && (
                  <PermissionProvider isAllowedTo="FANTASY_CREATE_ARTICLE">
                    <Button
                      className="over-view me-2 mt-2"
                      onClick={() =>
                        handleAddCopy({
                          _id: fantasy._id,
                          selectedPlatform: fantasy?.aFantasyTips.map((p) => p.ePlatformType),
                          type: 'add'
                        })
                      }
                    >
                      <FormattedMessage id="addFantasyPlatform" />
                    </Button>
                  </PermissionProvider>
                )}
              </div>
            )}
          </div>
        </td>
        <td></td>
      </tr>
    </>
  )
}

FantasyTipsItemRow.propTypes = {
  fantasy: PropTypes.object,
  selectedTab: PropTypes.string,
  onStatusChange: PropTypes.func,
  onPriorityChange: PropTypes.func,
  onDelete: PropTypes.func,
  handleAddCopy: PropTypes.func,
  handleChangeStatus: PropTypes.func
}

export default FantasyTipsItemRow
