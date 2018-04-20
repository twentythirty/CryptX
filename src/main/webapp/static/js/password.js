



// Check Email is duplicate or not

function isValidEmailAddress(emailAddress) {
    var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return pattern.test(emailAddress);
};

function checkDuplicateEmail() {
		var email = $("#email").val().trim();
		var username = $("#username").val();
		if(email==username){
			$("#em").removeClass("glyphicon-remove error");
			$("#em").removeClass("glyphicon-ok");
			$("#emailDiv").removeClass("has-success");
			$("#emailDiv").removeClass("has-error");
			$("#duplicate").html("");
			return true;
		}
		var check = isValidEmailAddress(email);
		if(email=='' || !check){
			$("#em").addClass("glyphicon-remove error");
			$("#em").removeClass("glyphicon-ok");
			$("#emailDiv").removeClass("has-success");
			$("#emailDiv").addClass("has-error");
			$("#duplicate").html("Please enter a valid email");
			$("#email").val("");
			return false;
		}
		$.ajax({
			type : "GET",
			url : 'checkDuplicateEmail',
			async: false,
			contentType : "application/json; charset=utf-8",
			data : {
				'email' : email,
			},
			dataType : 'json',
			success : function(data) {
				if (data == 'yes') {
					$("#em").addClass("glyphicon-remove error");
					$("#em").removeClass("glyphicon-ok");
					$("#emailDiv").removeClass("has-success");
					$("#emailDiv").addClass("has-error");
					$("#email").val("");
					$("#duplicate").html("This email is already used");
					return true;
				} else {
					$("#emailDiv").removeClass("has-error");
					$("#emailDiv").addClass("has-success");
					$("#em").removeClass("glyphicon-remove error");
					$("#em").addClass("glyphicon-ok ");
					$("#duplicate").html("");
					return false;
				}
			},
			error : function(eq, status, err) {
				console.log(err);
				return false;
			}
		});
	}
	
function checkValidEmail() {
	var email = $("#email").val();
	
	if(email.trim()==''){
		return false;
	}
	$.ajax({
		type : "GET",
		url : 'checkDuplicateEmail',
		contentType : "application/json; charset=utf-8",
		data : {
			'email' : email,
		},
		dataType : 'json',
		success : function(data) {
			if (data == 'no') {
				$("#res").addClass("glyphicon-remove error");
				$("#res").removeClass("glyphicon-ok");
				$("#emailDiv").removeClass("has-success");
				$("#emailDiv").addClass("has-error");
				$("#email").val("");
				$("#duplicate").html("Please enter the valid email");
			} else {
				$("#emailDiv").removeClass("has-error");
				$("#emailDiv").addClass("has-success");
				$("#res").removeClass("glyphicon-remove error");
				$("#res").addClass("glyphicon-ok ");
				$("#duplicate").html("");
			}
		},
		error : function(eq, status, err) {
			console.log(err);
		}
	});
}








// Password Stength function
	
$(document).ready(function(){
	$('#a').on('blur', function () {
$('#a').popover({
    placement: 'right',
    trigger: 'focus'
});

	});
})
	
		
		
		//match password and conform Passowrd
		
		function matchPassword() {
			var password = $("#password").val();
			var confirmPassword = $("#conformPassword").val();
			if(password=='' || confirmPassword==''){
				return false;
			}
			if(password.length<8 || password.length>20){
				$("#pa").addClass("glyphicon-remove error");
				$("#pa").removeClass("glyphicon-ok");
				$("#passwordDiv").removeClass("has-success");
				$("#passwordDiv").addClass("has-error");
				$("#conformPassword").val("");
				$("#result").html("Password length must be between 8 to 20");
				return false;
			}
			
			else{
				$("#pa").removeClass("glyphicon-remove error");
				$("#pa").addClass("glyphicon-ok");
				$("#passwordDiv").addClass("has-success");
				$("#passwordDiv").removeClass("has-error");
				$("#result").html("");
				if (password != confirmPassword) {
					$("#con").addClass("glyphicon-remove error");
					$("#con").removeClass("glyphicon-ok");
					$("#conformDiv").removeClass("has-success");
					$("#conformDiv").addClass("has-error");
					$("#conformPassword").val("");
					$("#error").html("Password and Conform doesn't match");
				}
				else{
					
					$("#conformDiv").removeClass("has-error");
					$("#conformDiv").addClass("has-success");
					$("#con").removeClass("glyphicon-remove error");
					$("#con").addClass("glyphicon-ok ");
					$("#error").html("");
				}
			}	
			return true;
			} 
		
		
		
		// Check final submission form for add a user
		
		function finalSubmit(){
			var match = matchPassword();
			var duplicate = checkDuplicateEmail();
			if(duplicate){
				return false;
			}
			var passwordLength = $("#password").val();
			if(!match){
				$("#con").addClass("glyphicon-remove error");
				$("#con").removeClass("glyphicon-ok");
				$("#conformDiv").removeClass("has-success");
				$("#conformDiv").addClass("has-error");
				$("#error").html("Password and Conform Password doesn't match");
				return false;
			}
			else if(passwordLength.length<8 || passwordLength.length>20){
				$("#pa").addClass("glyphicon-remove error");
				$("#pa").removeClass("glyphicon-ok");
				$("#passwordDiv").removeClass("has-success");
				$("#passwordDiv").addClass("has-error");
				$("#passwordError").css("display", "block");
				$("#result").html("Password length must be between 8 to 20");
				return false;
			}
			else{
				$("#conformDiv").removeClass("has-error");
				$("#conformDiv").addClass("has-success");
				$("#con").removeClass("glyphicon-remove error");
				$("#con").addClass("glyphicon-ok ");
				$("#passwordDiv").removeClass("has-error");
				$("#passwordDiv").addClass("has-success");
				$("#pa").removeClass("glyphicon-remove error");
				$("#pa").addClass("glyphicon-ok ");
				$("#result").html("");
				$("#error").html("");
				$("#duplicateError").html("");
				return true;
			}
		}
		
		
		
	$(document).ready(function(){

		//minimum 8 characters
		var bad = /(?=.{8,}).*/;
		//Alpha Numeric plus minimum 8
		var good = /^(?=\S*?[a-z])(?=\S*?[0-9])\S{8,}$/;
		//Must contain at least one upper case letter, one lower case letter and (one number OR one special char).
		var better = /^(?=\S*?[A-Z])(?=\S*?[a-z])((?=\S*?[0-9])|(?=\S*?[^\w\*]))\S{8,}$/;
		//Must contain at least one upper case letter, one lower case letter and (one number AND one special char).
		var best = /^(?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9])(?=\S*?[^\w\*])\S{8,}$/;

		$('#password').on('keyup', function () {
		    var password = $(this);
		    var pass = password.val();
		    var passLabel = $('[for="password"]');
		    var stength = 'Weak';
		    var pclass = 'danger';
		    if (best.test(pass) == true) {
		        stength = 'Very Strong';
		        pclass = 'success';
		    } else if (better.test(pass) == true) {
		        stength = 'Strong';
		        pclass = 'warning';
		    } else if (good.test(pass) == true) {
		        stength = 'Almost Strong';
		        pclass = 'warning';
		    } else if (bad.test(pass) == true) {
		        stength = 'Weak';
		    } else {
		        stength = 'Very Weak';
		    }

		    var popover = password.attr('data-content', stength).data('bs.popover');
		    popover.setContent();
		    popover.$tip.addClass(popover.options.placement).removeClass('danger success info warning primary').addClass(pclass);

		});

		$('#password').popover({
		    placement: 'top',
		    trigger: 'focus'
		});
		

		})
		
		// To prevent the spaces on first name and last name
		
		$(function() {
   		 $('input[type="text"]').keydown(function(e) {
        	if (e.keyCode == 32) // 32 is the ASCII value for a space
            e.preventDefault();
    		});
		});
	
		$(function() {
  		 $('input[type="password"]').keydown(function(e) {
       		if (e.keyCode == 32) // 32 is the ASCII value for a space
            	e.preventDefault();
   			});
		});
		
		
		function passwordLength(){
			var password = $("#password").val();
			if(password.length < 8 || password.length>20){
				$("#pa").addClass("glyphicon-remove error");
				$("#pa").removeClass("glyphicon-ok");
				$("#passwordDiv").removeClass("has-success");
				$("#passwordDiv").addClass("has-error");
				$("#result").html("Password length must be between 8 to 20");
				return false;
			}
			else{
				$("#pa").removeClass("glyphicon-remove error");
				$("#pa").addClass("glyphicon-ok");
				$("#passwordDiv").addClass("has-success");
				$("#passwordDiv").removeClass("has-error");
				$("#result").html("");
				return false;
			}
		}
		
		
		
		function validatePassword(){
			var recentPassword = $("#recentPassword").val();
			$.ajax({
				type : "GET",
				url : 'validatePassword',
				contentType : "application/json; charset=utf-8",
				data : {
					'recentPassword' : recentPassword,
				},
				dataType : 'json',
				success : function(data) {
					if (data == 'no') {
						$("#recent").addClass("glyphicon-remove error");
						$("#recent").removeClass("glyphicon-ok");
						$("#recentDiv").removeClass("has-success");
						$("#recentDiv").addClass("has-error");
						$("#recentPassword").val("");
						$("#recResult").html("Password is invalid");
					} else {
						$("#recentDiv").removeClass("has-error");
						$("#recentDiv").addClass("has-success");
						$("#recent").removeClass("glyphicon-remove error");
						$("#recent").addClass("glyphicon-ok ");
						$("#recResult").html("");
					}
				},
				error : function(eq, status, err) {
					console.log(err);
				}
			});
		}
		

		
		// Get the cookie with the name
		
		function getCookieData( name ) {
		    var pairs = document.cookie.split("; "),
		        count = pairs.length, parts; 
		    while ( count-- ) {
		        parts = pairs[count].split("=");
		        if ( parts[0] === name )
		            return parts[1];
		    }
		    return false;
		}
		
		
		// Delete a cookie
		
		function delete_cookie(name) {
			  document.cookie = name+'=; expires='+new Date();
			}
		
	