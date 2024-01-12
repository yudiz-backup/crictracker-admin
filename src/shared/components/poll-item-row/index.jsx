import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import { convertDateTimeAMPM, spreadOutText } from 'shared/utils'
import { allRoutes } from 'shared/constants/AllRoutes'
import ToolTip from 'shared/components/tooltip'
import { TOAST_TYPE } from 'shared/constants'
import PermissionProvider from 'shared/components/permission-provider'
import { ToastrContext } from 'shared/components/toastr'

function PollItemRow({ poll, index, selectedPoll, onDelete, onSelect, bulkPermission, actionPermission }) {
  const { dispatch } = useContext(ToastrContext)
  function copyPermaLink() {
    try {
      navigator.clipboard.writeText(poll?._id)
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: <FormattedMessage id="pollIdCopied" />, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
      })
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }
  const totalVotes = poll?.aSlides?.reduce((sum, item) => sum + item.nTotalVote, 0)

  return (
    <tr key={poll?._id}>
      <PermissionProvider isAllowedTo={bulkPermission} isArray>
        <td>
          <Form.Check
            type="checkbox"
            id={selectedPoll[index]?._id}
            name={selectedPoll[index]?._id}
            checked={selectedPoll[index]?.value}
            className="form-check m-0"
            onChange={onSelect}
            label="&nbsp;"
          />
        </td>
      </PermissionProvider>
      <td>
        {spreadOutText(poll?._id)}
        <Button variant="link" className="square icon-btn" onClick={copyPermaLink}>
          <i className="icon-copy d-block" />
        </Button>
      </td>
      <td>
        <p className="title">{poll?.sMatchPollTitle || poll?.sTitle}</p>
        <p className="date">
          <span>
            <FormattedMessage id="start" />
          </span>
          {convertDateTimeAMPM(poll?.dStartDate)}
          <span>
            <FormattedMessage id="end" />
          </span>
          {convertDateTimeAMPM(poll?.dEndDate)}
        </p>
      </td>
      <td className='text-center'>
        {/* {Math.max(...poll?.aField?.map((field) => field?.nVote))} / {poll?.nTotalVote} */}
        {totalVotes}
      </td>
      <PermissionProvider isAllowedTo={actionPermission} isArray>
        <td>
          <PermissionProvider isAllowedTo="EDIT_POLL">
            <ToolTip toolTipMessage={<FormattedMessage id="edit" />}>
              <Button variant="link" className="square icon-btn" as={Link} to={allRoutes.editNewPoll(poll?._id)}>
                <i className="icon-create d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
          <PermissionProvider isAllowedTo="DELETE_POLL">
            <ToolTip toolTipMessage={<FormattedMessage id="delete" />}>
              <Button variant="link" className="square icon-btn" onClick={() => onDelete(poll?._id)}>
                <i className="icon-delete d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
        </td>
      </PermissionProvider>
    </tr>
  )
}
PollItemRow.propTypes = {
  poll: PropTypes.object,
  index: PropTypes.number,
  selectedPoll: PropTypes.array,
  bulkPermission: PropTypes.array,
  actionPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func
}
export default PollItemRow
