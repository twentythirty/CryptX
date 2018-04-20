

<%@taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<!DOCTYPE HTML>
<html lang="en">
<head>
<title>Online Login Form Responsive Widget Template :: w3layouts</title>
<!-- Meta tag Keywords -->
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="keywords" content="cryptx token , digital currency" />
<script
	src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<script type="application/x-javascript">
	
	
	 addEventListener("load", function() { setTimeout(hideURLbar, 0); }, false);
function hideURLbar(){ window.scrollTo(0,1); } 

$(document).ready(function() {
	var error = '${error}';
	var message = '${message}';
	if(error!=''){
		$("#errorDiv").css("display", "inherit");
		$("#message").text(error);
	}
	else if(message!=''){
		$("#errorDiv").css("display", "inherit");
		$("#message").text(message);
	}
});


</script>


<style type="text/css">
#errorDiv {
	display: none;
	max-width: 500px;
}
</style>


<!-- Meta tag Keywords -->
<!-- css files -->
<link href="<c:url value='/static/css/font-awesome.css' />"
	rel="stylesheet" />
<link href="<c:url value='/static/css/style.css' />" rel="stylesheet" />

<!-- //css files -->
<!-- online-fonts -->

<link
	href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i,800,800i&amp;subset=cyrillic,cyrillic-ext,greek,greek-ext,latin-ext,vietnamese"
	rel="stylesheet">
<link
	href="https://fonts.googleapis.com/css?family=Dosis:200,300,400,500,600,700,800&amp;subset=latin-ext"
	rel="stylesheet">

<link href="https://fonts.googleapis.com/css?family=Tangerine:400,700"
	rel="stylesheet">
<link
	href="https://fonts.googleapis.com/css?family=Roboto:100,100i,300,300i,400,400i,500,500i,700,700i,900,900i"
	rel="stylesheet">
<!-- //online-fonts -->
</head>
<body onload='document.login.username.focus();'>
	<!-- main -->
	<div class="center-container">

		<!--header-->
		<div class="header-w3l">
			<h1>Welcome To Cryptx</h1>
		</div>
		<!--//header-->
		<div class="main-content-agile">

			<div class="sub-main-w3">

				<div class="wthree-pro">
					<div class="alert" id="errorDiv">
						<span class="closebtn"
							onclick="this.parentElement.style.display='none';">&times;</span>
						<p id="message"></p>
					</div>
					<h2>Login</h2>
				</div>
				<form name='login' action="<c:url value='/loginPage' />"
					method='POST'>
					<div class="pom-agile">
						<input placeholder="E-mail" name="username" id="username"
							class="user" type="email" required=""> <span
							class="icon1"><i class="fa fa-user" aria-hidden="true"></i></span>
					</div>
					<div class="pom-agile">
						<input placeholder="Password" name="password" id="password"
							class="pass" type="password" required=""> <span
							class="icon2"><i class="fa fa-unlock" aria-hidden="true"></i></span>
					</div>
					<div class="sub-w3l">
						<div class="right-w3l">
							<input type="submit" value="Login">
						</div>
					</div>
				</form>
				<a href="forgotPassword">Forgot my password</a>
			</div>
		</div>
		<!--//main-->
		<!--footer-->
		<div class="footer">
			<p>
				&copy; 2017 Cryptx Token. All rights reserved </a>
			</p>
		</div>
		<!--//footer-->
	</div>
</body>
</html>