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
				<h1>User List</h1>
			</center>
			<c:choose>
				<c:when test="${not empty userList}">
					<div class="table-responsive">


						<table data-page-length='30' id="tableData"
							class="table table-striped table-hover dt-responsive nowrap"
							cellspacing="0" width="100%">
							<thead class="thead-default " id="example">
								<tr>
									<th>SR.</th>
									<th>First Name</th>
									<th>Last Name</th>
									<th>Email</th>
								</tr>
							</thead>
							<tbody class="tableData">
								<c:forEach items="${userList}" var="user" varStatus="myIndex">

									<tr>
										<th scope="row">${myIndex.count}</th>
										<td>${user.firstName}</td>
										<td>${user.lastName}</td>
										<td>${user.email }</td>
									</tr>

								</c:forEach>


							</tbody>
						</table>

					</div>
				</c:when>
				<c:otherwise>
					<center>
						<h4>No User Found mdnfsjhfs</h4>
					</center>
				</c:otherwise>
			</c:choose>
		</div>
	</div>
</div>