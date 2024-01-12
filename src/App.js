import React, { Suspense, useEffect, useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { createBrowserHistory } from 'history'

import { ToastrContext, Toastr } from 'shared/components/toastr'
import Loading from 'shared/components/loading'
import { GlobalEventsContext, GlobalEventsReducer } from 'shared/components/global-events'
const Routes = React.lazy(() => import('routes'))

export const history = createBrowserHistory()

function App() {
  const [state, dispatch] = React.useReducer(GlobalEventsReducer, {})
  const { state: toastState } = React.useContext(ToastrContext)
  const [toast, setToast] = useState({})

  useEffect(() => {
    if (toastState) {
      setToast(toastState)
    }
    // console.log(process.env)
  }, [toastState])

  return (
    <GlobalEventsContext.Provider
      value={{
        state,
        dispatch
      }}
    >
      <Router history={history}>
        <Suspense fallback={<Loading />}>
          <Routes />
        </Suspense>
        {toast.message && <Toastr type={toast.type} msg={toast.message} btnTxt={toast.btnTxt} />}
      </Router>
    </GlobalEventsContext.Provider>
  )
}

export default App
