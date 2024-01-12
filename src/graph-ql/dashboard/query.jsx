import { gql } from '@apollo/client'

export const ARTICLE_DASHBOARD_COUNT = gql`
  query GetArticleDashboardCounts {
    getArticleDashboardCounts {
      aCounts {
        eType
        nPublished
        nPublishedCurrentMonth
        nPublishedToday
      }
    }
  }
`

export const USER_COUNT = gql`
query GetUserDashboardCounts {
    getUserDashboardCounts {
      aCounts {
        eType
        nTodayTotalVisit
      }
    }
  }
`
