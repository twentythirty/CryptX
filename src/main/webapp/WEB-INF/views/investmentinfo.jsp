<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>
<%@ taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>

<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Investment Run Information</title>
</head>
<body>
	<div class="table-responsive min">
		<table data-page-length='30'
			class="table table-striped table-hover dt-responsive nowrap tableData"
			cellspacing="0" width="100%" id="tableData">
			<thead class="thead-default" id="example">
				<tr>
					<th style="padding-left: 10px">SN.</th>
					<th style="padding-left: 10px">InvestRunId</th>	
					<th style="padding-left: 10px">Strategy Type</th>
					<th style="padding-left: 10px">Investment Mode</th>
					<th style="padding-left: 10px">InworkFlow State</th>
					<th style="padding-left: 10px">Amount</th>
					<th style="padding-left: 10px">Currency</th>
					<th style="padding-left: 10px">Number of Shares</th>
					<th style="padding-left: 10px">Start DateTime</th>
					<th style="padding-left: 10px">Last Updated DateTime</th>
					<th style="padding-left: 10px">Complete DateTime</th>
				</tr>
			</thead>
			<tbody class="tableBody">
			
				<c:forEach items="${data}" var="csv" varStatus="i">
				 
					<tr style = "cursor: pointer;" onclick="document.location = 'getInvestmentWorkflowDetailReq?id=${csv.id}';">
						<th scope="row">${i.count }</th>
						<td>${csv.id}</td>
						<td>${csv.strategyType.name }</td>
						<td>${csv.investmentMode.name }</td>
						<td>${csv.invWorkflowState.name }</td>
						<td>${csv.amount }</td>
						<td>${csv.currency }</td>
						<td>${csv.numberOfShares }</td>
						<td>${csv.startedDateTime }</td>
				    	<td>${csv.lastUpdatedDateTime }</td>
						<td>${csv.completedDateTime }</td>
					</tr>
					
				</c:forEach>
			</tbody>
		</table>
		<center>
			<a href="newinvestmentinfo" class="btn btn-primary mb-2 submit" >New Investment</a>
		</center>
		</div>
	<script type="text/javascript" src="jquery.dataTables.js"></script>
	<script type="text/javascript" src="dataTables.numericComma.js"></script>
	<script type="text/javascript">
		$(document).ready(function() {
			$('#tableData').dataTable({
				"lengthMenu" : [ [ 10, 30, 50, -1 ], [ 10, 30, 50, "All" ] ]
			});
		});