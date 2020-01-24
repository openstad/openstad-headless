$(function() {
  initFormsValidation();
  initHideFlash();
  initRemoveErrorLabelOnType();
});


 $.validator.addMethod("postcodeNL", function(value, element, val) {
    var rege = /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i;
    return rege.test(value);
 }, "Postcode niet correct");

function initFormsValidation () {
  $('.validate-form').each(function () {
    $(this).validate({
      rules : {
        firstName : {
          minlength: 1,
          normalizer: function(value) {
                // Update the value of the element
                this.value = $.trim(value);
                // Use the trimmed value for validation
                return this.value;
            }
        },
        lastName : {
          minlength: 1,
          normalizer: function(value) {
                // Update the value of the element
                this.value = $.trim(value);
                // Use the trimmed value for validation
                return this.value;
            }
        },
        password : {
            minlength : 5
        },
        password_confirm : {
          //  minlength : 5,
            equalTo : "#password"
        },
        postcode : {
          postcodeNL: true
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
