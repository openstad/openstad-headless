export default function() {
  apos.bus.$on('admin-menu-click', async (item) => {
    if (item !== '@apostrophecms/login-logout') {
      return;
    }
    try {
      document.location.href = logoutUrl;
    } catch(err) { console.log(err) }
  });
};
