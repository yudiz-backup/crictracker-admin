import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import { spreadOutText } from 'shared/utils'
import { allRoutes } from 'shared/constants/AllRoutes'
import ToolTip from 'shared/components/tooltip'
import PermissionProvider from 'shared/components/permission-provider'
import { ToastrContext } from 'shared/components/toastr'
import { TOAST_TYPE } from 'shared/constants'

function QuizItemRow({ item, index, selectedItem, onDelete, onSelect, bulkPermission, actionPermission }) {
  const { dispatch } = useContext(ToastrContext)
  function copyPermaLink() {
    try {
      navigator.clipboard.writeText(item?._id)
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: <FormattedMessage id="copied" />, type: TOAST_TYPE.Success, btnTxt: <FormattedMessage id="close" /> }
      })
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <tr key={item?._id}>
      <PermissionProvider isAllowedTo={bulkPermission} isArray>
        <td>
          <Form.Check
            type="checkbox"
            id={selectedItem[index]?._id}
            name={selectedItem[index]?._id}
            checked={selectedItem[index]?.value}
            className="form-check m-0"
            onChange={onSelect}
            label="&nbsp;"
          />
        </td>
      </PermissionProvider>
      <td>
        {spreadOutText(item?._id)}
        <Button variant="link" className="square icon-btn" onClick={copyPermaLink}>
          <i className="icon-copy d-block" />
        </Button>
      </td>
      <td>{item?.sTitle}</td>
      <td>{item?.nTotalVotes || 0}</td>
      <td>
        <PermissionProvider isAllowedTo={actionPermission} isArray>
          <PermissionProvider isAllowedTo="EDIT_QUIZ">
            <ToolTip toolTipMessage={<FormattedMessage id="edit" />}>
              <Button variant="link" className="square icon-btn" as={Link} to={allRoutes.editQuiz(item?._id)}>
                <i className="icon-create d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
          {item?.eStatus !== 'd' && (
            <PermissionProvider isAllowedTo="DELETE_QUIZ">
              <ToolTip toolTipMessage={<FormattedMessage id="delete" />}>
                <Button variant="link" className="square icon-btn" onClick={() => onDelete(item?._id)}>
                  <i className="icon-delete d-block" />
                </Button>
              </ToolTip>
            </PermissionProvider>
          )}
        </PermissionProvider>
      </td>
    </tr>
  )
}
QuizItemRow.propTypes = {
  item: PropTypes.object,
  index: PropTypes.number,
  selectedItem: PropTypes.array,
  bulkPermission: PropTypes.array,
  actionPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onSelect: PropTypes.func
}
export default QuizItemRow
