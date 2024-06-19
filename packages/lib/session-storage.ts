export default class SessionStorage {
  private projectId?: string;

  constructor(props: { projectId?: string }) {
    this.projectId = props.projectId;
  }

  private getData() {
    const storedData = window.sessionStorage.getItem('openstad');
    let data: { [key: string]: any } = {};

    try {
      if (storedData) {
        data = JSON.parse(storedData);
      }
    } catch (err) {
      data = {};
    }

    let target = data;
    if (this.projectId) {
      data[this.projectId] = data[this.projectId] || {};
      target = data[this.projectId] || {};
    }

    return { data, target };
  }

  get(name: string) {
    let { data, target } = this.getData();

    let value = target[name];
    try {
      value = JSON.parse(value);
    } catch (err) {}

    return value;
  }

  set(name: string, value: any) {
    if (typeof name != 'string') return;
    if (typeof value == 'undefined') value = '';

    let { data, target } = this.getData();
    target[name] = value;

    window.sessionStorage.setItem('openstad', JSON.stringify(data));
  }

  remove(name: string) {
    if (typeof name != 'string') return;

    let { data, target } = this.getData();

    delete target[name];

    window.sessionStorage.setItem('openstad', JSON.stringify(data));
  }

  destroy() {
    window.sessionStorage.setItem('openstad', JSON.stringify({}));
  }

}

export { SessionStorage };
