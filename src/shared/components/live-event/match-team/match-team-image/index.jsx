import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import CommonInput from 'shared/components/common-input'
import { Button } from 'react-bootstrap'
import MediaGallery from 'shared/components/media-gallery'
import useModal from 'shared/hooks/useModal'
import { useIntl } from 'react-intl'
import { S3_PREFIX } from 'shared/constants'

function MatchTeamImage({ register, setValue, team, getValues, isNotPermitted }) {
  const { isShowing, toggle } = useModal()
  const [imageUrl, setImageUrl] = useState()

  useEffect(() => {
    setImageUrl(getValues()?.oTeams?.[`oTeam${team}`]?.sLogoUrl)
  }, [getValues()])

  const handleTeamImage = (data) => {
    toggle()
    setValue(`oTeams.oTeam${team}.sLogoUrl`, data?.sUrl)
    setImageUrl(data?.sUrl)
  }
  return (
    <>
      <div className='team-row w-100 d-flex align-items-start'>
        {
          imageUrl && (
            <img
              src={`${S3_PREFIX}${imageUrl}`}
              alt='menu image'
              width={37}
              height={37}
              className="rounded square"
              style={{ objectFit: 'cover', backgroundColor: '#F2F2F2' }}
            />
          )
        }
        <Button disabled={isNotPermitted} variant="light" className='w-25 square icon-btn' onClick={() => toggle()}>
            <i className="icon-image d-block"></i>
        </Button>
        <div className='w-100'>
          <CommonInput
            placeholder={`${useIntl().formatMessage({ id: 'team' })} ${team}`}
            type="text"
            disabled={isNotPermitted}
            register={register}
            name={`oTeams.oTeam${team}.sName`}
          />
        </div>
      </div>
      <MediaGallery overRidePermission show={isShowing} handleHide={toggle} handleData={handleTeamImage}/>
    </>
  )
}
MatchTeamImage.propTypes = {
  register: PropTypes.func,
  setValue: PropTypes.func,
  getValues: PropTypes.func,
  isNotPermitted: PropTypes.bool,
  team: PropTypes.number

}
export default MatchTeamImage
