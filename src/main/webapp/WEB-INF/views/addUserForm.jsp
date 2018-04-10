<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<script type="text/javascript" src="<c:url value='/static/js/password.js' />"></script>
<script type="text/javascript" src="<c:url value='https://cdn.jsdelivr.net/jquery.formvalidation/0.6.1/js/formValidation.min.js' />"></script>

<script type="text/javascript" src="<c:url value='https://cdn.jsdelivr.net/jquery.formvalidation/0.6.1/js/framework/bootstrap.min.js' />"></script>
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<%@ taglib prefix="security"
	uri="http://www.springframework.org/security/tags"%>
<style>
body {
	background-color: #ffffff;
}

.registerLabel {
	margin-top: -3px;
	margin-bottom: -1px;
}

.centered-form {
	margin-top: 60px;
}

.centered-form .panel {
	background: rgba(255, 255, 255, 0.8);
	box-shadow: rgba(0, 0, 0, 0.3) 20px 20px 20px;
}

#password, #conformPassword {
	height: 28px;
}

input::-webkit-input-placeholder {
	font-size: 10pt;
	color: #555;
}

input::-moz-placeholder {
	font-size: 10pt;
	color: #555;
}

input:-ms-input-placeholder {
	font-size: 10pt;
	color: #555;
}

input:-moz-placeholder {
	font-size: 10pt;
	color: #555;
}

input.other::-webkit-input-placeholder {
	font-size: 10pt;
	color: red;
}

input.other::-moz-placeholder {
	font-size: 10pt;
	color: red;
}

input.other:-ms-input-placeholder {
	font-size: 10pt;
	color: red;
}

input.other:-moz-placeholder {
	font-size: 10pt;
	color: red;
}

#register .short {
	font-weight: bold;
	color: #FF0000;
	font-size: larger;
}

#register .weak {
	font-weight: bold;
	color: orange;
	font-size: larger;
}

#register .good {
	font-weight: bold;
	color: #2D98F3;
	font-size: larger;
}

#register .strong {
	font-weight: bold;
	color: limegreen;
	font-size: larger;
}

.popover.primary {
	border-color: #337ab7;
}

.popover.primary>.arrow {
	border-top-color: #337ab7;
}

.popover.primary>.popover-title {
	color: #fff;
	background-color: #337ab7;
	border-color: #337ab7;
}

.popover.success {
	border-color: #d6e9c6;
}

.popover.success>.arrow {
	border-top-color: #d6e9c6;
}

.popover.success>.popover-title {
	color: #3c763d;
	background-color: #dff0d8;
	border-color: #d6e9c6;
}

.popover.info {
	border-color: #bce8f1;
}

.popover.info>.arrow {
	border-top-color: #bce8f1;
}

.popover.info>.popover-title {
	color: #31708f;
	background-color: #d9edf7;
	border-color: #bce8f1;
}

.popover.warning {
	border-color: #faebcc;
}

.popover.warning>.arrow {
	border-top-color: #faebcc;
}

.popover.warning>.popover-title {
	color: #8a6d3b;
	background-color: #fcf8e3;
	border-color: #faebcc;
}

.popover.danger {
	border-color: #ebccd1;
}

.popover.danger>.arrow {
	border-top-color: #ebccd1;
}

.popover.danger>.popover-title {
	color: #a94442;
	background-color: #f2dede;
	border-color: #ebccd1;
}

#conformDiv , #emailDiv , #passwordDiv  {
    width: 329px;
}

.min {
	min-height: 94%;
}

</style>


<div class="container min">
	<div class="row centered-form">
		<div
			class="col-xs-12 col-sm-8 col-md-4 col-sm-offset-2 col-md-offset-4">
			<div class="panel panel-default">
				<div class="panel-heading">
					<center>
						<h3 class="registerLabel">Registration Form</h3>
					</center>
				</div>
				<div class="panel-body">
					<form:form role="form" method="Post" modelAttribute="userDTO"
						action="addUser" id="register">


						<div class="row">
							<div class="col-xs-6 col-sm-6 col-md-6">
								<div class="form-group">
									<input type="text" name="firstName" id="firstName"
										class="form-control input-sm" placeholder="First Name"
										required="required">
								</div>
							</div>
							<div class="col-xs-6 col-sm-6 col-md-6">
								<div class="form-group">
									<input type="text" name="lastName" id="lastName"
										class="form-control input-sm" placeholder="Last Name"
										required="required">

								</div>
							</div>
						</div>
						<div class="form-group">
						<div class="input-group input-group-sm" id="emailDiv">
							<input type="email" name="email" id="email"
								class="form-control input-sm" placeholder="Email Address"
								required="required" onblur="checkDuplicateEmail()"> 
								<span id="em" class="glyphicon form-control-feedback"></span>
						</div>
								<span id="duplicate" style="color:#b30000"></span>
						</div>
						<div class="form-group">
							<div class="input-group input-group-sm" id="passwordDiv">
								<input type="password" name="password" id="password"
									class="form-control input-sm" placeholder="Password"
									required="required" required data-toggle="popover"
									title="Password Strength" data-content="Enter Password..." onblur="passwordLength()">
									<span id="pa" class="glyphicon form-control-feedback" ></span>
							</div>
								
								<span style="color:#b30000">Password length must be between 8 to 20</span>
						</div>
						
						<div class="form-group" >
						<div class="input-group input-group-sm" id="conformDiv">
							<input type="password" name="conformPassword"
								id="conformPassword" class="form-control input-sm"
								placeholder="Confirm Password" required="required"
								onblur="matchPassword()"> 
								<span id="con" class="glyphicon form-control-feedback"></span>
								</div>
								<span id="error" style="color:#b30000"></span>
						</div>


						<div class="row">
							<div class="col-xs-6 col-sm-6 col-md-6">
								<div class="form-group">
									<label class="control-label" style="margin-top: 7px;color: chocolate">Grant
										Admin Access</label>
								</div>
							</div>
							<div class="col-xs-6 col-sm-6 col-md-6">
								<div class="form-group">
									<select class="selectpicker" data-width="100%" name="adminRole">
										<option value="false">No</option>
										<option value="true">Yes</option>
									</select>
								</div>
							</div>

						</div>

						<input type="submit" value="Register"
							class="btn btn-info btn-block" onclick="return finalSubmit()">
					</form:form>
				</div>
			</div>
		</div>
	</div>
</div>