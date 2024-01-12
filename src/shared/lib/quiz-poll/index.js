export const POLL_SLIDES = {
  sp: { sTitle: '', oBgImgUrl: { sUrl: '' }, eSlideType: 'sp', aField: [{ sTitle: '', nVote: 0 }, { sTitle: '', nVote: 0 }] },
  ip: { sTitle: '', oBgImgUrl: { sUrl: '' }, eSlideType: 'ip', oMediaUrl: { sUrl: '' }, eMediaType: '', aField: [{ sTitle: '', nVote: 0 }, { sTitle: '', nVote: 0 }] },
  mp: {
    sTitle: '',
    oBgImgUrl: { sUrl: '' },
    eSlideType: 'mp',
    aField: [
      { sTitle: '', eMediaType: '', oMediaUrl: { sUrl: '' }, nVote: 0 },
      { sTitle: '', eMediaType: '', oMediaUrl: { sUrl: '' }, nVote: 0 },
      { sTitle: '', eMediaType: '', oMediaUrl: { sUrl: '' }, nVote: 0 },
      { sTitle: '', eMediaType: '', oMediaUrl: { sUrl: '' }, nVote: 0 }
    ]
  },
  vs: {
    sTitle: '',
    eSlideType: 'vs',
    aField: [{ oMediaUrl: { sUrl: '' }, eMediaType: '', nVote: 0 }, { oMediaUrl: { sUrl: '' }, eMediaType: '', nVote: 0 }]
  },
  rp: {
    sTitle: '',
    eSlideType: 'rp',
    oBgImgUrl: { sUrl: '' },
    oMediaUrl: { sUrl: '' },
    eMediaType: '',
    aField: [
      { sTitle: '', eMediaType: '', oMediaUrl: { sUrl: '' }, nVote: 0 },
      { sTitle: '', eMediaType: '', oMediaUrl: { sUrl: '' }, nVote: 0 },
      { sTitle: '', eMediaType: '', oMediaUrl: { sUrl: '' }, nVote: 0 },
      { sTitle: '', eMediaType: '', oMediaUrl: { sUrl: '' }, nVote: 0 }
    ]
  }
}

export const QUIZ_SLIDES = {
  get sq() {
    return ({
      sQuestion: '',
      eType: 'sq',
      oBgImgUrl: { sUrl: '' },
      aAnswers: [{ sAnswer: '', nVote: 0, isCorrect: false }, { sAnswer: '', nVote: 0, isCorrect: false }]
    })
  },
  get mq() {
    return ({
      sQuestion: '',
      eType: 'mq',
      oBgImgUrl: { sUrl: '' },
      oMediaUrl: { sUrl: '' },
      eMediaType: '',
      aAnswers: [
        { sAnswer: '', nVote: 0, isCorrect: false },
        { sAnswer: '', nVote: 0, isCorrect: false }]
    })
  },
  get ma() {
    return ({
      sQuestion: '',
      eType: 'ma',
      oBgImgUrl: { sUrl: '' },
      aAnswers: [
        { sAnswer: '', nVote: 0, isCorrect: false, eMediaType: '', oMediaUrl: { sUrl: '' } },
        { sAnswer: '', nVote: 0, isCorrect: false, eMediaType: '', oMediaUrl: { sUrl: '' } },
        { sAnswer: '', nVote: 0, isCorrect: false, eMediaType: '', oMediaUrl: { sUrl: '' } },
        { sAnswer: '', nVote: 0, isCorrect: false, eMediaType: '', oMediaUrl: { sUrl: '' } }
      ]
    })
  },
  get vq() {
    return ({
      eType: 'vq',
      oMediaUrl: { sUrl: '' },
      eMediaType: 'v',
      aPausePoint: [],
      aQuestions: []
    })
  }
  // vs: {
  //   sQuestion: '',
  //   eType: 'vs',
  //   aAnswers: [
  //     { nVote: 0, isCorrect: false, oMediaUrl: { sUrl: '' }, eMediaType: '' },
  //     { nVote: 0, isCorrect: false, oMediaUrl: { sUrl: '' }, eMediaType: '' }
  //   ]
  // }
}
