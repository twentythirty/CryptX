<!DOCTYPE html>

<%@page import="org.springframework.security.core.userdetails.User"%>
<%@page
	import="org.springframework.security.core.context.SecurityContextHolder"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<%@ taglib prefix="security"
	uri="http://www.springframework.org/security/tags"%>

<script type="text/javascript"
	src="<c:url value='/static/js/password.js' />"></script>
<style>
#emailDiv {
	width: 566px;
}

.min {
	min-height: 94%;
}

#alert {
	display: none;
}
</style>
<script>
function userUpdate(id){
	var uid = id[0].value;
	$.ajax({
		 type:"GET",
		url:'updateUserForm',
		contentType: "application/json; charset=utf-8",
		data:{
			'uid': uid,
		},
		dataType : 'json',
		success:function(data){
			$("#uid").val(data.user.uid);
			$("#firstName").val(data.user.firstName);
			$("#lastName").val(data.user.lastName);
			$("#email").val(data.user.email);
			$("#username").val(data.user.email);
		},
		error:function(eq, status, err){
			console.log(err);
		}
	 });
}



function deleteUser(id){
	var uid = id[0].value;
	console.log(uid);
	$.ajax({
		 type:"GET",
		url:'deleteUser',
		data:{
			'uid': uid,
		},
		dataType : 'json',
		success:function(data){
			document.cookie = "un=delete;";
			window.location.reload(true);
		},
		error:function(eq, status, err){
			console.log(err);
		}
	 });
}


$(document).ready(function(){
	var update = '${update}';
	var addUser = '${addUser}';
	var cn = getCookieData("un");
    if (cn=='delete') {
    	$("#alert").css("display","block");
		$("#msg").html("User has been deleted");
        delete_cookie('un');
    }
	if(update !=0){
		$("#alert").css("display","block");
		$("#msg").html(update);
	}
	if(addUser !=0){
		$("#alert").css("display","block");
		$("#msg").html(addUser);	
	}
	});
	
$(document).ready(function() {
	$('#tableData').DataTable({
		"lengthMenu" : [ [ 10, 30, 50, -1 ], [ 10, 30, 50, "All" ] ]
	});
});
</script>

<div class="container-fluid min">

	<div class="row" id="alert">
		<div class="col-sm-4 col-sm-offset-4">
			<div class="alert alert-success alert-dismissable fade in">
				<a href="#" class="close" data-dismiss="alert" aria-label="close"
					id="close">&times;</a> <strong><center id="msg"></center></strong>
			</div>
		</div>
	</div>
	<center>
		<h1>User List</h1>
	</center>
	<c:choose>
		<c:when test="${not empty userList}">
			<div class="table-responsive">


				<table data-page-length='30' id="tableData"
					class="table table-striped table-hover dt-responsive nowrap"
					cellspacing="0" width="100%">
					<thead class="thead-default" id="example">
						<tr>
							<th>First Name</th>
							<th>Last Name</th>
							<th>Email</th>
							<th>Admin Role</th>
							<th>Edit User</th>
							<th>Delete User</th>
						</tr>
					</thead>
					<tbody class="tableData">
						<c:forEach items="${userList}" var="user" varStatus="myIndex">

							<tr>
								<td>${user.firstName}</td>
								<td>${user.lastName}</td>
								<td>${user.email }</td>
								<td><c:choose>
										<c:when test="${user.adminRole }">
								Yes
							</c:when>
										<c:otherwise>
							No
							</c:otherwise>
									</c:choose></td>
								<td><input type="hidden" name="id" id="id${myIndex.index}"
									value="${user.uid}"><a href="#"
									class="btn btn-success btn-xl" id="id${myIndex.index}"
									onclick="userUpdate(id${myIndex.index})" data-toggle="modal"
									data-target="#myModal">Edit</a></td>
								<td><input type="hidden" name="deleteId"
									id="deleteId${myIndex.index}" value="${user.uid}"><a
									href="#" class="btn btn-success btn-xl"
									id="deleteId${myIndex.index}"
									onclick="deleteUser(deleteId${myIndex.index})">Delete</a></td>
								</td>
							</tr>

						</c:forEach>


					</tbody>
				</table>

			</div>
		</c:when>
		<c:otherwise>
			<center>
				<h4>No User Found</h4>
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

				<h4 class="modal-title" id="myModalLabel">Update User
					Information</h4>
			</div>

			<div class="modal-body">
				<form:form action="updateUserInformation" commandName="userDTO"
					method="post" onsubmit="return checkDuplicateEmail()">

					<div class="row">
						<div class="form-group name1 col-md-6">
							<input type="hidden" name="uid" id="uid"> <input
								type="hidden" name="username" id="username"> <label
								for="exampleInputEmail1" class="formText">FIRST NAME:*</label> <input
								type="text" class="form-control" id="firstName"
								aria-describedby="emailHelp" name="firstName"
								required="required">
						</div>

						<div class="form-group name2 col-md-6">
							<label for="exampleInputEmail1## Heading ##" class="formText">LAST
								NAME:*</label> <input type="text" class="form-control" id="lastName"
								aria-describedby="emailHelp" name="lastName" required="required">
						</div>
					</div>
					<div class="form-group">
						<label class="control-label">Email :</label>
						<div class="input-group input-group-sm" id="emailDiv">
							<input type="email" id="email" name="email" class="form-control"
								required="required" onblur="checkDuplicateEmail()"><br>
							<span id="duplicate" style="color: red"></span> <span id="em"
								class="glyphicon form-control-feedback"></span>
						</div>
						<span id="duplicate" style="color: #b30000"></span>
					</div>
					<div class="form-group">
						<label class="control-label">Admin </label> <select
							name="adminRole" id="adminRole" class="form-control"
							required="required">
							<option value="no">No</option>
							<option value="yes">Yes</option>

						</select>
					</div>

					<div class="modal-footer">
						<button type="button" class="btn btn-default" data-dismiss="modal">
							Close</button>
						<input type="submit" value="Submit" class="btn btn-primary"
							onclick="return checkDuplicateEmail()">

					</div>
				</form:form>
			</div>



		</div>
		<!-- /.modal-content -->
	</div>
	<!-- /.modal-dialog -->

</div>


