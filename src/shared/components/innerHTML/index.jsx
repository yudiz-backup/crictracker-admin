import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

function InnerHTML({ html, ...rest }) {
  const ref = useRef()
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const parsedHTML = document.createRange().createContextualFragment(html)
      ref.current.innerHTML = ''
      ref.current.append(parsedHTML)
    }
  }, [html])

  return <div {...rest} ref={ref} />
}

InnerHTML.propTypes = {
  html: PropTypes.string
}

export default InnerHTML
