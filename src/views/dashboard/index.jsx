import { useQuery } from '@apollo/client'
import { ARTICLE_DASHBOARD_COUNT, USER_COUNT } from 'graph-ql/dashboard/query'
import React, { useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import DashboardCard from 'shared/components/dashboard-card'
import Loading from 'shared/components/loading'

function Dashboard() {
  const [articleCountData, setArticleCountData] = useState([])
  const [userCountData, setUserCountData] = useState([])

  const { loading: articleCount } = useQuery(ARTICLE_DASHBOARD_COUNT, {
    onCompleted: (data) => {
      if (data && data?.getArticleDashboardCounts?.aCounts) {
        setArticleCountData(data?.getArticleDashboardCounts?.aCounts)
      }
    }
  })

  const { loading: userCount } = useQuery(USER_COUNT, {
    onCompleted: (data) => {
      if (data && data?.getUserDashboardCounts?.aCounts) {
        setUserCountData(data?.getUserDashboardCounts?.aCounts)
      }
    }
  })

  return (
    <>
      {(articleCount || userCount) && <Loading />}

      {articleCountData?.map((data) => {
        if (data?.eType === 'a') {
          return (
            <>
              <h3><FormattedMessage id="Articles" /></h3>
              <Row key={data?.eType}>
                <Col lg={4} md={4}>
                  <DashboardCard title={'ActiveArticle'} count={data?.nPublished} />
                </Col>
                <Col lg={4} md={4}>
                  <DashboardCard title={'TodayArticle'} count={data?.nPublishedToday} />
                </Col>
                <Col lg={4} md={4}>
                  <DashboardCard title={'MonthArticle'} count={data?.nPublishedCurrentMonth} />
                </Col>
              </Row>
            </>
          )
        } else if (data?.eType === 'lia') {
          return (
            <>
              <h3><FormattedMessage id="LiveEvents" /></h3>
              <Row key={data?.eType}>
                <Col lg={4} md={4}>
                  <DashboardCard title={'ActiveLiveEvents'} count={data?.nPublished} />
                </Col>
                <Col lg={4} md={4}>
                  <DashboardCard title={'TodayEvents'} count={data?.nPublishedToday} />
                </Col>
                <Col lg={4} md={4}>
                  <DashboardCard title={'MonthEvents'} count={data?.nPublishedCurrentMonth} />
                </Col>
              </Row>
            </>
          )
        } else if (data?.eType === 'v') {
          return (
            <>
              <h3><FormattedMessage id="Videos" /></h3>
              <Row key={data?.eType}>
                <Col lg={4} md={4}>
                  <DashboardCard title={'ActiveVideos'} count={data?.nPublished} />
                </Col>
                <Col lg={4} md={4}>
                  <DashboardCard title={'TodayVideos'} count={data?.nPublishedToday} />
                </Col>
                <Col lg={4} md={4}>
                  <DashboardCard title={'MonthVideos'} count={data?.nPublishedCurrentMonth} />
                </Col>
              </Row>
            </>
          )
        }
        return null
      })}

      {userCountData?.map((data) => {
        return (
          <>
          <h3><FormattedMessage id="Users" /></h3>
          <Row key={data?.eType}>
            <Col md={4} lg={4}>
              <DashboardCard title={'TotalVisitedUsers'} count={data?.nTodayTotalVisit}/>
            </Col>
          </Row>
          </>
        )
      })}

    </>
  )
}

export default Dashboard
