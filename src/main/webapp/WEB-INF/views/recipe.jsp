<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>
<%@ taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>

<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Calcultaed Recipe Page</title>
</head>
<body>
<div class="table-responsive min">
		<table data-page-length='30'
			class="table table-striped table-hover dt-responsive nowrap tableData"
			cellspacing="0" width="100%" id="tableData">
			<thead class="thead-default" id="example">
				<tr>
				    <th style="padding-left: 10px">Strategy</th>
					<th style="padding-left: 10px">Investment Mode</th>
					<th style="padding-left: 10px">Currency($)</th>
					<th style="padding-left: 10px">Amount</th>
					<th style="padding-left: 10px">Number of shares</th>
				</tr>
			</thead>
			
			<tbody class="tableBody">
					<tr>
					    <td>${invRun.strategyType.name}</td> 
						<td>${invRun.investmentMode.name}</td> 
						<td>${invRun.currency}</td> 
						<td>${invRun.amount}</td> 
						<td>${invRun.numberOfShares}</td> 
					</tr>
			</tbody>
		</table>
	</div>
	<div class="table-responsive min">
		<table data-page-length='30'
			class="table table-striped table-hover dt-responsive nowrap tableData"
			cellspacing="0" width="100%" id="tableData">
			<thead class="thead-default" id="example">
				<tr>
					<th style="padding-left: 10px">SN.</th>
					<th style="padding-left: 10px">Coin Name</th>
					<th style="padding-left: 10px">Symbol</th>
					<th style="padding-left: 10px">24 Hours Volume (&dollar;)</th>
					<th style="padding-left: 10px">Market Cap (&dollar;)</th>
					<th style="padding-left: 10px">Amount (&dollar;)</th>
					<th style="padding-left: 10px">Recipe Type</th>
					<th style="padding-left: 10px">Tradable</th>
					<th style="padding-left: 10px">Date</th>
				</tr>
			</thead>
			<tbody class="tableBody">
				<c:forEach items="${data}" var="csv" varStatus="i">
					<tr>
						<th scope="row">${i.count }</th>
						<td>${csv.coinIgyToken.tokenName }</td>
						<td>${csv.coinIgyToken.symbol }</td>
						<td>${csv.volume24USD }</td>
						<td>${csv.marketCapUSD }</td>
						<td>${csv.investAmount }</td>
						<td>${csv.tokenType }</td>
						<td>${csv.tradable }</td>
						<td>${csv.date }</td>
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
      <form:form action="rejectRecipeReq" commandName="investmentApprovalsDTO" method="post">
        <div class="form-group">
						<label class="control-label">Rationale : <span id="invRecId"
							style="padding-left: 9px;"></span></label> <input type="hidden"
							name="invId" id="invId" > <input type="hidden" name="recipeRunId" id="recipeRunId" value = "${recRunId}">
							<input type="text"
							name="rationale" id="rationale">
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
      <form:form action="approveRecipeReq" commandName="investmentApprovalsDTO" method="post">
        <div class="form-group">
						<label class="control-label">Rationale : <span id="invRecId"
							style="padding-left: 9px;"></span></label> 
							<input type="hidden" name="invId" id="invId" value = "${id}">
							<input type="hidden" name="recipeRunId" id="recipeRunId" value = "${recRunId}"> 
							<input type="text" name="rationale" id="rationale">
					</div>
      </div>
      <div class="modal-footer">
        <input type="submit" value="Ok" class="btn btn-primary">
      </form:form>  
      </div>
    </div>

  </div>
 </div>
</div>

	<script type="text/javascript" src="jquery.dataTables.js"></script>
	<script type="text/javascript" src="dataTables.numericComma.js"></script>
	<script type="text/javascript">
		$(document).ready(function() {
			var id = '${id}';
			$('#invId').val(id);
			$('#tableData').dataTable({
				"lengthMenu" : [ [ 10, 30, 50, -1 ], [ 10, 30, 50, "All" ] ]
			});
		});
		
        /* $('.submit').click(function(){
        	
			var id = '${id}';
			var submit = $(this).val();
			
			if(submit=='Approve'){
				$.post("approveRecipeReq",
				        {
				          'id': id
				        },
				        function(data,status){
				            
				            if(data=='done'){
				            	// wirte code when everythign is fine
				            }
				            else if(data=='fail'){
				            	// write code if something wrong
				            }
				 });
				
			}
			
		}); */
	</script>
</body>
</html>