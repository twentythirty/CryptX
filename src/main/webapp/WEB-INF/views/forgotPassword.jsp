<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>

<div class="elelment">
	${successMessage}
	${errorMessage}
	<h2>Reset Password Form</h2>
	<div class="element-main">
		<h1>Forgot Password</h1>
		<p> Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut.</p>
		<form:form action="forgotPassword" method="post">
			<input type="text" value="Your e-mail address" name="email" required="required" onfocus="this.value = '';" onblur="if (this.value == '') {this.value = 'Your e-mail address';}" >
			<input type="submit" value="Reset my Password">
		</form:form>
	</div>
</div>
<div class="copy-right">
			<p>© 2017 All rights reserved by  <a href="#" target="_blank">  Cryptx Token </a></p>
</div>
</html>