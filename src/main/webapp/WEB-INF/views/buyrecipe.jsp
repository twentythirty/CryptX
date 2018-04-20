<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
 <%@ taglib uri='http://java.sun.com/jsp/jstl/core' prefix='c'%><html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Insert title here</title>
</head>
<body>
	<div class="table-responsive min">
		<table data-page-length='30'
			class="table table-striped table-hover dt-responsive nowrap tableData"
			cellspacing="0" width="100%" id="tableData">
			<thead class="thead-default" id="example">
				<tr>
					<th style="padding-left: 10px">SN.</th>
					<th style="padding-left: 10px">Coin Name</th>
					<th style="padding-left: 10px">Symbol</th>
					<th style="padding-left: 10px">Amount</th>
					<th style="padding-left: 10px">Exchange</th>
					<th style="padding-left: 10px">Ask</th>
					<th style="padding-left: 10px">Flag</th>
					<th style="padding-left: 10px">Recipe Type</th>
				</tr>
			</thead>
			<tbody class="tableBody">
				<c:forEach items="${data}" var="csv" varStatus="i">
					<tr>
						<th scope="row">${i.count }</th>
						<td>${csv.name }</td>
						<td>${csv.symbol }</td>
						<td>${csv.amount }</td>
						<td>${csv.exchangeName }</td>
						<td>${csv.ask }</td>
						<td>${csv.flag }</td>
						<td>${csv.tokenType }</td>	
					</tr>
				</c:forEach>
			</tbody>
		</table>
	</div>
		<script type="text/javascript" src="jquery.dataTables.js"></script>
    <script type="text/javascript" src="dataTables.numericComma.js"></script>
	<script type="text/javascript">
		$(document).ready(function() {
			$('#tableData').DataTable({
				"lengthMenu" : [ [ 10, 30, 50, -1 ], [ 10, 30, 50, "All" ] ]
			});
		});
	</script>
</body>
</html>