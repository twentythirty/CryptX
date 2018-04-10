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
<title>Order Details Page</title>
</head>
<body>

	<div class="table-responsive min">
		<table data-page-length='30'
			class="table table-striped table-hover dt-responsive nowrap tableData"
			cellspacing="0" width="100%" id="tableData">
			<thead class="thead-default" id="example">
				<tr>
				    <th style="padding-left: 10px">OrderRun Id</th>
					<th style="padding-left: 10px">InvestmentRun ID</th>
					<th style="padding-left: 10px">RecipeRun ID</th>
					<th style="padding-left: 10px">InvestmentMode ID</th>
					<th style="padding-left: 10px">User</th>
					<th style="padding-left: 10px">DatetimeGenerated</th>
				</tr>
			</thead>
			
			<tbody class="tableBody">
					<tr>
					    <td>${orderRun.id}</td> 
						<td>${orderRun.investmentRun.id}</td>
						<td>${orderRun.recipeRun.id}</td>
						<td>${orderRun.investmentMode.name}</td>
						<td>${orderRun.user.firstName}</td>
						<td>${orderRun.dateTimeGenerated}</td>
					</tr>
			</tbody>
		</table>
	</div>
	
<h4>Order Details<h4>

	<div class="table-responsive min">
	
		<table data-page-length='30'
			class="table table-striped table-hover dt-responsive nowrap tableData"
			cellspacing="0" width="100%" id="tableData">
			<thead class="thead-default" id="example">
				<tr>
				    <th style="padding-left: 10px">SN.</th>
					<th style="padding-left: 10px">Coin Name</th>
					<th style="padding-left: 10px">BaseCoin</th>
					<th style="padding-left: 10px">Exchange</th>
					<th style="padding-left: 10px">Amount(In USD)</th>
					<th style="padding-left: 10px">Ask Price</th>
					<th style="padding-left: 10px">Quantity</th>
				</tr>
			</thead>
			
			 <tbody class="tableBody">
			 <c:forEach items="${orderDetial}" var="order" varStatus="i">
			        
					<tr>
					    <th scope="row">${i.count}</th>
						<td>${order.coinTokenId}</td>
						<td>${order.baseCoin.currencyName}</td>
						<td>${order.exch_code}</td>
						<td>${order.amount}</td>
						<td>${order.price}</td>
						<td>${order.quantity}</td>
					</tr>
			</c:forEach>
			</tbody>
		</table>
        <center>
			<input type="submit" class="btn btn-primary mb-2 submit" data-toggle="modal" data-target="#approveModal" value="Approve">
		    <input type="submit" class="btn btn-primary mb-2 submit"  data-toggle="modal" data-target="#rejectModal" value="Reject">
		</center>

<div id="rejectModal" class="modal fade" role="dialog">
  <div class="modal-dialog">

    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title">Rejection</h4>
      </div>
      <div class="modal-body">
      <form:form action="rejectOrder" commandName="orderApprovalsDTO" method="post">
        <div class="form-group">
						<label class="control-label">Rationale : <span id="invRecId"
							style="padding-left: 9px;"></span></label>
							<!--  <input type="hidden" name="invId" id="invId" >  -->
							 <input type="hidden" name="orderRunId" id="orderRunId" value = "${orderRun.id}">
							 <input type="text"	name="rationale" id="rationale">
					</div>
      </div>
      <div class="modal-footer">
        <input type="submit" value="Ok" class="btn btn-primary">
      </form:form>  
      </div>
    </div>

  </div>
</div>

<div id="approveModal" class="modal fade" role="dialog">
  <div class="modal-dialog">

    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title">Approval</h4>
      </div>
      <div class="modal-body">
      <form:form action="approveOrder" commandName="orderApprovalsDTO" method="post">
        <div class="form-group">
						<label class="control-label">Rationale : <span id="invRecId"
							style="padding-left: 9px;"></span></label>
							<!--  <input type="hidden" name="invId" id="invId" >  -->
							 <input type="hidden" name="orderRunId" id="orderRunId" value = "${orderRun.id}">
							 <input type="text"	name="rationale" id="rationale">
					</div>
      </div>
      <div class="modal-footer">
        <input type="submit" value="Ok" class="btn btn-primary">
      </form:form>  
      </div>
    </div>
  </div>
 </div> 
</body>
</html>