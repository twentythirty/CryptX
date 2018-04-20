<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1"%>
<%@ page isELIgnored="false"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="tiles"%>

<html>

<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
<title><tiles:getAsString name="title" /></title>

</head>

<body>
	<header id="header">
		<tiles:insertAttribute name="header" />
	</header>
	<section id="site-content">
		<tiles:insertAttribute name="body" />
	</section>

		<tiles:insertAttribute name="footer" />
		
	
</body>
</html>