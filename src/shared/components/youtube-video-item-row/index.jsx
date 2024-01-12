import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import Select from 'react-select'
import { FormattedMessage } from 'react-intl'

import PermissionProvider from '../permission-provider'
import { URL_PREFIX } from 'shared/constants'
import ToolTip from 'shared/components/tooltip'

function YouTubeVideoItemRow({
  youtubeVideo,
  index,
  selectedYoutubeVideo,
  onDelete,
  onStatusChange,
  onSelect,
  bulkPermission,
  actionPermission,
  handleSearch,
  handleScrollCategory,
  categoryList,
  isCategoryLoading,
  onChangeCategory,
  handleMenu
}) {
  const categoryValue = youtubeVideo.oCategory && {
    _id: youtubeVideo?.oCategory?._id,
    sName: youtubeVideo?.oCategory?.sName
  }
  return (
    <tr key={youtubeVideo._id}>
      <PermissionProvider isAllowedTo={bulkPermission} isArray>
        <td>
          <Form.Check
            type="checkbox"
            id={selectedYoutubeVideo[index]?._id}
            name={selectedYoutubeVideo[index]?._id}
            checked={selectedYoutubeVideo[index]?.value}
            className="form-check m-0"
            onChange={onSelect}
            label="&nbsp;"
          />
        </td>
      </PermissionProvider>
      <td>{youtubeVideo.sTitle}</td>
      <td className="category-dropdown-td">
        <div className="category-dropdown">
          <Select
            value={categoryValue || []}
            options={categoryList}
            getOptionLabel={(option) => option.sName}
            getOptionValue={(option) => option._id}
            className="react-select"
            classNamePrefix="select"
            onInputChange={(value, action) => handleSearch(value, action, 'category')}
            isSearchable={true}
            isClearable
            isLoading={isCategoryLoading}
            onMenuScrollToBottom={handleScrollCategory}
            onChange={(e) => {
              onChangeCategory(e, youtubeVideo._id)
            }}
            onMenuOpen={() => handleMenu(youtubeVideo._id)}
          />
        </div>
      </td>
      <td>
        <PermissionProvider isAllowedTo="UPDATE_PLAYLIST">
          <ToolTip toolTipMessage={<FormattedMessage id="toggle"/>}>
            <Form.Check
              type="switch"
              name={youtubeVideo._id}
              className="d-inline-block me-1"
              checked={youtubeVideo.eStatus === 'a'}
              onChange={onStatusChange}
            />
          </ToolTip>
        </PermissionProvider>
        <ToolTip toolTipMessage={<FormattedMessage id="openInNewTab"/>}>
          <a
            className={`link ${youtubeVideo?.oCategory?.oSeo?.sSlug ? '' : 'disabled'}`}
            disabled
            href={`${URL_PREFIX}${youtubeVideo?.oCategory?.oSeo?.sSlug}/videos`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="link" className="square icon-btn">
              <i className="icon-language d-block" />
            </Button>
          </a>
        </ToolTip>
      </td>
    </tr>
  )
}
YouTubeVideoItemRow.propTypes = {
  youtubeVideo: PropTypes.object,
  index: PropTypes.number,
  selectedYoutubeVideo: PropTypes.array,
  bulkPermission: PropTypes.array,
  actionPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSelect: PropTypes.func,
  handleSearch: PropTypes.func,
  handleScrollCategory: PropTypes.func,
  categoryList: PropTypes.array,
  isCategoryLoading: PropTypes.bool,
  onChangeCategory: PropTypes.func,
  handleMenu: PropTypes.func
}
export default YouTubeVideoItemRow
