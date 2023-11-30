// @todo: add all widgets
module.exports = {
  /*arguments: {
    js: ['@openstad-headless/arguments-component/dist/arguments-component.umd.cjs'],
    css: ['@openstad-headless/arguments-component/dist/style.css'],
    name: 'OpenstadHeadlessArguments',
    defaultConfig: {
      ideaId: null,
      title: '[[nr]] reacties voor',
      isClosed: widget.project?.config?.arguments?.isClosed || true,
      closedText: 'Het inzenden van reacties is niet langer mogelijk',
      isVotingEnabled: false,
      isReplyingEnabled: false,
      descriptionMinLength:
        widget.project?.config?.arguments?.descriptionMinLength || '2',
      descriptionMaxLength:
        widget.project?.config?.arguments?.descriptionMaxLength || '1000',
      placeholder: 'Voer hier uw reactie in',
      formIntro: '',
    },
  },*/

  like: {
    js: ['@openstad-headless/likes/dist/likes.iife.js'],
    css: ['@openstad-headless/likes/dist/style.css'],
    functionName: 'OpenstadHeadlessLikes',
    componentName: 'Likes',
    defaultConfig: {
      ideaId: null,
    },
  },
};
