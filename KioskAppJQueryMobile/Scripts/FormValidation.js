/* Validates the form */
function validateForm() {
	var fName = document.forms["form1"]["firstName"].value;
	var lName = document.forms["form1"]["lastName"].value;
	var pNumber = document.forms["form1"]["phoneNumber"].value;
	var email = document.forms["form1"]["email"].value;
	var address = document.forms["form1"]["address"].value;
	var city = document.forms["form1"]["city"].value;
	var zip = document.forms["form1"]["zip"].value;
  
	if (fName == "") {
		alert("First name must be filled out.");
		return false;
	}
	if (lName == "") {
		alert("Last name must be filled out.");
		return false;
	}
	if (pNumber == "") {
		alert("Phone Number must be filled out.");
		return false;
	}
	if (email == "") {
		alert("Email must be filled out.");
		return false;
	}
	if (address == "") {
		alert("Address must be filled out.");
		return false;
	}
	if (city == "") {
		alert("City must be filled out.");
		return false;
	}
	if (zip == "") {
		alert("Zip must be filled out.");
		return false;
	}
}








