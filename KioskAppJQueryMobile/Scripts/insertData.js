$("#btnSubmit").click(function(){
	var first_name = $("#firstName").val();
	var last_name = $("#lastName").val();
	var phone_number = $("#phoneNumber").val();
	var email = $("#email").val();
	var street_address = $("#address").val();
	var city = $("#city").val();
	var zip = $("#zip").val();
	var state = $("#select-native-1").val();
	var current_date = new Date(Date.now()).toISOString();
	$.ajax({
		url:"localhost:3000",	// Is this "url" correct?
		method:"post",
		data: {
			first_name:first_name,
			last_name:last_name,
			phone_number:phone_number,
			email:email,
			street_address:street_address,
			city:city,
			zip:zip,
			state:state,
			current_date:current_date
		},
		success: function(data){
			$('#form')[0].reset();  
			$('#add_data_Modal').modal('hide');  
			$('#stud_insert').html(data);
		}
	});
});