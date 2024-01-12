import { allRoutes } from 'shared/constants/AllRoutes'

export const sidebarConfig = [
  {
    path: allRoutes.dashboard,
    icon: 'icon-home',
    title: 'Home'
  },
  {
    path: allRoutes.tags,
    icon: 'icon-dashboard',
    title: 'Management',
    children: [
      { path: allRoutes.tags, title: 'Tags' },
      { path: allRoutes.categories, title: 'Categories', isAllowedTo: 'LIST_CATEGORY' },
      { path: allRoutes.players, title: 'Players', isAllowedTo: 'LIST_PLAYER_TAGS' },
      { path: allRoutes.teams, title: 'Teams', isAllowedTo: 'LIST_TEAM_TAGS' }
    ]
  },
  {
    path: allRoutes.articleList,
    icon: 'icon-feed',
    title: 'Article',
    isArray: true,
    isAllowedTo: ['LIST_ARTICLE', 'FANTASY_LIST_ARTICLE', 'LIST_LIVEEVENT'],
    children: [
      { path: allRoutes.articleList, title: 'Article', isAllowedTo: 'LIST_ARTICLE' },
      { path: allRoutes.fantasyTipsList, title: 'Fantasy Tips', isAllowedTo: 'FANTASY_LIST_ARTICLE' },
      { path: allRoutes.liveEvents, title: 'Live Events', isAllowedTo: 'LIST_LIVEEVENT' },
      { path: allRoutes.commentary, title: 'Commentary', isAllowed: 'ADD_CUSTOM_COMMENTARY' }
    ]
  },
  {
    path: allRoutes.media,
    icon: 'icon-image',
    title: 'Media Gallery',
    isAllowedTo: 'VIEW_MEDIA_GALLERY'
  },
  {
    path: allRoutes.webStories,
    icon: 'icon-web-stories',
    title: 'Web-Stories',
    isAllowedTo: 'LIST_WEB_STORY'
  },
  {
    path: allRoutes.roles,
    icon: 'icon-settings',
    title: 'Settings',
    isArray: true,
    isAllowedTo: [
      'LIST_ROLE',
      'LIST_SUBADMIN',
      'VIEW_CURRENT_SERIES',
      'LIST_USER',
      'LIST_MIGRATION_TAG',
      'LIST_PLAYLIST',
      'LIST_SEO_REDIRECT',
      'LIST_SEO',
      'LIST_JOB',
      'LIST_ENQUIRY',
      'LIST_CMS_PAGE',
      'UPDATE_ICC_RANKINGS',
      'VIEW_ADS_TXT',
      'VIEW_MENU_ARRANGEMENT',
      'VIEW_HOME_PAGE_ARTICLE',
      'VIEW_MINISCORECARD_PRIO'
    ],
    children: [
      { path: allRoutes.roles, title: 'Role', isAllowedTo: 'LIST_ROLE' },
      { path: allRoutes.subAdmins, title: 'Sub Admin', isAllowedTo: 'LIST_SUBADMIN' },
      { path: allRoutes.endUsers, title: 'End Users', isAllowedTo: 'LIST_USER' },
      { path: allRoutes.tagMigrationManagement, title: 'Tag Migration Management', isAllowedTo: 'LIST_MIGRATION_TAG' },
      { path: allRoutes.youtubeVideo, title: 'Youtube Video', isAllowedTo: 'LIST_PLAYLIST' },
      { path: allRoutes.seoRedirects, title: 'SEO Redirects', isAllowedTo: 'LIST_SEO_REDIRECT' },
      { path: allRoutes.seo, title: 'SEO', isAllowedTo: 'LIST_SEO' },
      { path: allRoutes.jobPost, title: 'Job Post', isArray: true, isAllowedTo: ['LIST_ENQUIRY', 'LIST_JOB'] },
      { path: allRoutes.cms, title: 'CMS Pages', isAllowedTo: 'LIST_CMS_PAGE' },
      { path: allRoutes.syncStats, title: 'Sync Stats', isAllowedTo: 'UPDATE_ICC_RANKINGS' },
      { path: allRoutes.ads, title: 'Ads.txt', isAllowedTo: 'VIEW_ADS_TXT' },
      { path: allRoutes.arrangeMenu, title: 'Arrange Menu', isAllowedTo: 'VIEW_MENU_ARRANGEMENT' },
      { path: allRoutes.homePageArticle, title: 'Home Page Article', isAllowedTo: 'VIEW_HOME_PAGE_ARTICLE' },
      { path: allRoutes.miniScorecardPriority, title: 'Mini Scorecard Priority', isAllowedTo: 'VIEW_MINISCORECARD_PRIO' },
      { path: allRoutes.feed, title: 'Feed' }
    ]
  },
  {
    path: allRoutes.poll,
    icon: 'icon-poll',
    title: 'Poll',
    isArray: true,
    isAllowedTo: ['VIEW_POLL', 'LIST_QUIZ'],
    children: [
      { path: allRoutes.poll, title: 'Poll', isAllowedTo: 'VIEW_POLL' },
      { path: allRoutes.quizList, title: 'Quiz', isAllowedTo: 'LIST_QUIZ' }
    ]
  },
  {
    path: allRoutes.homePageWidgets,
    icon: 'icon-widget',
    title: 'Widgets Management',
    isAllowedTo: ['EDIT_HOME_WIDGETS', 'VIEW_CURRENT_SERIES'],
    isArray: true,
    children: [
      { path: allRoutes.homePageWidgets, title: 'Home Page Widgets', isAllowedTo: 'EDIT_HOME_WIDGETS' },
      { path: allRoutes.currentSeries, title: 'Current Series', isAllowedTo: 'VIEW_CURRENT_SERIES' }
    ]
  },
  {
    path: allRoutes.feedbacks,
    icon: 'icon-help',
    title: 'Help',
    isAllowedTo: ['LIST_FEEDBACK', 'LIST_CONTACT'],
    isArray: true,
    children: [
      { path: allRoutes.feedbacks, title: 'Feedbacks', isAllowedTo: 'LIST_FEEDBACK' },
      { path: allRoutes.contacts, title: 'Contacts', isAllowedTo: 'LIST_CONTACT' }
    ]
  },
  {
    path: allRoutes.articleComments,
    icon: 'icon-comment-rounded',
    title: 'Comments',
    isAllowedTo: ['LIST_COMMENT'],
    isArray: true,
    children: [
      { path: allRoutes.articleComments, title: 'Article Comments', isAllowedTo: 'LIST_COMMENT' },
      { path: allRoutes.fantasyArticleComments, title: 'Fantasy Article Comments', isAllowedTo: 'LIST_COMMENT' }
    ]
  }
]
