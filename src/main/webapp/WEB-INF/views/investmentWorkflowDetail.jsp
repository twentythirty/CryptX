<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="sec"
	uri="http://www.springframework.org/security/tags"%>
<%@ taglib prefix = "fmt" uri = "http://java.sun.com/jsp/jstl/fmt" %>


<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Investment Workflow Details Page</title>

<script>
$(window).on("load",function(){
   
	$(".workflowstateId").each(function(){
		var id = $(this).attr('id');
		var appId = '#approveId'+id;
		var createdId = '#createId'+id;
		var rejId = '#rejectId'+id;
		var status= $(this).text();
		
		
		if(status =='RecipeApproved')
		{
		   $(createdId).show();
		   $(appId).hide();
		   $(rejId).hide();
		   $(newRecipeRunId).hide();
		}
	    
		else if(status =='Rejected')
		{
		
		   $(createdId).hide();
		   $(rejId).hide();
		   $(appId).hide();
		}
		else if(status =='OrdersGenerated')
		{
		
		   $(createdId).hide();
		   $(rejId).hide();
		   $(appId).hide();
		   $(newRecipeRunId).hide();
		}
		
		else if(status =='Initiated'){
			   $(appId).show();
			   $(rejId).show();
	    	   $(createdId).hide();
			}
		console.log(id);
		
	});
	
    /* var status= $("#workflowstateId").text();
    if(status =='Initiated')
    	{
    	
    	   $("#createId").hide();
    	   $("#approveId").show();
    	}
    
    if(status =='RecipeApproved')
	{
	alert('Recipe');
	   $("#createId").show();
	   $("#approveId").hide();
	}
    
    if(status =='Rejected')
	{
	
	   $("#createId").hide();
	   $("#approveId").hide();
	} */
    
	
})

</script>
</head>
<body>
<c:forEach items="${test}" var="recipe" varStatus="myIndex">
	<div class="table-responsive min">
		<table data-page-length='30'
			class="table table-striped table-hover dt-responsive nowrap tableData"
			cellspacing="0" width="100%" id="tableData">
			<thead class="thead-default" id="example">
				<tr>
				    <th style="padding-left: 10px">InvestmentRun Id</th>
					<th style="padding-left: 10px">RecipeRun Id</th>
					<th style="padding-left: 10px">User Name</th>
					<th style="padding-left: 10px">Approval Status</th>
					<th style="padding-left: 10px">DateTimeStamp</th>
					<th style="padding-left: 10px">Invest Workflow State</th>
					<th style="padding-left: 10px">Investment Mode</th>
					<th style="padding-left: 10px">Strategy Type</th>
				</tr>
			</thead>
			
			<tbody class="tableBody">
					<tr>
					    <td>${recipe.recipeRunInvApprovalDTO.investmentRun.id}</td> 
						 <td>${recipe.recipeRunInvApprovalDTO.recipeRun.id}</td>
						<td>${recipe.recipeRunInvApprovalDTO.recipeRun.user.firstName}</td>
						<td class="approvalTypeId" id="${myIndex.index}">${recipe.recipeRunInvApprovalDTO.invApprovals.approvalType.name}</td>
						<td>${recipe.recipeRunInvApprovalDTO.invApprovals.dateTime}</td>
						<td class="workflowstateId" id="${myIndex.index}">${recipe.recipeRunInvApprovalDTO.investmentRun.invWorkflowState.name}</td>
						<td>${recipe.recipeRunInvApprovalDTO.investmentRun.investmentMode.name }</td>
						<td>${recipe.recipeRunInvApprovalDTO.investmentRun.strategyType.name}</td> 
					</tr>
			</tbody>
		</table>
	</div>
	
	<div class="table-responsive min">
	<h4>Recipe Details<h4>
		<table data-page-length='30'
			class="table table-striped table-hover dt-responsive nowrap tableData"
			cellspacing="0" width="100%" id="tableData">
			<thead class="thead-default" id="example">
				<tr>
					<th style="padding-left: 10px">Coin Name</th>
					<th style="padding-left: 10px">Contribution (%)</th>
					<th style="padding-left: 10px">Exchange</th>
					<th style="padding-left: 10px">Price</th>
					<th style="padding-left: 10px">BaseCoin</th>
				</tr>
			</thead>
			 <tbody class="tableBody">
				<c:forEach items="${recipe.recipeDetailList}" var="csv">
					<tr>
						<td>${csv.coinName}</td>
						<td> <fmt:formatNumber type = "number" minFractionDigits = "2" value = "${csv.contribution}" /> %</td>
						<td>${csv.exchangeName}</td>
						<td>${csv.price}</td>
						<td>${csv.baseCoin.currencyName}</td>
					</tr>
				</c:forEach>
			</tbody>
		</table>
	 <center>
	 <c:if test='${test.size()==myIndex.index+1}'> 
			<a href="investmentinfo" class="btn btn-primary mb-2 submit" >Back</a>
			<a href="createOrderReq?id=${recipe.recipeRunInvApprovalDTO.recipeRun.id}" id ="createId${myIndex.index}" class="btn btn-primary mb-2 submit">Create Order</a>
			<%-- <a href="approveRecipeReq?id=${investmentRunData.id}" class="btn btn-primary mb-2 submit" id ="approveId${myIndex.index}" style="dispaly:none;">Approve</a --%>
			<c:set var = "recRun" scope = "request" value = "${recipe.recipeRunInvApprovalDTO.recipeRun.id}"/>
			<input type="submit" id ="approveId${myIndex.index}" class="btn btn-primary mb-2 submit" data-toggle="modal" data-target="#approveModal" value="Approve">
			<input type="submit" id ="rejectId${myIndex.index}" class="btn btn-primary mb-2 submit" data-toggle="modal" data-target="#rejectModal" value="Reject">
	</c:if> 
	</center>
	</c:forEach>
	<center>
	<a href="newRecipeRunReq?id=${investmentRunData.id}" id ="newRecipeRunId" class="btn btn-primary mb-2 submit">New Recipe Run</a>
	</center>
	
<div id="approveModal" class="modal fade" role="dialog">
  <div class="modal-dialog">

    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title">Approval</h4>
      </div>
      <div class="modal-body">
      <form:form action="approveRecipeReq" commandName="investmentApprovalsDTO" method="post">
        <div class="form-group">
						<label class="control-label">Rationale : <span id="invRecId"
							style="padding-left: 9px;"></span></label> <input type="hidden"
							name="recipeRunId" id="invId" value = "<c:out value = "${recRun}"/>"> <input type="text"
							name="rationale" id="rationale">
					</div>
      </div>
      <div class="modal-footer">
        <input type="submit" value="Ok" class="btn btn-primary" id="approveId">
      </form:form>  
      </div>
    </div>

  </div>
 </div>	

<div id="rejectModal" class="modal fade" role="dialog">
  <div class="modal-dialog">

    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title">Rejection</h4>
      </div>
      <div class="modal-body">
      <form:form action="rejectRecipeReq" commandName="investmentApprovalsDTO" method="post">
        <div class="form-group">
						<label class="control-label">Rationale : <span id="invRecId"
							style="padding-left: 9px;"></span></label> <input type="hidden"
							name="recipeRunId" id="invId" value = "<c:out value = "${recRun}"/>">
							<input type="text"
							name="rationale" id="rationale">
					</div>
      </div>
      <div class="modal-footer">
        <input type="submit" value="Ok" class="btn btn-primary" id="rejectId">
      </form:form>  
      </div>
    </div>

  </div>
</div>
</body>
</html>