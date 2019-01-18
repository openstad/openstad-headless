$(function() {
  initFormsValidation();
  initHideFlash();
  initRemoveErrorLabelOnType();
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


function initRemoveErrorLabelOnType ( ){

  $('.side-error input').on('keydown', function () {
    var $sideError = $(this).closest('.side-error')
    $sideError.find('.error-label').remove();
    $sideError.removeClass('side-error');
  })
}

function initHideFlash() {
  $('.flash-container .close-button').click(function() {
    $(this).closest('.flash-container').remove();
  });

  setTimeout(function() {
  //  $('.flash-container').remove();
  }, 5000);
}
