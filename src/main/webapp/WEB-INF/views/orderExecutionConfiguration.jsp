<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core"  prefix="c"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<style>


* {box-sizing: border-box}
/* Full-width input fields */
input[type=text], input[type=password] {
    width: 100%;
    padding: 15px;
    margin: 5px 0 22px 0;
    display: inline-block;
    border: none;
    background: #f1f1f1;
}

/* Add a background color when the inputs get focus */
input[type=text]:focus, input[type=password]:focus {
    background-color: #ddd;
    outline: none;
}


/* Extra styles for the cancel button */
.cancelbtn {
    padding: 14px 20px;
    background-color: #f44336;
    
} 
#okbtnId {
    color: #fff;
    border: 0 none;
    font-size: 16px;
    background-color: #337ab7;
    padding: 6px 12px;
    border-color: #2e6da4;
    border-radius: 4px;
    width: 80px;
    display: block;
    margin: 0 auto;
    float: none;
}
#okbtnId:hover, #okbtnId:active, #okbtnId.active {
color: #fff;
    background-color: #204d74;
    border-color: #122b40;
    box-shadow: inset 0 3px 5px rgba(0,0,0,.125)
}

/* Float cancel and signup buttons and add an equal width */
.cancelbtn, .signupbtn {
  float: left;
  width: 50%;
}

/* Add padding to container elements */


/* The Modal (background) */
.modal {
    display: none; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 1; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: #474e5d;
    padding-top: 50px;
}

/* Modal Content/Box */
.modal-content {
    background-color: #fefefe;
    margin: 5% auto 15% auto; /* 5% from the top, 15% from the bottom and centered */
    border: 1px solid #888;
    width: 80%; /* Could be more or less, depending on screen size */
}

/* Style the horizontal ruler */
hr {
    border: 1px solid #f1f1f1;
    margin-bottom: 25px;
}
 
/* The Close Button (x) */
.close {
    position: absolute;
    right: 20px;
    top: 10px;
    font-size: 40px;
    font-weight: bold;
    color: #0a0a0a;
    z-index: 99999;
}

.close:hover,
.close:focus {
    color: #f44336;
    cursor: pointer;
}

/* Clear floats */
.clearfix::after {
    content: "";
    clear: both;
    display: table;
}
.newInvestPopup .modal-header .close {
margin:0
}
.newInvestPopup .modal-header {
    height: 56px;
}

</style>
<title>Order Execution Configuration</title>

<script>

/*  $(document).ready(function(){

    $("#amount").keyup(function(){
       	var t = $("#amount").val();
        var tt = t/1000;
        $("#share").val(tt);
    });
 */     
    $("#okButtonId").click(function(){
    	$("#strategyIdval").text($('#dropDownId :selected').text());
    	$("#invModeIdval").text($('#invModeId :selected').text());
    	$("#currencyIdVal").text($('#currencyId :selected').text());
    	$("#amountIdVal").text($('#amount').val());
    	$("#shareIdVal").text($('#share').val());
    	$("#id01").css("display", "block");
    	
    });
    
    $("#okbtnId").click(function(){
    	$("#formId").submit();
    });
 
    


</script>
</head>
<body>
	<div class="container">
		<form:form action="orderExecutionConfigurationSubmit" id="formId" method="post">
			<div class="form-group row">
				<label for="baseCoin" class="col-sm-2 col-form-label">Base Coin</label>
				<div class="col-sm-3">
					<select id="dropDownId" name="baseCoin" class="selectpicker">
						<option value="BTC">BTC</option>
						<option value="ETH">ETH</option>
					</select>
				</div>
			</div>
			<div class="form-group row">
				<label for="orderType" class="col-sm-2 col-form-label">Order Type</label>
				<div class="col-sm-3">
					<select id="invModeId" name="orderType" class="selectpicker">
						<option value="Market">Market</option>
						<option value="ImmediateOrCancel">ImmediateOrCancel</option>
						<option value="Good-til-canceled">Good-til-canceled</option>
						<option value="Limit">Limit</option>
						<option value="Market-to-Limit">Market-to-Limit</option>
					</select>
				</div>
			</div>
			<div class="form-group row">
				<label for="exch_code" class="col-sm-2 col-form-label">Exchange</label>
				<div class="col-sm-3">
					<select id="currencyId" name="exch_code" class="selectpicker" >
					<c:forEach items="${exchangeListData}" var="csv">
						<option value="${csv.exch_code}">${csv.exch_code}</option>
					</c:forEach>	
					</select>
				</div>
			</div>
			<div class="form-group row">
				<label for="lot" class="col-sm-2 col-form-label">Lot</label>
				<div class="col-sm-3">
					<input id="amount" type="text" class="form-control"  name="lot"
						placeholder="Lot">
				</div>
			</div>`
			<div class="form-group row">
				<label for="timeInterval" class="col-sm-2 col-form-label">Time Interval</label>
				<div class="col-sm-3">
					<input id="timeInterval" type="text" class="form-control"  name="timeInterval"
						placeholder="Time Interval">
				</div>
			</div>`
			<center>
				<input type="submit" class="btn btn-primary mb-2" id="okButtonId" value="Ok">
			</center>
		</form:form>
  </div>

</body>
</html>  
		
<%-- <div id="id01" class="modal">
  <div class="modal-dialog modal-md">
  <form class="modal-content newInvestPopup" action="/action_page.php">
  
  	<div class="modal-header">
  		<span onclick="document.getElementById('id01').style.display='none'" class="close" title="Close Modal">&times;</span>
  	</div>
  	<div class="modal-body">
      <table class="table">
      	
      	<tbody>
      		<tr>
      			<td>Strategy</td><td><label id="strategyIdval" ><b></b></label></td>
      		</tr>
      		<tr>
      			<td>Investment Mode</td><td><label id="invModeIdval"><b></b></label></td>
      		</tr>
      		<tr>
      			<td>Currency</td><td><label id="currencyIdVal"><b></b></label></td>
      		</tr>
      		<tr>
      			<td>Amount</td><td><label id="amountIdVal"><b></b></label></td>
      		</tr>
      		<tr>
      			<td>Share</td><td><label id="shareIdVal"><b></b></label></td>
      		</tr>
      	</tbody>
      </table>
      <label for="Strategy"><b></b></label>
      <label id="strategyIdval" ><b></b></label>

      <label for="InvestmentMode"><b></b></label>
      <label id="invModeIdval"><b></b></label>      
       
      <label for="Currency"><b></b></label>
      <label id="currencyIdVal"><b></b></label> 
      
      <label for="Amount"><b></b></label>
      <label id="amountIdVal"><b></b></label> 
      
      <label for="Share"><b></b></label>
      <label id="shareIdVal"><b></b></label> 
		</div>
      <div class="modal-footer">
        <button type="button" id = "okbtnId" class="cancelbtn">Ok</button>
      </div>
     
    
  </form>
  </div>
</div> --%>
	