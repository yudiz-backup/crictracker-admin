import moment from 'moment'
import { S3_PREFIX, URL_PREFIX } from 'shared/constants'

export const convertToInstantArticle = (data) => {
  // function unwrapImages(htmlString) {
  //   const div = document.createElement('div')
  //   div.innerHTML = htmlString

  //   const images = div.getElementsByTagName('img')
  //   let i = 0
  //   while (i < images.length) {
  //     const imgParent = images[i].parentElement
  //     const img = images[i]
  //     div.insertBefore(img, imgParent)
  //     imgParent?.childNodes?.length === 0 && div.removeChild(imgParent)
  //     i++
  //   }
  //   return div.innerHTML
  // }

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <link rel="canonical" href="${URL_PREFIX}${data?.oCategory?.oSeo?.sSlug}/${data?.oSeo?.sSlug}/"/>
        <meta property="op:markup_version" content="v1.0">
        <meta property="op:generator:version" content="1.10.0" />
        <meta property="op:generator:application:version" content="4.2.1" />
        <meta property="op:generator:transformer:version" content="1.10.0" />
        <meta property="fb:use_automatic_ad_placement" content="enable=true ad_density=default" />
        <meta property="fb:article_style" content="CT" />
      </head>
      <body>
        <article>
          <header>
            <figure>
              <img src="${S3_PREFIX + data?.oImg?.sUrl}"/>
              ${data?.oImg?.sCaption ? `<figcaption>${data?.oImg?.sCaption}</figcaption>` : ''}
            </figure>
            <h1>${data?.sTitle}</h1>
            <time class="op-published" datetime="${moment(data?.dPublishDisplayDate || data?.dPublishDate).format()}">
              ${moment(Number(data?.dPublishDate)).format('MMMM DD h:mm a')}
            </time>
            <time class="op-modified" datetime="${moment(data?.dUpdated).format()}">
              ${moment(Number(data?.dUpdated)).format('MMMM DD h:mm a')}
            </time>
            ${data?.oDisplayAuthor ? (`
              <address>
                <a href="${getAuthorLine(data?.oDisplayAuthor).sSlug}" rel="${getAuthorLine(data?.oDisplayAuthor).isFb ? 'facebook' : 'nofollow'}">
                  ${data?.oDisplayAuthor?.sDisplayName}
                </a>
              </address>
            `) : ''
    }
            <h3 class="op-kicker">${data?.iCategoryId?.sName}</h3>
            <figure class="op-ad"><iframe src="https://www.facebook.com/adnw_request?placement=1547552395328474_1547552411995139&adtype=banner300x250" width="300" height="250"></iframe></figure>
          </header>
          <figure>
            <img src="${S3_PREFIX + data?.oImg?.sUrl}"/>
            ${data?.oImg?.sCaption ? `<figcaption>${data?.oImg?.sCaption}</figcaption>` : ''}
          </figure>
          ${data?.sContent}
          <figure class="op-tracker">
            <iframe>
              <script>
                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject'] = r;i[r] = i[r] || function(){(i[r].q=i[r].q || []).push(arguments)}, i[r].l=1 * new Date();a=s.createElement(o), m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
                ga('create', 'UA-49665093-1', 'auto');
                ga('send', 'pageview');
                ga('require', 'displayfeatures');
                ga('set', 'campaignSource', 'Facebook');
                ga('set', 'campaignMedium', 'Social Instant Article');
                ga('set', 'referrer', 'ia_document.referrer');
                ga('set', 'title', 'FBIA: '+ia_document.title);
                
              </script>
              <!-- Start Alexa Certify Javascript -->
              <script type="text/javascript">
                _atrk_opts = { atrk_acct:"jusnq1rcy520uW", domain:"crictracker.com",dynamic: true};
                (function() { var as = document.createElement('script'); as.type = 'text/javascript'; as.async = true; as.src = "https://certify-js.alexametrics.com/atrk.js"; var s = document.getElementsByTagName('script')[0];s.parentNode.insertBefore(as, s); })();
              </script>
              <noscript><img src="https://certify.alexametrics.com/atrk.gif?account=jusnq1rcy520uW" style="display:none" height="1" width="1" alt=""/></noscript>
              <!-- End Alexa Certify Javascript -->  
            </iframe>
          </figure>
          <footer><small>Copyright © ${new Date().getFullYear()} CricTracker. All rights reserved.</small></footer>
        </article>
      </body>
    </html>
  `
}

const getAuthorLine = (data) => {
  if (data?.aSLinks?.length) {
    const fb = data?.aSLinks.filter((link) => link.eSocialNetworkType === 'f')
    if (fb?.length) {
      return {
        sSlug: fb[0].sLink,
        isFb: true
      }
    } else {
      return {
        sSlug: `${URL_PREFIX}author/${data?.oSeo?.sSlug}/`,
        isFb: false
      }
    }
  } else {
    return {
      sSlug: `${URL_PREFIX}author/${data?.oSeo?.sSlug}/`,
      isFb: false
    }
  }
}
