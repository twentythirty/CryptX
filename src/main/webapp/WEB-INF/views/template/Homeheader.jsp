<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib prefix="sec"
	uri="http://www.springframework.org/security/tags"%>
<link href="<c:url value='/static/css/bootstrap.min.css' />" rel="stylesheet" />
<link href="<c:url value='/static/css/main.css' />" rel="stylesheet" />
<link href="<c:url value='/static/css/loginmodal.css' />" rel="stylesheet" />
<link href="<c:url value='/static/css/datatables.min.css' />" rel="stylesheet" />
<link href="<c:url value='/static/css/bootstrap-select.css' />" rel="stylesheet" />

<script type="text/javascript" src="<c:url value='/static/js/jquery-3.2.1.min.js' />"></script>
<script type="text/javascript" src="<c:url value='/static/js/bootstrap.min.js' />"></script>
<script type="text/javascript" src="<c:url value='/static/js/bootstrap-select.js' />"></script>
<script type="text/javascript" src="<c:url value='/static/js/wallet-address-validator.min.js' />"></script>
<script type="text/javascript"
	src="https://cdnjs.cloudflare.com/ajax/libs/datatables/1.10.15/js/jquery.dataTables.min.js"></script>

<style>
.neon {
	color: #D0F8FF;
	text-shadow: 0 0 5px #A5F1FF, 0 0 10px #A5F1FF, 0 0 20px #A5F1FF, 0 0
		30px #A5F1FF, 0 0 40px #A5F1FF;
	font-size: 38;
	text-decoration: none;
}
ul li:hover ul.dropdown-menu{
        display: block;	/* Display the dropdown */
}

</style>
<%
	String name = (String) request.getSession().getAttribute("name");
	Boolean isAdmin = (Boolean) request.getSession().getAttribute(
			"adminRole");
%>
<nav class="navbar navbar-inverse">
	<div class="container-fluid">
		<div class="navbar-header">
			<button type="button" class="navbar-toggle" data-toggle="collapse"
				data-target="#bs-example-navbar-collapse-1">
				<span class="sr-only">Toggle navigation</span> <span
					class="icon-bar"></span> <span class="icon-bar"></span> <span
					class="icon-bar"></span>
			</button>
			<a href="homePage"><img alt="Cryptx Logo" src="image/logo.png"></a>
		</div>
		<div class="collapse navbar-collapse"
			id="bs-example-navbar-collapse-1">
			<ul class="nav navbar-nav">
				<li><a href="homePage">Home</a></li>
				<sec:authorize access="hasRole('ADMIN')">
				<li><a href="dailyPriceTicker" style="text-decoration: none">Daily Ticker Data</a></li>
				<!-- <li><a href="buyCoins">Buy Coins</a></li> -->
				<li><a href="investmentinfo">InvestmentInfo</a></li>
				<!-- <li><a href="orderExecutionConfiguration">OrderExecutionConfiguration</a></li> -->
				<li><a href="nonApprovedOrder">Order Approvals</a></li>
				<li><a href="orderList">Order List</a></li>
				<li><a href="tokenList">Coin List</a></li>
				<li><a href="withdraw">Withdraw</a></li>
				<li class="dropdown "><a class="dropdown-toggle"
					data-toggle="dropdown" href="#">User<span class="caret"></span></a>
					<ul class="dropdown-menu">
						<li><a href="addUserForm">Add a User</a></li>
						<li><a href="changePasswordForm">Change Password</a></li>
						<li><a href="userList">Show User List</a></li>

					</ul></li>
								</sec:authorize>
				<sec:authorize access="hasRole('USER')">
				<li><a href="list">User List</a></li>
				<li><a href="userTokenList">Coin List</a></li>
				</sec:authorize>
			</ul>
			<ul class="nav navbar-nav navbar-right">
				<li class="dropdown "><a class="dropdown-toggle"
					data-toggle="dropdown" href="#"> <span
						class=" glyphicon glyphicon-user"></span>&nbsp;&nbsp;Welcome <%=name%>
						<span class="caret"></span>
				</a>
					<ul class="dropdown-menu">
						<li><a href="changeUserPassword">Change Password</a></li>
						<li><a
							href="javascript:document.getElementById('logout').submit()">Logout</a></li>
					</ul></li>
			</ul>
		</div>
	</div>
</nav>


<c:url value="/logout" var="logoutUrl" />
<form id="logout" action="${logoutUrl}" method="post">
	<input type="hidden" name="${_csrf.parameterName}"
		value="${_csrf.token}" />
</form>
