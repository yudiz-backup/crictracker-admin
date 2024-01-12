import React, { Suspense, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'

import logo from 'assets/images/logo.png'
import topImage from 'assets/images/ground.jpeg'
import matchImage from 'assets/images/match.jpeg'
import { allRoutes } from 'shared/constants/AllRoutes'

function AuthLayout({ childComponent }) {
  const [text, setText] = useState(slogan[Math.floor(Math.random() * slogan.length)])
  useEffect(() => {
    const interval = setInterval(() => {
      setText(slogan[Math.floor(Math.random() * slogan.length)])
    }, 10000)
    return () => {
      clearInterval(interval)
    }
  }, [])
  return (
    <div className="auth-main d-flex align-items-center">
      <div className="top-img">
        <img src={topImage} alt="Ground" className="h-100 w-100 cover" />
      </div>
      <div className="child-box">
        <Link to={allRoutes.login}>
          <img src={logo} alt="CricTracker" />
        </Link>
        <Suspense
          fallback={
            <div>
              <FormattedMessage id="loading" />
              ...
            </div>
          }
        >
          {childComponent}
        </Suspense>
      </div>
      <div className="slogan-box d-none d-lg-flex align-items-center justify-content-center">
        <h1 className="txt d-flex align-items-center justify-content-center">
          <span>
            “{text.txt}” <br />– {text.author}.
          </span>
        </h1>
      </div>
      <div className="bottom-img">
        <img src={matchImage} alt="Match Image" className="h-100 w-100 cover" />
      </div>
    </div>
  )
}

AuthLayout.propTypes = {
  childComponent: PropTypes.node.isRequired
}

const slogan = [
  { txt: <FormattedMessage id="homePageSlogan1" />, author: <FormattedMessage id="mahendraSinghDhoni" /> },
  { txt: <FormattedMessage id="homePageSlogan2" />, author: <FormattedMessage id="kapilDev" /> },
  { txt: <FormattedMessage id="homePageSlogan3" />, author: <FormattedMessage id="rahulDravid" /> },
  { txt: <FormattedMessage id="homePageSlogan4" />, author: <FormattedMessage id="sachinTendulkar" /> },
  { txt: <FormattedMessage id="homePageSlogan5" />, author: <FormattedMessage id="adamGilchrist" /> },
  { txt: <FormattedMessage id="homePageSlogan6" />, author: <FormattedMessage id="brendonMccullum" /> },
  { txt: <FormattedMessage id="homePageSlogan7" />, author: <FormattedMessage id="souravGanguly" /> }
]

export default AuthLayout
