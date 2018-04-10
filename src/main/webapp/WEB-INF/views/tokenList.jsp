<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<style>
.min {
	min-height: 94%;
}

#alert {
	display: none;
}
</style>
<script type="text/javascript">	
function tokenUpdate(id){
	var tid = id[0].value;
	debugger;
	$.ajax({
		 type:"GET",
		url:'updateTokenForm',
		contentType: "application/json; charset=utf-8",
		data:{
			'tid': tid,
		},
		dataType : 'json',
		success:function(data){
			debugger;
			document.getElementById('tokenId').value = data.token.id;
			document.getElementById('tokenN').innerHTML = data.token.tokenName;
			document.getElementById('tokenName').value = data.token.tokenName;
			//alert(data.token.isBlackList);
			if(data.token.isBlackList == true) {
				$('#blacklist').val('No');
			}else{
				$('#blacklist').val('Yes');
			} 
		},
		error:function(eq, status, err){
			debugger;
readOnly
			
		},
		error:function(eq, status, err){
			debugger;
			console.log(err);
		}
	 });
}
$(document).ready(function() {
	var changePassword = '${update}';
	if (changePassword != 0) {
		$("#alert").css("display","block");
		$("#msg").html(changePassword);
	}
});

</script>


<div class="container min">
	<div class="row" id="alert">
		<div class="col-sm-4 col-sm-offset-4">
			<div class="alert alert-success alert-dismissable fade in">
				<a href="#" class="close" data-dismiss="alert" aria-label="close"
					id="close">&times;</a> <strong><center id="msg"></center></strong>
			</div>
		</div>
	</div>
	<center>
		<h1>Coin List</h1>
	</center>
	<c:choose>
		<c:when test="${not empty tokenList}">
			<div class="table-responsive">
				<table data-page-length='50' id="tableData"
					class="table table-striped table-bordered dt-responsive nowrap"
					cellspacing="0" width="100%">
					<thead id="example">
						<tr class="info">
							<th>Id</th>
							<th>Coin Name</th>
							<th>Comments</th>
							<th>BlackList</th>
							<th><center>Modify</center></th>
						</tr>
					</thead>
					<tbody class="tableData">
						<c:forEach var="token" items="${tokenList}" varStatus="myIndex">
							<tr>
								<td><c:out value="${myIndex.count}" /></td>
								<td><c:out value="${token.tokenName}" /></td>
								<td><c:out value="${token.comments}" /></td>
								<td><c:out value="${token.blacklist}"/></td>

								<td><center>
										<input type="hidden" name="id" id="id${myIndex.index}"
											value="${token.tokenId}"><a href="#"
											class="btn btn-success " id="id${myIndex.index}"
											onclick="tokenUpdate(id${myIndex.index})" data-toggle="modal"
											data-target="#myModal">Edit</a>
									</center></td>
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
				<h4>No Coin Found</h4>
			</center>
		</c:otherwise>
	</c:choose>
</div>
<!-- Modal -->
<div class="modal fade" id="myModal" tabindex="-1" role="dialog"
	aria-labelledby="myModalLabel" aria-hidden="true">

	<div class="modal-dialog">
		<div class="modal-content">

			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal"
					aria-hidden="true" title="close window"
					style="margin-right: -148px;">&times;</button>

				<h4 class="modal-title" id="myModalLabel">Update Coin
					Information</h4>
			</div>

			<div class="modal-body">
				<form:form action="updateTokenInformation" commandName="tokenDTO"
					method="post">
					<div class="form-group">
						<label class="control-label">Coin Name : <span id="tokenN"
							style="padding-left: 9px;"></span></label> <input type="hidden"
							name="tokenId" id="tokenId"> <input type="hidden"
							name="tokenName" id="tokenName">
					</div>
					<div class="form-group">
						<label class="control-label">Blacklist : </label> 
						
						<input type="text" name="blacklist" id="blacklist" readonly class="form-control"/>						
					</div>
					<div class="form-group">


						<label class="control-label"> Comments :</label> <input
							type="text" id="comments" name="comments" class="form-control"
							required="required"><br>
					</div>
			</div>

			<div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal">
					Close</button>
				<input type="submit" value="Save Changes" class="btn btn-primary">
				</form:form>
			</div>

		</div>
		<!-- /.modal-content -->
	</div>
	<!-- /.modal-dialog -->

</div>
