$(function () {
  initFormsValidation();
  initHideFlash();
  initRemoveErrorLabelOnType();
  initSubmitOnEnter();
});

$.validator.addMethod(
  'codeExistsInDB',
  function (value, element) {
    var isValid = false;
    $.ajax({
      url: '/api/validation/code/',
      type: 'POST',
      async: false,
      success: function (response) {
        isValid = response.data === value;
      },
      contentType: 'application/json',
      data: JSON.stringify({ codeId: value }),
    });
    return isValid;
  },
  'Code is niet geldig'
);

$.validator.addMethod(
  'postcodeNL',
  function (value, element, val) {
    var rege = /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i;
    return rege.test(value);
  },
  'Postcode niet correct'
);

function initFormsValidation() {
  $('.validate-form').each(function () {
    $(this).validate({
      rules: {
        name: {
          minlength: 1,
          normalizer: function (value) {
            // Update the value of the element
            this.value = $.trim(value);
            // Use the trimmed value for validation
            return this.value;
          },
        },
        password: {
          minlength: 6,
        },
        password_confirm: {
          minlength: 6,
          equalTo: '#password',
        },
        postcode: {
          postcodeNL: true,
        },
        accessCode: {
          codeExistsInDB: true,
        },
      },
      submitHandler: function (form) {
        var $submitButtons = $(form).find(
          'input[type="submit"], button[type="submit"]'
        );
        $submitButtons.attr('disabled', true);
        form.submit();
      },
    });
  });
}

// Ensure pressing Enter in a single-line field submits the form. On some
// fields (e.g. type="email" with autocomplete) the browser's suggestion popup
// swallows the Enter key, so implicit form submission never happens.
function initSubmitOnEnter() {
  $('.validate-form').on(
    'keydown',
    'input:not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"])',
    function (e) {
      if (e.key !== 'Enter' && e.keyCode !== 13) {
        return;
      }
      e.preventDefault();
      var form = $(this).closest('form').get(0);
      if (!form) {
        return;
      }
      if (typeof form.requestSubmit === 'function') {
        form.requestSubmit();
      } else {
        $(form).submit();
      }
    }
  );
}

function initRemoveErrorLabelOnType() {
  $('.side-error input').on('keydown', function () {
    var $sideError = $(this).closest('.side-error');
    $sideError.find('.error-label').remove();
    $sideError.removeClass('side-error');
  });
}

function initHideFlash() {
  $('.flash-container .close-button').click(function () {
    $(this).closest('.flash-container').remove();
  });

  setTimeout(function () {
    //  $('.flash-container').remove();
  }, 5000);
}
