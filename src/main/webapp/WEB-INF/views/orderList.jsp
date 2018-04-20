<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<style>
	.min {
		min-height: 94%;
	}
	#alert{
		display: none;	
	}
</style>

<div class="container min">
	<center>
		<h1>Success Orders List</h1>
	</center>
	<c:choose>
		<c:when test="${not empty successOrdersList}">
		<div class="table-responsive">
			<table data-page-length='50' id="tableData"
				class="table table-striped table-bordered dt-responsive nowrap"
				cellspacing="0" width="100%">
				<thead id="example">
					<tr class="info">
						<th>Order Id</th>
						<th>Exchange Code</th>
						<th>TradePair</th>
						<th>Quantity</th>
						<th>Time</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody class="tableData">
					<c:forEach var="order" items="${successOrdersList}" varStatus="myIndex">
							<tr>
								<td><c:out value="${order.orderId}" /></td>
								<td><c:out value="${order.exchangeCode}" /></td>
								<td><c:out value="${order.tradePair}" /></td>
								<td><c:out value="${order.quantity}" /></td>
								<td><c:out value="${order.timestamp}" /></td>
								<td><c:out value="${order.status}" /></td>
							</tr>
					</c:forEach>
				</tbody>
			</table>
			</div>
			<script type="text/javascript">
				$(document).ready(function() {
				    $('#tableData').DataTable( {
				        "lengthMenu": [[10, 25, 50,100 ,-1], [10, 25, 50, 100,"All"]]
				    } );
				} );
				</script>
		</c:when>
		<c:otherwise>
			<center>
				<h4>No success order found</h4>
			</center>
		</c:otherwise>
	</c:choose>
</div>
