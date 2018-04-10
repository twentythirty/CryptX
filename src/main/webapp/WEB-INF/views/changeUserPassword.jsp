
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<script type="text/javascript" src='static/js/password.js'></script>
<style>
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

#alert {
	display: none;
}

.min {
	min-height: 94%;
}
</style>
<script>
	$(document).ready(function() {
		var updatePassword = '${updatePassword}';
		if (updatePassword != 0) {
			$("#alert").css("display", "block");
			$("#msg").html("Your Password has been changed");
		}
	});
</script>



<link rel="stylesheet"
	href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
<div class="form-gap"></div>
<div class="container min">
	<div class="row">
		<div
			class="alert alert-success alert-dismissable fade in col-md-4 col-md-offset-4"
			id="alert">
			<a href="#" class="close" data-dismiss="alert" aria-label="close"
				id="close">&times;</a> <strong><span id="msg"></span></strong>
		</div>
	</div>
	<div class="row">
		<div class="col-md-4 col-md-offset-4">
			<div class="panel panel-default">
				<div class="panel-body">
					<div class="text-center">
						<h3>
							<i class="fa fa-lock fa-4x"></i>
						</h3>
						<h2 class="text-center">Change Password?</h2>
						<p>You can change your password here.</p>
						<div class="panel-body">

							<form:form id="register-form" role="form" autocomplete="off"
								class="form" method="post" action="updateUserPassword"
								onsubmit="return matchPassword()">
								<div class="form-group">
									<div class="input-group" id="recentDiv">
										<span class="input-group-addon"><i
											class="glyphicon glyphicon-lock color-blue"></i></span> <input
											id="recentPassword" name="recentPassword"
											placeholder="Current Password" class="form-control"
											type="password" onblur="validatePassword()"
											required="required"> <span id="recent"
											class="glyphicon form-control-feedback"></span>
									</div>
									<span id="recResult" style="color: #b30000"></span>
								</div>
								<div class="form-group">
									<div class="input-group" id="passwordDiv">
										<span class="input-group-addon"><i
											class="glyphicon glyphicon glyphicon-log-in color-blue"></i></span>
										<input id="password" name="password" placeholder="password"
											class="form-control" type="password" required="required"
											required data-toggle="popover" title="Password Strength"
											data-content="Enter Password..." onblur="passwordLength()">
										<span id="pa" class="glyphicon form-control-feedback"></span>

									</div>
									<span style="color: #b30000">Password length must be
										between 8 to 20</span>
								</div>
								<div class="form-group">
									<div class="input-group" id="conformDiv">
										<span class="input-group-addon"><i
											class="glyphicon glyphicon glyphicon-log-in color-blue"></i></span>
										<input id="conformPassword" name="conformPassowrd"
											placeholder="conform password" class="form-control"
											type="password" required="required" required
											data-toggle="popover" title="Password Strength"
											data-content="Enter Password..." onblur=" matchPassword()">
										<span id="con" class="glyphicon form-control-feedback"></span>
									</div>
									<span id="error" style="color: #b30000"></span>
								</div>
								<div class="form-group">
									<input name="recover-submit"
										class="btn btn-lg btn-primary btn-block" value="Save Changes"
										type="submit" onclick="return matchPassword()">
								</div>
							</form:form>

						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>