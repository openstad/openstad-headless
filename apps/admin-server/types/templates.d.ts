declare module '*.mjml' {
    import { TemplateDelegate } from 'handlebars';
    const template: TemplateDelegate;
    export default template;
  }