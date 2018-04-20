<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<style>
.min {
	min-height: 94%;
}
</style>
<script type="text/javascript">
	$(document).ready(function() {
		$('#tableData').DataTable({
			"lengthMenu" : [ [ 10, 30, 50, -1 ], [ 10, 30, 50, "All" ] ]
		});
	});
</script>

<div class="container min">
	<div class="row">
		<div class="col col-md-8 col-sm-offset-2">
			<center>
				<h1>Coin List</h1>
			</center>
			<c:choose>
				<c:when test="${not empty tokenList}">
					<div class="table-responsive">
						<table data-page-length='30' id="tableData"
							class="table table-striped table-hover dt-responsive nowrap"
							cellspacing="0" width="100%">
							<thead class="thead-default" id="example">
								<tr class="info">
									<th>Id</th>
									<th>Coin Name</th>
									<th>Preferred Exchange</th>
									<th>BlackList</th>
								</tr>
							</thead>
							<tbody class="tableData">
								<c:forEach items="${tokenList}" var="token" varStatus="myIndex">

									<tr>
										<td><c:out value="${myIndex.count}" /></td>
										<td><c:out value="${token.tokenName}" /></td>
										<td><c:out value="${token.preferredExchange}" /></td>
										<c:choose>
												<c:when test="${token.blacklist}">
													<td>Yes</td>
												</c:when>
												<c:otherwise>
													<td>No</td>
												</c:otherwise>
											</c:choose>
									</tr>

								</c:forEach>


							</tbody>
						</table>

					</div>
				</c:when>
				<c:otherwise>
					<center>
						<h4>No Coin Found</h4>
					</center>
				</c:otherwise>
			</c:choose>
		</div>
	</div>
</div>