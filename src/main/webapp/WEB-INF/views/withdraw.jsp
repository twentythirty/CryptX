<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form"%>
<%@ taglib prefix="c"  uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>
<style>
form {
	border: 2px solid black;
	outline-color: red;
}

.address {
	display: none;
}

h2 {
	font-family: inherit;
	color: blueviolet;
}

.min {
	min-height: 94%;
}
</style>
<script type="text/javascript">
	var specialKeys = new Array();
	specialKeys.push(8); //Backspace
	specialKeys.push(9); //Tab
	specialKeys.push(46); //Delete
	specialKeys.push(36); //Home
	specialKeys.push(35); //End
	specialKeys.push(37); //Left
	specialKeys.push(39); //Right
	function IsAlphaNumeric(e) {
		var keyCode = e.keyCode == 0 ? e.charCode : e.keyCode;
		var ret = ((keyCode >= 48 && keyCode <= 57)
				|| (keyCode >= 65 && keyCode <= 90)
				|| (keyCode >= 97 && keyCode <= 122) || (specialKeys
				.indexOf(e.keyCode) != -1 && e.charCode != e.keyCode));
		document.getElementById("error").style.display = ret ? "none"
				: "inline";
		return ret;
	}
	/*
	
	Ethereum Address Validation Code
	
	 */
	var isAddress = function(address) {
		if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
			// check if it has the basic requirements of an address
			return false;
		} else if (/^(0x)?[0-9a-f]{40}$/.test(address)
				|| /^(0x)?[0-9A-F]{40}$/.test(address)) {
			// If it's all small caps or all all caps, return true
			return true;
		} else {
			// Otherwise check each case
			return isChecksumAddress(address);
		}
	};

	/**
	 * Checks if the given string is a checksummed address
	 *
	 * @method isChecksumAddress
	 * @param {String} address the given HEX adress
	 * @return {Boolean}
	 */
	var isChecksumAddress = function(address) {
		// Check each case
		address = address.replace('0x', '');
		var addressHash = sha3(address.toLowerCase());
		for (var i = 0; i < 40; i++) {
			// the nth letter should be uppercase if the nth digit of casemap is 1
			if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i])
					|| (parseInt(addressHash[i], 16) <= 7 && address[i]
							.toLowerCase() !== address[i])) {
				return false;
			}
		}
		return true;
	};

	/*
	End Ethereum Validation Code
	
	 */

	function submitFormData() {
		var withdrawAddress = document.getElementById('withdrawAddress').value;
		var symbol = document.getElementById('symbol').value;
		if (withdrawAddress == '') {
			$("#error").html("Please provide the address");
			return false
		}
		var valid;
		if (symbol == 'BTC' || symbol == 'LTC' || symbol == 'PPC'
				|| symbol == 'DOGE' || symbol == 'BVC' || symbol == 'FRC'
				|| symbol == 'PTS' || symbol == 'MEC' || symbol == 'XPM'
				|| symbol == 'AUR' || symbol == 'NMC') {
			valid = WAValidator.validate(withdrawAddress, symbol);
		} else if (symbol == 'ETH') {
			valid = isAddress(withdrawAddress);
		}
		if (!valid) {
			$("#mandatory").html("This is an invalid address");
			return false;
		} else {
			$("#mandatory").html("");
			return true;
		}
	}
	function checkDuplicateAddress() {
		var withdraw = document.getElementById('withdrawAddress').value;
		var withdrawAddress = withdraw.trim();
		$
				.ajax({
					type : "GET",
					url : 'checkDuplicateAddress',
					contentType : "application/json; charset=utf-8",
					data : {
						'withdrawAddress' : withdrawAddress,
					},
					success : function(data) {
						if (data == '\"yes\"') {
							document.getElementById('mandatory').innerHTML = 'Address is already stored';
							$('#withdrawAddress').val('');
						} else {
							document.getElementById('mandatory').innerHTML = '';
						}
					},
					error : function(e) {
						alert('error ' + e);
						console.log(e);
					}
				});

	}
	function showAddressListByCoin() {
		$(".address").css({
			"display" : "block"
		});
		var coinSymbol = document.getElementById('newCoinList').value;
		$.ajax({
			type : "GET",
			url : 'showAddressListByCoin',
			contentType : "application/json; charset=utf-8",
			data : {
				'coinSymbol' : coinSymbol,
			},
			success : function(data) {
				$('#updateAddress')[0].options.length = 0;
				for (var i = 0, len = data.length; i < len; ++i) {
					var withdraw = data[i];
					$('#updateAddress').append(
							'<option value=' + withdraw.withdrawAddress + '>'
									+ withdraw.withdrawAddress + '</option>');
				}
				$("#updateAddress").selectpicker("refresh");
			},
			error : function(e) {
				$('#updateAddress')[0].options.length = 0;
				alert('error ' + e);
				console.log(e);
			}
		});
	}

	function updateAddress() {
		var coinSymbol = document.getElementById('newCoinList').value;
		var withdrawAddress = document.getElementById('updateAddress').value;
		if(coinSymbol=='' || withdrawAddress == ''){
			return false;
		}
		$.ajax({
			type : "POST",
			url : 'updateAddress',
			data : {
				'withdrawAddress' : withdrawAddress,
				'coinSymbol' : coinSymbol,
			},
			success : function(data) {
				$("#alert").css("display", "block");
				$("#msg").html("Address has been activated");
			},
			error : function(e) {
				alert('error ' + e);
				console.log(e);
			}
		});
	}

	$(document).ready(function() {
		var addAddress = '${addAddress}';
		var duplicate = '${duplicate}';
		if (addAddress != '') {
			$("#alert").css("display", "block");
			$("#msg").html("Address has been stored");
		}
		if (duplicate != '') {
			$("#mandatory").html("Address is already exists");
		} else {
			$("#mandatory").html("");
		}
	});
</script>

<div class="min">
<div class="container">
<div class="row" id="alert" style="display: none">
		<div class="col-sm-4 col-sm-offset-4">
		<div class="alert alert-success alert-dismissable fade in">
			<a href="#" class="close" data-dismiss="alert" aria-label="close"
				id="close">&times;</a> <strong><center id="msg"></center></strong>
		</div>
		</div>
	</div>
  <center><h2>Add Address</h2></center>
  <center><span id="msg"></span></center>
  <form:form class="form-horizontal" method="POST" modelAttribute="withdrawDTO" action="addAddress">
  
    <div class="form-group" style="margin-top: 23px;">
      <label class="control-label col-sm-2 " for="withdrawAddress">Withdraw Address:</label>
      <div class="col-sm-6">
        <input type="text" class="form-control" id="withdrawAddress" placeholder="Withdraw Address" name="withdrawAddress" onkeypress="return IsAlphaNumeric(event);" onblur="checkDuplicateAddress()" required="required">
     	<span id="error" style="color: #b30000; display: none">* Special Characters not allowed</span>
     	<span id="mandatory" style="color:#b30000"></span>
      </div>
    </div>
    <div class="form-group">
      <label class="control-label col-sm-2" for="coinName">Select Coin</label>
      <div class="col-sm-10">
   		 <select name="symbol" id="symbol" class="selectpicker" data-live-search="true"  title="Select-Coin"  required="required">
			<span id="selectError"></span>
			<c:forEach  items="${coinList}" var="coin">
				<option value="<c:out value="${coin.symbol }"/>"><c:out value="${coin.token.tokenName}"/>(<c:out value="${coin.symbol}"/>)</option>
			</c:forEach>
		</select>
	 </div>
   </div>
    <div class="form-group">        
      <div class="col-sm-offset-3 col-sm-9">
       <input type="submit" class="btn btn-primary" onclick="return submitFormData()" style="margin-left: 230px" value="Submit">
      </div>
    </div>
  </form:form>
</div>
<div class="container">
 	<center><h2 style="margin-top: 45px;">Active Address</h2></center>
 	<form:form class="form-horizontal" method="get" action="#">
	 <div class="form-group"  style="margin-top: 23px;">
		   <label class="control-label col-sm-2" for="coinName">Select Coin</label>
		  <div class="col-sm-4">
	   		 <select name="newCoinList" id="newCoinList" class="selectpicker" required="required" data-live-search="true"  title="Select-Coin"  required="required" onchange="showAddressListByCoin()">	
				<c:forEach  items="${coinList}" var="coin">
					<option value="<c:out value="${coin.symbol }"/>"><c:out value="${coin.token.tokenName}"/>(<c:out value="${coin.symbol}"/>)</option>
				</c:forEach>
			</select>
		  </div>
		  <div class="address">
			  <label class="control-label col-sm-2" for="updateAddress">Select Address</label>
		      <div class="col-sm-4">
		   		 <select  id="updateAddress" class="selectpicker" data-live-search="true"  title="Select-Address"  required="required" >	
					
				</select>
			  </div>
		  </div>
	</div>
	<div class="form-group">        
      <div class="col-sm-offset-3 col-sm-9">
           <a href="javascript:updateAddress()"><button type="button" class="btn btn-primary"  style="margin-left: 230px">Submit</button></a>
      </div>
    </div>
	</form:form>
</div>





</div>