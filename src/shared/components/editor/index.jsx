/* eslint-disable no-useless-escape */
import React, { useContext, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Editor } from '@tinymce/tinymce-react'
import { Controller } from 'react-hook-form'
import { useMutation } from '@apollo/client'
import { FormattedMessage } from 'react-intl'
import { Form } from 'react-bootstrap'

import { validationErrors } from 'shared/constants/ValidationErrors'
import { GENERATE_PRE_SIGNED } from 'graph-ql/generate-pre-signed-url'
import { uploadImage } from 'shared/functions/PreSignedData'
import { S3_PREFIX, TOAST_TYPE } from 'shared/constants'
import { convertUrlToEmbed } from 'shared/lib/to-embed'
import { HTMLParser, graphQlToRest, removeStylesFromString } from 'shared/utils'
import { ToastrContext } from '../toastr'
import useModal from 'shared/hooks/useModal'
import MediaGallery from '../media-gallery'
import { GET_SERVER_URL } from 'graph-ql/common/query'
import LinkPreview from '../link-preview'
import PollPopup from '../poll-popup-modal'

const { renderToStaticMarkup } = require('react-dom/server')
const SocialLinkPreview = React.lazy(() => import('shared/components/social-link-preview'))

function TinyEditor({
  control,
  error,
  register,
  required,
  initialValue,
  values,
  disabled,
  name,
  onlyTextFormatting,
  setValue,
  isLiveArticle,
  togglePoll,
  commentary
}) {
  const [content, setContent] = useState()
  const pollIdRef = useRef(null)
  const editorRef = useRef(null)
  const [generatePreSignedUrl] = useMutation(GENERATE_PRE_SIGNED)
  const { isShowing, toggle } = useModal()
  const { isShowing: isPollShowing, toggle: togglePollShow, closeModal } = useModal()
  const { dispatch } = useContext(ToastrContext)
  async function handleImageUpload(callback, success, meta) {
    const payload = [
      {
        sFileName: callback.blob()?.name?.split('.')[0] || '',
        sContentType: callback.blob().type,
        sType: 'articleEditorMedia'
      }
    ]
    const { data } = await generatePreSignedUrl({ variables: { generatePreSignedUrlInput: payload } })
    const uploadData = [
      {
        sUploadUrl: data.generatePreSignedUrl[0].sUploadUrl,
        file: callback.blob()
      }
    ]
    uploadImage(uploadData)
      .then(() => {
        success(S3_PREFIX + data.generatePreSignedUrl[0].sS3Url)
      })
      .catch((err) => {
        console.log('Image upload error', err)
      })
    return S3_PREFIX + data.generatePreSignedUrl[0].sS3Url
  }

  const handlePlugins = () => {
    if (onlyTextFormatting) {
      return 'link code paste table noneditable media'
    } else if (isLiveArticle) {
      return 'image link media wordcount anchor autolink autoresize autosave codesample emoticons image imagetools nonbreaking noneditable pagebreak quickbars searchreplace tabfocus table'
    } else {
      return 'lists link code preview charmap image media wordcount anchor fullscreen autolink autoresize autosave codesample directionality emoticons help hr image imagetools importcss insertdatetime legacyoutput nonbreaking noneditable pagebreak paste print quickbars searchreplace tabfocus template textpattern toc visualblocks visualchars table'
    }
  }
  // fontfamily fontsize blocks
  const handleToolbar = () => {
    if (onlyTextFormatting) {
      return 'fontsize backcolor forecolor charmap image media preview fullscreen anchor autolink autoresize restoredraft codesample ltr rtl emoticons hr pastetext insertdatetime nonbreaking pagebreak print quicktable searchreplace template toc visualblocks visualchars myCustomToolbarButton mediaGallery'
    } else if (isLiveArticle) {
      return 'image media preview emoticons mediaGallery embedLink removeformat linkPoll'
    } else {
      return 'fontsize backcolor forecolor charmap image media preview fullscreen anchor autolink autoresize restoredraft codesample ltr rtl emoticons hr pastetext insertdatetime nonbreaking pagebreak print quicktable searchreplace template toc visualblocks visualchars myCustomToolbarButton help mediaGallery addTweet addInstagram adsButton liveArticle linkPoll'
    }
  }

  const handleDefaultToolbar = () => {
    if (isLiveArticle) {
      return 'blocks bold italic blockquote underline strikethrough bullist numlist outdent indent alignleft aligncenter alignright alignjustify link code undo redo'
    } else {
      return 'blocks bold italic blockquote underline strikethrough bullist numlist outdent indent alignleft aligncenter alignright alignjustify link code undo redo'
    }
  }

  useEffect(() => {
    if (initialValue && !content) {
      setContent(initialValue)
    }
  }, [initialValue])

  const handleMediaGalary = (data, tab) => {
    editorRef.current &&
      editorRef.current.insertContent(
        renderToStaticMarkup(
          <figure className="image">
            <img src={tab === 'gifs' ? `${data?.sUrl}` : `${S3_PREFIX}${data?.sUrl}`} alt={data?.sText} />
            <figcaption>{data?.sCaption}</figcaption>
          </figure>
        )
      )
    toggle()
  }

  // const handleTweet = (data) => renderToStaticMarkup(<CustomTweet post={data} />)
  const handleLinkPreview = (data, url) => renderToStaticMarkup(<LinkPreview data={data} url={url} />)

  async function handleSocialPreview(type) {
    let inputContent = values('social-url-preview')
    if (inputContent && !inputContent.trim()) return
    if (type === 'twitter') {
      const data = await convertUrlToEmbed(inputContent)
      editorRef.current.insertContent(data)
      setValue('social-url-preview', '')
    } else if (type === 'instagram') {
      const data = await convertUrlToEmbed(inputContent)
      editorRef.current.insertContent(data)
      setValue('social-url-preview', '')
    } else if (type === 'youtube') {
      const youtubeURL = 'https://www.youtube.com/embed/'
      inputContent = inputContent.trim()
      const youtubeRegEx = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const youtubeURLMatch = inputContent.match(youtubeRegEx)

      if (youtubeURLMatch && youtubeURLMatch[2].length === 11) {
        const embedUrl = youtubeURL + youtubeURLMatch[2]
        editorRef.current.insertContent(renderToStaticMarkup(<iframe src={embedUrl} />))
      }
      setValue('social-url-preview', '')
    } else {
      dispatch({
        type: 'SHOW_TOAST',
        payload: { message: <FormattedMessage id="invalidUrl" />, type: TOAST_TYPE.Error }
      })
    }
  }

  function handlePollSubmit(data, isAttach) {
    if (isAttach && !data?.value) {
      data.focus()
    } else {
      editorRef.current.insertContent(
        renderToStaticMarkup(<div className="ct-poll mceNonEditable" id={isAttach ? data?.value : data?.oData?._id}></div>)
      )
      // editorRef.current.insertContent(`<ct-poll class="ct-poll mceNonEditable" id="${isAttach ? data?.value : data?.oData?._id}">&nbsp;&nbsp;</ct-poll>`)
      isLiveArticle && setValue('iPollId', isAttach ? data?.value : data?.oData?._id)
      closeModal()
    }
  }

  function handleModal(editor, media, label) {
    return {
      title: `Add ${media}`,
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            name: 'type',
            label: `${media} ${label}`,
            flex: true
          }
        ]
      },
      onSubmit: async (api) => {
        const inputContent = api.getData().type
        const instaDomain = 'https://www.instagram.com/'
        if (media === 'Tweet' && inputContent?.length > 0) {
          const data = await convertUrlToEmbed(inputContent)
          editor.insertContent(data)
          api.close()
          // fetch(`${ARTICLE_BASE_URL}api/generate-twitter-data/${inputContent}`, {
          //   method: 'post',
          //   headers: { 'Content-Type': 'application/json' }
          // }).then((response) => {
          //   return response.json()
          // }).then((data) => {
          //   if (data?.message === 'Something went wrong') {
          //     dispatch({
          //       type: 'SHOW_TOAST',
          //       payload: { message: data?.message, type: TOAST_TYPE.Error }
          //     })
          //   } else {
          //     data && editor.insertContent(handleTweet(data))
          //     api.close()
          //   }
          // })
        } else if (media === 'Instagram' && inputContent?.includes(instaDomain) && inputContent?.length > 0) {
          const data = await convertUrlToEmbed(inputContent)
          editor.insertContent(data)
          api.close()
        } else if (media === 'Link Preview' && inputContent?.length > 0) {
          const html = await graphQlToRest(GET_SERVER_URL, { sUrl: inputContent }, 'getFrontUrlData')
          const data = HTMLParser(html)
          data && editor.insertContent(handleLinkPreview(data, inputContent))
          api.close()
        } else if (media === 'LiveEvent' && inputContent?.length > 0) {
          editor.insertContent(
            renderToStaticMarkup(
              <div className="ct-liveBlog mceNonEditable" id="ct-liveBlog">
                {inputContent}
              </div>
            )
          )
          api.close()
        } else {
          dispatch({
            type: 'SHOW_TOAST',
            payload: { message: <FormattedMessage id={`inValid${media}`} />, type: TOAST_TYPE.Error }
          })
        }
      },
      buttons: [
        {
          text: 'Close',
          type: 'cancel',
          onclick: 'close'
        },
        {
          text: 'Insert',
          type: 'submit',
          primary: true,
          enabled: true
        }
      ]
    }
  }
  function handleLiveArticleModal(editor, media, label) {
    const checkContent = editor.getContent()

    const contentToHtml = HTMLParser(checkContent)
    const eventId = contentToHtml?.getElementById('ct-liveBlog')
    return {
      title: `Add ${media}`,
      body: {
        type: 'panel',
        items: [
          {
            type: 'input',
            name: 'type',
            label: `${media} ${label}`,
            flex: true
          }
        ]
      },
      initialData: {
        type: values()?.iEventId
      },
      onSubmit: (api) => {
        const inputContent = api.getData().type
        if (inputContent?.length > 0) {
          if (values()?.iEventId !== inputContent) {
            if (eventId?.id === 'ct-liveBlog') {
              setValue('iEventId', inputContent)
            } else {
              editor.insertContent(renderToStaticMarkup(<div className="ct-liveBlog mceNonEditable" id="ct-liveBlog"></div>))
              setValue('iEventId', inputContent)
            }
          }
        } else {
          editor.contentWindow.document?.getElementById('ct-liveBlog')?.remove()
          setValue('iEventId', null)
        }
        api.close()
      },
      buttons: [
        {
          text: 'Close',
          type: 'cancel',
          onclick: 'close'
        },
        {
          text: 'Insert',
          type: 'submit',
          primary: true,
          enabled: true
        }
      ]
    }
  }

  // function handleTabChange(tab) {
  //   setTab(tab)
  // }

  return (
    <>
      <PollPopup isPollShowing={isPollShowing} closeModal={closeModal} handlePollSubmit={handlePollSubmit} pollIdRef={pollIdRef} />
      <MediaGallery overRidePermission show={isShowing} handleHide={toggle} handleData={handleMediaGalary} isEditor />
      <Controller
        name={name}
        control={control}
        rules={required && { required: validationErrors.required }}
        render={({ field: { onChange, value } }) => (
          <Editor
            apiKey="316c8myuxuzlzc91yu01inf1y1v5ze7t1ymeangwik6eacc9"
            init={{
              extended_valid_elements:
                'script[language|type|src],img[class|src|alt|title|width|loading=lazy],iframe[allowfullscreen|allowfullscreen|allowpaymentrequest|loading|height|name|referrerpolicy|sandbox|src|srcdoc|width]',
              allow_script_urls: true,
              menubar: !isLiveArticle,
              valid_children: '+*[*]',
              icons_url: '/icons/ct-editor/icons.js',
              icons: 'ct-editor',
              cleanup: false,
              valid_elements: '*[*],script[src|type]',
              plugins: handlePlugins(),
              toolbar1: handleDefaultToolbar(),
              toolbar2: handleToolbar(),
              skin: 'oxide-dark',
              content_css: ['dark', '/style.css'],
              toolbar_location: 'top',
              toolbar_sticky: true,
              toolbar_sticky_offset: 65,
              min_height: isLiveArticle ? 470 : commentary ? 560 : 1000,
              image_caption: true,
              invalid_styles: {
                // '*': 'font-family color background-color display',
                table: 'width height margin border-collapse',
                tr: 'width height',
                th: 'width height',
                td: 'width height'
              },
              content_style: `
              ::-moz-selection {
                color: #ffffff;
                background: #ffffff47;
              }
              
              ::selection {
                color: #ffffff;
                background: #ffffff47;
              }
              .mce-content-body [data-mce-selected=inline-boundary] { background-color: transparent }
              .twitter_frame{ overflow: hidden; }
              .twitter_frame iframe{ margin-top: -18px }
              gt-ads { border: 1px dashed white; display: block; }
              gt-ads:before { content: 'Advertisement'; }
              .cts-ads { border: 1px dashed white; display: block; }
              .cts-ads:before { content: 'Advertisement'; }
              .ct-liveBlog { border: 1px dashed white; display: block; }
              .ct-liveBlog:before { content: 'Live Event Will be load here ... '; }
              .ct-poll { border: 1px dashed white; display: block; }
              .ct-poll:before { content: 'Poll will be load here ... '; }
              `,
              images_upload_handler: handleImageUpload,
              media_live_embeds: true,
              setup: (editor) => {
                editorRef.current = editor
                editor.ui.registry.addButton('adsButton', {
                  text: 'Ads',
                  onAction: (_) => {
                    const ads = editor.contentDocument.getElementsByClassName('cts-ads mceNonEditable')
                    editor.insertContent(renderToStaticMarkup(<div className="cts-ads mceNonEditable" data-key={ads.length + 1}></div>))
                  }
                })
                editor.ui.registry.addButton('addTweet', {
                  icon: 'twitter',
                  onAction: (_) => {
                    editor.windowManager.open(handleModal(editor, 'Tweet', 'URL'))
                  }
                })
                editor.ui.registry.addButton('addInstagram', {
                  icon: 'instagram',
                  onAction: (_) => {
                    editor.windowManager.open(handleModal(editor, 'Instagram', 'URL'))
                  }
                })
                editor.ui.registry.addButton('mediaGallery', {
                  // icon: 'media-galary',
                  icon: 'gallery',
                  onAction: (_) => {
                    toggle()
                  }
                })
                // editor.ui.registry.addButton('poll', {
                //   icon: 'poll',
                //   onAction: (_) => {
                //     togglePoll()
                //   }
                // })
                editor.ui.registry.addButton('linkPoll', {
                  icon: 'embedLink',
                  text: 'Poll',
                  onAction: (_) => {
                    if (isLiveArticle && editorRef.current.contentDocument.getElementsByClassName('ct-poll')?.length) return
                    togglePollShow()
                    // editor.windowManager.open(handleModal(editor, 'Poll', 'ID'))
                  }
                })
                editor.ui.registry.addButton('linkQuiz', {
                  icon: 'embedLink',
                  text: 'Quiz',
                  onAction: (_) => {
                    if (isLiveArticle && editorRef.current.contentDocument.getElementsByClassName('ct-poll')?.length) return
                    togglePollShow()
                    // editor.windowManager.open(handleModal(editor, 'Poll', 'ID'))
                  }
                })
                editor.ui.registry.addButton('embedLink', {
                  icon: 'embedLink',
                  text: 'card',
                  onAction: (_) => {
                    editor.windowManager.open(handleModal(editor, 'Link Preview', 'URL'))
                  }
                })
                editor.ui.registry.addButton('liveArticle', {
                  text: 'Live Article',
                  onAction: (_) => {
                    editor.windowManager.open(handleLiveArticleModal(editor, 'LiveEvent', 'ID'))
                  }
                })
                editor.addShortcut('meta+shift+p', 'Add pagebreak', () => {
                  editor.insertContent('<p><!-- pagebreak --></p>')
                })
                editor.on('PastePreProcess', async (e) => {
                  const content = e.content
                  e.content = ''
                  const data = await convertUrlToEmbed(content)
                  const removedStyleData = removeStylesFromString(data)
                  editor.insertContent(removedStyleData)
                })
              }
            }}
            disabled={disabled}
            onEditorChange={(e) => {
              onChange(e)
            }}
            value={value}
          />
        )}
      />
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
      {isLiveArticle && <SocialLinkPreview register={register} handleSocialPreview={handleSocialPreview} />}
    </>
  )
}
TinyEditor.propTypes = {
  control: PropTypes.object,
  register: PropTypes.func,
  error: PropTypes.string,
  values: PropTypes.func,
  required: PropTypes.bool,
  initialValue: PropTypes.string,
  disabled: PropTypes.bool,
  onlyTextFormatting: PropTypes.bool,
  name: PropTypes.string,
  isLiveArticle: PropTypes.bool,
  togglePoll: PropTypes.func,
  setValue: PropTypes.func,
  commentary: PropTypes.bool
}
export default React.memo(TinyEditor)
