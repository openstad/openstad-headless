$(function() {
  initFormsValidation();
});

function initFormsValidation () {
  $('.validate-form').each(function () {
    $(this).validate();
  });
}
