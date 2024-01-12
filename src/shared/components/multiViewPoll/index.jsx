/* eslint-disable no-unused-vars */
import React from 'react'
import PropTypes from 'prop-types'
import useModal from 'shared/hooks/useModal'

const SimplePollView = React.lazy(() => import('shared/components/multiViewPoll/simplePollView'))
const QuePollView = React.lazy(() => import('shared/components/multiViewPoll/quePollView'))
const ReactionPollView = React.lazy(() => import('shared/components/multiViewPoll/reactionPollView'))
const VSPollView = React.lazy(() => import('shared/components/multiViewPoll/vsPollView'))
const NewAddPoll = React.lazy(() => import('views/widgets/global-poll/new-add-poll'))
const PopUpModal = React.lazy(() => import('shared/components/pop-up-modal'))

function MultiViewPoll({ data, handleUpdatePoll }) {
  if (data?.aSlides?.length) {
    const { isShowing, toggle, closeModal } = useModal()

    function getPoll(poll) {
      if ((poll.eSlideType === 'sp' || poll.eSlideType === 'ip')) {
        return <SimplePollView poll={poll} toggle={toggle} />
      } else if (poll.eSlideType === 'mp') {
        return <QuePollView poll={poll} toggle={toggle}/>
      } else if (poll.eSlideType === 'vs') {
        return <VSPollView poll={poll} toggle={toggle} />
      } else if (poll.eSlideType === 'rp') {
        return <ReactionPollView poll={poll} toggle={toggle} />
      } else return null
    }

    return (
      <>
        {getPoll(data?.aSlides[0])}
        <PopUpModal title="Edit Poll" size='lg' isOpen={isShowing} onClose={closeModal} isCentered>
          <NewAddPoll pollId={data?._id} asComponent onSubmit={(e) => {
            handleUpdatePoll && handleUpdatePoll(e)
            closeModal()
          }} />
        </PopUpModal>
      </>
    )
  } else return null
}
MultiViewPoll.propTypes = {
  data: PropTypes.object,
  handleUpdatePoll: PropTypes.func
}
export default MultiViewPoll
