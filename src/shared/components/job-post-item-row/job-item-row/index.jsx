import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl'

import { convertDate, getDesignationInJob } from 'shared/utils'
import { allRoutes } from 'shared/constants/AllRoutes'
import PermissionProvider from 'shared/components/permission-provider'
import { URL_PREFIX } from 'shared/constants'
import ToolTip from 'shared/components/tooltip'

function JobPostItemRow({ job, index, selectedJob, onDelete, onStatusChange, onSelect, bulkPermission, actionPermission }) {
  return (
    <tr key={job._id}>
      <PermissionProvider isAllowedTo={bulkPermission} isArray>
        <td>
          <Form.Check
            type="checkbox"
            id={selectedJob[index]?._id}
            name={selectedJob[index]?._id}
            checked={selectedJob[index]?.value}
            className="form-check m-0"
            onChange={onSelect}
            label="&nbsp;"
          />
        </td>
      </PermissionProvider>
      <td>
        <p className="title">{job.eDesignation ? getDesignationInJob(job.eDesignation) : '-'}</p>
        <p className="date">
          <span>
            <FormattedMessage id="d" />
          </span>
          {convertDate(job.dCreated)}
          <span>
            <FormattedMessage id="lm" />
          </span>
          {convertDate(job.dUpdated)}
        </p>
      </td>
      <td>{job.sTitle ? job.sTitle : '-'}</td>
      <td>{`${job?.fExperienceFrom} - ${job?.fExperienceTo} ${useIntl().formatMessage({ id: 'years' })}`}</td>
      <td>{`${job?.fSalaryFrom} - ${job?.fSalaryTo} ${useIntl().formatMessage({ id: 'lpa' })}`}</td>
      <td>{job?.nEnquiryCount}</td>
      <td>
        <PermissionProvider isAllowedTo={actionPermission} isArray>
          <PermissionProvider isAllowedTo="EDIT_JOB">
            <ToolTip toolTipMessage={<FormattedMessage id='toggle' />}>
              <Form.Check
                type="switch"
                name={job._id}
                className="d-inline-block me-1"
                checked={job.eStatus === 'a'}
                onChange={onStatusChange}
              />
            </ToolTip>
          </PermissionProvider>
          <PermissionProvider isAllowedTo="GET_JOB">
            <ToolTip toolTipMessage={<FormattedMessage id='view' />}>
              <Button variant="link" className="square icon-btn" as={Link} to={allRoutes.editJobPost('detail-job', job._id)}>
                <i className="icon-visibility d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
          <PermissionProvider isAllowedTo="EDIT_JOB">
            <ToolTip toolTipMessage={<FormattedMessage id='edit' />}>
              <Button variant="link" className="square icon-btn" as={Link} to={allRoutes.editJobPost('edit-job', job._id)}>
                <i className="icon-create d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
          <ToolTip toolTipMessage={<FormattedMessage id='openInNewTab' />}>
            <a className="link" href={`${URL_PREFIX}careers/${job?.oSeo?.sSlug}`} target="_blank" rel="noreferrer">
              <Button variant="link" className="square icon-btn">
                <i className="icon-language d-block" />
              </Button>
            </a>
          </ToolTip>
          <PermissionProvider isAllowedTo="DELETE_JOB">
            <ToolTip toolTipMessage={<FormattedMessage id='delete' />}>
              <Button variant="link" className="square icon-btn" onClick={() => onDelete(job._id)}>
                <i className="icon-delete d-block" />
              </Button>
            </ToolTip>
          </PermissionProvider>
        </PermissionProvider>
      </td>
    </tr>
  )
}
JobPostItemRow.propTypes = {
  job: PropTypes.object,
  index: PropTypes.number,
  selectedJob: PropTypes.array,
  bulkPermission: PropTypes.array,
  actionPermission: PropTypes.array,
  onDelete: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSelect: PropTypes.func
}
export default JobPostItemRow
