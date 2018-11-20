$(function() {
  initFormsValidation();
  initHideFlash();
});

function initFormsValidation () {
  $('.validate-form').each(function () {
    $(this).validate({
      rules : {
        password : {
            minlength : 5
        },
        password_confirm : {
          //  minlength : 5,
            equalTo : "#password"
        }
      }
    });
  });
}


function initHideFlash() {
  $('.flash-container .close-button').click(function() {
    $(this).closest('.flash-container').remove();
  });

  setTimeout(function() {
    $('.flash-container').remove();
  }, 5000);
}
