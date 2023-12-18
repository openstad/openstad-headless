function SessionStorage (props) {

  let self = this;
  self.projectId = props.projectId || props.config.projectId;

  function getData() {

    let data = window.sessionStorage.getItem('openstad') || {};
	  try {
		  data = JSON.parse(data);
	  } catch(err) {}

    let target = data;
    if (self.projectId) {
      data[self.projectId] = data[self.projectId] || {};
      target = data[self.projectId] || {};
    }

    return { data, target }
    
  }
  
  this.get = function(name) {

    let { data, target } = getData();

	  let value = target[name];
	  try {
		  value = JSON.parse(value);
	  } catch(err) {}

	  return value;

  }

  this.set = function(name, value) {

	  if ( typeof name != 'string' ) return;

	  if ( typeof value == 'undefined' ) value = "";

    let { data, target } = getData();
    target[name] = value;
    
	  window.sessionStorage.setItem( 'openstad', JSON.stringify(data) );

  }


  this.remove = function(name) {

	  if ( typeof name != 'string' ) return;

    let { data, target } = getData();

    delete target[name];

	  window.sessionStorage.setItem( 'openstad', JSON.stringify(data) );

  }

}

export {
  SessionStorage as default,
  SessionStorage
}
