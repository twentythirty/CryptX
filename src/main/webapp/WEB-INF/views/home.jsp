
<style>
#example {
	color: #377;
}
</style>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>
<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c"%>
<html>
<style>
.min {
	min-height: 94%;
}
</style>
<body>

	<div class="table-responsive min">


		<table data-page-length='30'
			class="table table-striped table-hover dt-responsive nowrap tableData"
			cellspacing="0" width="100%" id="tableData">
			<thead class="thead-default" id="example">
				<tr>
					<th style="padding-left: 10px">SN.</th>
					<th style="padding-left: 10px">Pair</th>
					<th style="padding-left: 10px">Exchange</th>
					<th style="padding-left: 10px">Last Traded Price</th>
					<th style="padding-left: 10px">7 Days Volume</th>
				</tr>
			</thead>
			<tbody class="tableBody">
				<c:forEach items="${coinList}" var="csv" varStatus="i">

					<tr>
						<th scope="row">${i.count }</th>
						<td>${csv.market }</td>
						<td>${csv.exchange }</td>
						<td>${csv.last_trade }</td>
						<td id="am">${csv.current_volume }</td>
					</tr>

				</c:forEach>


			</tbody>
			</tbody>
		</table>

	</div>

	<script type="text/javascript">
		$(document).ready(function() {
			$('#tableData').DataTable({
				"lengthMenu" : [ [ 10, 30, 50, -1 ], [ 10, 30, 50, "All" ] ],
				"aoColumnDefs": [ {
					   "aTargets": [5],
					   "fnCreatedCell": function (nTd, sData, oData, iRow, iCol) {
					     var $currencyCell = $(nTd);
					     var commaValue = $currencyCell.text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
					     $currencyCell.text(commaValue);
					   }
					}]
			});
		});
		function formatNumber(n) {
			  return n.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
			}
	</script>
	
</body>
</html>
