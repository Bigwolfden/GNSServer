/* Validates the form */
/* Reference: http://jsfiddle.net/Gajotres/RLJHK/ */
$("#btnSubmit").click(function(){
	$('#form1').validate({
		rules: {
			firstName: {
				required: true
			},
			lastName: {
				required: true
			},
			phoneNumber: {
				required: true
			},
			email: {
				required: true
			},
			address: {
				required: true
			},
			city: {
				required: true
			},
			zip: {
				required: true
			}	
		},
		messages: {
			firstName: {
				required: "Please enter your first name."
			},
			lastName: {
				required: "Please enter your last name."
			},
			email: {
				required: "Please enter your email."
			},
			address: {
				required: "Please enter your address."
			},
			city: {
				required: "Please enter your city."
			},
			zip: {
				required: "Please enter your zip."
			}
		},
		errorPlacement: function (error, element) {
			error.appendTo(element.parent().prev());
		},
		submitHandler: function (form) {
			$(':mobile-pagecontainer').pagecontainer('change', '#success', {
				reload: false
			});
        return false;
    }
	});
});