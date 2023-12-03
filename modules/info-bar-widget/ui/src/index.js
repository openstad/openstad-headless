import $ from 'jquery';

export default () => {
    //var infobars = openstadGetCookie('hidden-info-bars') || [];
      
  $(document).on('click', '.info-bar .close-button', function () {
    var $infobar = $(this).closest('.info-bar')
    var infobarId = $infobar.attr('id');
    $infobar.remove();
    //  infobars.push(infobarId);
    //  openstadSetCookie('hidden-info-bars', infobars);
  });    
}