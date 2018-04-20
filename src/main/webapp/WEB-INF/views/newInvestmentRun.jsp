<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>
<%@ taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>

<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>New InvestmentRun Page</title>
</head>
<body>
<c:choose>
 <c:when test = "${investrundata !=null}">
<div class="table-responsive min">
		<table data-page-length='30'
			class="table table-striped table-hover dt-responsive nowrap tableData"
			cellspacing="0" width="100%" id="tableData">
			<thead class="thead-default" id="example">
				<tr>
				    <th style="padding-left: 10px">InvestmentRun Id</th>
				    <th style="padding-left: 10px">Strategy</th>
					<th style="padding-left: 10px">Investment Mode</th>
					<th style="padding-left: 10px">Currency($)</th>
					<th style="padding-left: 10px">Amount</th>
					<th style="padding-left: 10px">Number of shares</th>
					<th style="padding-left: 10px">InvWorkFlow State</th>
					<th style="padding-left: 10px">StartDateTime</th>
				</tr>
			</thead>
			
			<tbody class="tableBody">
					<tr>
					    <td>${investrundata.id}</td> 
					    <td>${investrundata.strategyType.name}</td>
						<td>${investrundata.investmentMode.name}</td> 
						<td>${investrundata.currency}</td> 
						<td>${investrundata.amount}</td> 
						<td>${investrundata.numberOfShares}</td> 
						<td>${investrundata.invWorkflowState.name}</td>
						<td>${investrundata.startedDateTime}</td>
					</tr>
			</tbody>
		</table>
	</div>
	<center>
	   <a href="createFirstRecipeRunReq?id=${investrundata.id}" id ="recipeRunId" class="btn btn-primary mb-2 submit">Recipe Run</a>
	</center>
	</c:when>
	<c:otherwise>
	<div>
	<h5>You have already invested using these data.</h5>
	</div>
	</c:otherwise>
	</c:choose>
	
 </body>
</html>