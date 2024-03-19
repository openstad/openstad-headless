export default function() {
  apos.bus.$on('admin-menu-click', async (item) => {
    if (item !== '@apostrophecms/login-logout') {
      return;
    }
    console.log('++1', apos.data);
    try {
      console.log('++2');
      document.location.href = 'https://api.os20.nlsvgtr.nl/auth/project/2/logout?useAuth=default&redirectUri=https://plannen.cms.os20.nlsvgtr.nl/'
      console.log('++3');
    } catch(err) { console.log(err) }
  });
};
