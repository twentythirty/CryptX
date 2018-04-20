
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<script type="text/javascript"
	src="<c:url value='/static/js/password.js' />"></script>
<style>
.min {
	min-height: 94%;
}

#alert {
	display: none;
}
</style>
<script type="text/javascript">	

 $(function(){

	// add multiple select / deselect functionality
	$("#selectall").click(function () {
		  $('.case').attr('checked', this.checked);
	});

	// if all checkbox are selected, check the selectall checkbox
	// and viceversa
	$(".case").click(function(){

		if($(".case").length == $(".case:checked").length) {
			$("#selectall").attr("checked", "checked");
		} else {
			$("#selectall").removeAttr("checked");
		}

	});
}); 
	 function multipleOrderApproved(){
		var orderList = (function() {
			var a = [];
			    $(".case:checked").each(function() {
			        a.push(this.value);
			    });
			    return a;
			})()
			$.ajax({
				 type:"GET",
				url:'approvedMultipleOrder',
				contentType: "application/json; charset=utf-8",
				data:{
					'orderList':orderList,
				},
				success:function(data){
					document.cookie = "cn=approved";
					document.cookie = "data="+data;
					window.location.reload();
				},
				error:function(e){
					console.log(e)
				}
			 });
	} 
	function approvedTradingOrder(id){
		var oid = id[0].value;
		$.ajax({
			 type:"GET",
			url:'approvedTradingOrder',
			contentType: "application/json; charset=utf-8",
			data:{
				'oid': oid,
			},
			success:function(data){
				document.cookie = "cn=approved;";
				document.cookie = "data=Order has been approved;";
				window.location.reload();
			},
			error:function(e){
				console.log(e)
			}
		 });
	}
	
	$( function () {
		var cn = getCookieData("cn");
	    if (cn=='approved') {
	    	var data = getCookieData("data");
	    	$("#alert").css("display","block");
    		$("#msg").html(data);
	        delete_cookie('cn');
	        delete_cookie('data');
	    }
	} )
	
	$(document).ready(function(){
		 
		var emptyList = '${emptyList}';
		var orderList = '${orderList}';
		var recountRecipe = '${recountRecipe}';
		var already = '${already}';
		var againRead = '${againRead}';
		
		if(emptyList=='true'){
			
			$('#emptyList').text("You don't have enough balance in your account");
		}
		else if(againRead=='true'){
			
			$('#emptyList').html("Please read api data from coinmarketcap<br><a href='readApiData'>Click here</a>");
		}
		else if(recountRecipe=='true'){
			$('#emptyList').html("Please regenerate your recipe <br><a href='regenerateRecipe'>Click here</a>");
		}
		else if(orderList.length==2){
			$('#emptyList').text("No order found for approval");	
		}
		
		if(already=='true'){
			alert('Orders already generated');
		}
		
	});
</script>

<div class="min">
	<div class="container">
		<div class="alert alert-success alert-dismissable fade in" id="alert">
			<a href="#" class="close" data-dismiss="alert" aria-label="close"
				id="close">&times;</a> <strong><span id="msg"><center></center></span></strong>
		</div>
		<center>
			<h2>Non Approved Orders</h2>
		</center>

	</div>
	<div class="container">
		<c:choose>
			<c:when test="${not empty orderList}">
				<div class="table-responsive">
					<table data-page-length='10' id="tableData"
						class="table table-striped table-bordered dt-responsive nowrap">
						<thead id="example">
							<tr class="info theadPadding">
								<th><input type="checkbox" id="selectall"
									style="margin-left: -8px"></th>
								<th style="padding-left: 8px">SR</th>
								<th style="padding-left: 8px">Token Name</th>
								<th style="padding-left: 8px">Exchange</th>
								<th style="padding-left: 8px">Rate</th>
								<th style="padding-left: 9px">Amount</th>
								<th style="padding-left: 8px">Execute</th>
								<th style="padding-left: 8px">Action</th>
							</tr>
						</thead>
						<tbody class="tableData">
							<c:forEach var="order" items="${orderList}" varStatus="myIndex">
								<tr>
									<td><input type="checkbox" class="case"
										id="id${myIndex.index}" value="${order.id}"></td>
									<td><c:out value="${(myIndex.index)+1}" /></td>
									<td><c:out value="${order.tokenName}" /></td>
									<td><c:out value="${order.exchange}" /></td>
									<td><c:out value="${order.rate}" /></td>
									<td><c:out value="${order.amount}" /></td>
									<td><c:out value="${order.execute}" /></td>
									<td><a href="#" id="id${myIndex.index}"
										onclick="approvedTradingOrder(id${myIndex.index})">Approve</a></td>
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
				<div class="row">
					<div class="col-md-6 col-md-offset-6">
						<Button class="btn btn-primary btn-md"
							onclick="multipleOrderApproved()" style="margin-bottom: 20px">Approve</Button>
					</div>
				</div>
			</c:when>
			<c:otherwise>
				<center>
					<H3>
						<span id="emptyList"></span>
					</H3>
				</center>
			</c:otherwise>
		</c:choose>

	</div>
</div>

