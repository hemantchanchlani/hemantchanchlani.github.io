


var globalsymbol = 'SPX';
var defaultQty = 1;
var strikesToSearch = 40;


var minincrement = {

	'SPY': 1,
	'QQQ': 1,
	'IWM': 1,
	'SPX': 5,
	'RUT': 5,
	'AAPL': 2.5,
	'TSLA': 2.5

}


var buyLegMinimum = {

	'SPX': .1,
	'RUT': .1,
	'AAPL': .1,
	'IWM': .01,
	'SPY': .01,
	'QQQ': .01,
	'TSLA': 1

};

var buyLegMinimumStraddle = {

	'SPX': .2,
	'RUT': .1,
	'AAPL': .1,
	'IWM': .01,
	'SPY': .01,
	'QQQ': .01,
	'TSLA': 1

};


var minimumCredit = {

	'SPX': 1,
	'RUT': 1,
	'IWM': .11,
	'AAPL': 1.1,
	'SPY': .11,
	'QQQ': .11,
};


const URLS = {
	prod: 'https://api.tradier.com/v1/',
	beta: 'https://api.tradier.com/beta/',
	sandbox: 'https://sandbox.tradier.com/v1/',
	stream: 'https://stream.tradier.com/v1',
};


var latest = null;
var quoteRefresh = 200000;
var reloadOrderInterval = 200000;

var accountNumber = 'VA94962097';
var prodaccountNumber = '6YA26930';


var tradier = new Tradier(apiKey, 'sandbox');
var prodtradier = new Tradier(prodApiKey, 'prod');


// To use prod  - uncomment
tradier = prodtradier;
//prodtradier = tradier;

accountNumber = prodaccountNumber;

var access = localStorage.getItem('access');

var myPositions, myOrders;

function urlstringify(data) {

	var url = Object.keys(data).map(function (k) {
		return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
	}).join('&');

	return url;
}

let expiration = new Date();
// Extract the year, month, and day from the expiration date
const year = expiration.getFullYear();
const month = (expiration.getMonth() + 1).toString().padStart(2, '0');
let day = expiration.getDate().toString().padStart(2, '0');
function todate() {

	return year + '-' + month + '-' + day;;

}



function parseData(data) {
	return urlstringify(data);
}
function parseQuery(url, params) {
	const query =
		params &&
		urlstringify(params);
	return query ? `${url}?${query}` : url;
}



function footer(tooltipItems) {
	let sum = 0;

	tooltipItems.forEach(function (tooltipItem) {
		sum += tooltipItem.parsed.y;
	});
	return 'Sum: ' + sum;
};



function getPositions() {

	var positions = tradier.getPositions(accountNumber);




	positions.then((resp) => {

		var positions = [];
		if (!_.isArray(resp.account.positions.position)) {
			resp.account.positions.position = [resp.account.positions.position];
		}


		_.each(resp.account.positions.position, (position) => {

			if (Math.abs(position.quantity) == 1) {
				positions.push(position);
			} else {

				for (var count = 0; count < Math.abs(position.quantity); count++) {

					var p = _.clone(position);
					p.quantity = (position.quantity < 0) ? (-1 * defaultQty) : defaultQty;
					positions.push(p);
				}


			}

		});

		createPositionTable(positions);


	});

}

var allOrders;

function reLoadOrders() {
	var orders = tradier.getOrders(accountNumber);

	orders.then((val) => {
		allOrders = val;
		createBSTable(val);


	});

}

reLoadOrders();
//setInterval(reLoadOrders, reloadOrderInterval);




var trade = tradier;


/*tradier.createOrder(accountNumber, {
	'class': 'multileg',
	'symbol': globalsymbol,
	'type': 'credit',
	'duration': 'day',
	'price': '23.2',
	'option_symbol[0]': 'SPY230630C00438000',
	'side[0]': 'sell_to_open',
	'quantity[0]': '1',
	'option_symbol[1]': 'SPY230630C00440000',
	'side[1]': 'buy_to_open',
	'quantity[1]': '1'
});


tradier.createOrder(accountNumber, {
	'class': 'option',
	'symbol': globalsymbol,
	'option_symbol': 'SPY230630C00436000',
	'side': 'buy_to_open',
	'quantity': '1',
	'type': 'limit',
	'duration': 'day',
	'price': '30.00',
	'stop': '1.00',
	'tag': today
})
*/
function generateOptionSymbol(strike, oType) {


	let yr = year.toString().substr(-2);

	// Convert the strike price to a string and remove decimal point and leading zeros
	let strikeStr = strike.toFixed(3).replace('.', '');

	strikeStr = "00000000".substring(strikeStr.length) + strikeStr;

	var ggOp = (globalsymbol == 'SPX') ? 'SPXW' : globalsymbol;

	// Combine the symbol, year, month, day, and strike to form the option symbol
	let optionSymbol = `${ggOp}${yr}${month}${day}${oType}${strikeStr}`;

	return optionSymbol;
}




function createTable(data, id) {


	const theTable = $('#' + id);
	const UNIQUE_ID = 'id';

	const columns = [
		{ field: "id", title: "ID" },
		{ field: "parentOrderId", title: "Parent Order Id" },
		{ field: "option_symbol", title: "SYMBOL" },
		{ field: "strike", title: "strike" },

		{ field: "type", title: "Call or Put" },
		{ field: "quantity", title: "quantity" },

		{ field: "price", title: "price" },
		{ field: "side", title: "side" },
		{ field: "status", title: "status" },
		{ field: "transaction_date", title: "transaction_date" },


		{ field: "reason_description", title: "Reason" },

		{
			field: "tableAction", title: "Actions",
			formatter: (value, row, index, field) => {
				var parentid = (row['parentOrderId']) ? row['parentOrderId'] : row[UNIQUE_ID];
				var curID = row[UNIQUE_ID];
				var oType = row.type;
				return [
					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="cancelOrder(${parentid})">`,
					`<i class="far fa-trash-alt"></i>`,
					`</button>`,


					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="cancelOrder(${curID})">`,
					`(Just This)`,
					`</button>`,

				].join('')
			}
		}
	]

	theTable.bootstrapTable()
	theTable.bootstrapTable('refreshOptions',
		{
			columns: columns,
			//url: "https://jsonplaceholder.typicode.com/photos",
			data: data,
			uniqueId: "id",
			striped: true,
			pagination: true,
			sortable: true,
			pageNumber: 1,
			pageSize: 200,
			pageList: [10, 25, 50, 100],
			search: true,
			showToggle: true,
			searchHighlight: true,
		}
	)
	theTable.bootstrapTable('refresh')

}

function getRelevantOrders(data, status) {
	var today = new Date();

	var orders = data.account.orders.order;

	if (!_.isArray(data.account.orders.order)) {

		orders = [data.account.orders.order];

	}


	_.each(orders, (order) => {

		if (order.leg) {

			_.each(order.leg, (leg) => {

				leg.parentOrderId = order.id;

			})

		}


	});


	var legs = _.pluck(orders, "leg");



	var ndata = _.union(orders, _.flatten(_.compact(legs)));

	_.each(ndata, function (leg) {

		leg.price = (!leg.price) ? leg.avg_fill_price : leg.price;


	});

	myOrders = ndata;

	rdata = _.filter(ndata, function (order) {

		var orderCheck = (order.status == status && !order.leg) ? true : false;

		var cDate = new Date(order.create_date);

		return (cDate.getFullYear() == today.getFullYear() && cDate.getMonth() == today.getMonth() && today.getDate() == cDate.getDate() && orderCheck);



	});

	_.each(rdata, function (leg) {

		leg.quantity = (leg.side.indexOf('sell') > -1) ? leg.quantity * -1 : leg.quantity;

		leg.type = (leg.option_symbol.slice(6).indexOf("C") > -1) ? "CALL" : "PUT";

		leg.strike = parseInt(leg.option_symbol.slice(-8)) / 1000;


	});

	_.sortBy(rdata, function (o) { return o.transaction_date; });

	return rdata;



}


function createPositionTable(positions) {


	var data = myPositions = positions;

	if (!data) {

		data = [];
	}

	_.each(data, (position) => {

		position.cost_basis = (((position.cost_basis / position.quantity)) / 100).toFixed(2);
		position.type = (position.symbol.slice(6).indexOf("C") > -1) ? "CALL" : "PUT";
		position.strike = parseInt(position.symbol.slice(-8)) / 1000;
	});

	const theTable = $('#' + 'Positions');
	const UNIQUE_ID = 'id';

	const columns = [
		{ field: "id", title: "ID" },
		{ field: "symbol", title: "symbol" },
		{ field: "strike", title: "strike" },
		{ field: "type", title: "Call/PUT" },
		{ field: "quantity", title: "QTY" },
		{ field: "cost_basis", title: "trade_price" },
		{ field: "date_acquired", title: "date_acquired" },

		{
			field: "tableAction", title: "Action",
			formatter: (value, row, index, field) => {
				curID = row.id;
				var oType = row.type;
				return [

					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="addStopLimitOrder(${curID},.20,'p')">`,
					`|20 <i class="fa-solid fa-percent"></i>|`,
					`</button>`,

					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="addStopLimitOrder(${curID},.25,'p')">`,
					`|25 <i class="fa-solid fa-percent"></i>|`,
					`</button>`,

					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="addStopLimitOrder(${curID},.30,'p')">`,
					`|30 <i class="fa-solid fa-percent"></i>|`,
					`</button>`,


					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="addStopLimitOrder(${curID},.50,'p')">`,
					`|50 <i class="fa-solid fa-percent"></i>|`,
					`</button>`,



					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="addStopLimitOrder(${curID},.75,'p')">`,
					`|75 <i class="fa-solid fa-percent"></i>|`,
					`</button>`,



					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="addStopLimitOrder(${curID},1,'d')">`,
					`|100 <i class="fa-solid fa-dollar-sign"></i>|`,
					`</button>`,

					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="addStopLimitOrder(${curID},2,'d')">`,
					`|200 <i class="fa-solid fa-dollar-sign"></i>|`,
					`</button>`,



					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="rebalancePosition(${curID},1,'d')">`,
					`| risk-off x1 |`,
					`</button>`,



					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="rebalancePosition(${curID},2,'d')">`,
					`| risk-off x2 |`,
					`</button>`,


					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="rebalancePosition(${curID},3,'d')">`,
					`| risk-off x3 |`,
					`</button>`,



					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="rebalancePosition(${curID}, -1,'d')">`,
					`| take profit  x 1 |`,
					`</button>`,



					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="rebalancePosition(${curID},-2,'d')">`,
					`| take profit  x 2 |`,
					`</button>`,


					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="rebalancePosition(${curID},-3,'d')">`,
					`| take profit  x 3 |`,
					`</button>`,

					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="trailprofit(${curID},1.1,'d')">`,
					`| trailprofit 10% |`,
					`</button>`,

					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="trailprofit(${curID}, 1.2,'d')">`,
					`| trailprofit 20% |`,
					`</button>`,




					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="addStopLimitOrder(${curID},0,'d', true)">`,
					`|(close if @cost basis)|`,
					`</button>`,

					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="closeAtAsk(${curID})">`,
					`|(close @ ask now)|`,
					`</button>`,


					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="matchPercentOfOfThis(${curID},.5 , false)">`,
					`|(Risk Off and match @ ~ @50 of opposite)|`,
					`</button>`,


					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="buyOppositeWithMatchingPrice(${curID},1)">`,
					`|(Sell Opposite with matching price)|`,
					`</button>`,


					`<button type="button" class="btn btn-default btn-sm ${oType}" onclick="closeAtMarketOrder(${curID})">`,
					`|(close @ market now)| `,
					`</button>`
				].join('')
			}
		}
	]

	theTable.bootstrapTable()
	theTable.bootstrapTable('refreshOptions',
		{
			columns: columns,
			//url: "https://jsonplaceholder.typicode.com/photos",
			data: data,

			uniqueId: "id",
			striped: true,
			pagination: true,
			sortable: true,
			pageNumber: 1,
			pageSize: 200,
			pageList: [10, 25, 50, 100],
			search: true,
			showToggle: true,
			searchHighlight: true,
		}
	)
	theTable.bootstrapTable('refresh')




}


var timer = null;
function createBSTable(data) {

	if (data != 'null') {

		var canceled = getRelevantOrders(data, 'canceled', 'bs-Cancelled');
		var filled = getRelevantOrders(data, 'filled', 'bs-Filled');
		var pending = getRelevantOrders(data, 'pending', 'bs-Working');
		var open = getRelevantOrders(data, 'open', 'bs-Working');
		var rejected = getRelevantOrders(data, 'rejected', 'bs-Rejected');
		var expired = getRelevantOrders(data, 'expired', 'bs-Rejected');

		pending = _.union(pending, open);
		rejected = _.union(expired, rejected);






		if (pending.length) {


			if (timer != null) {
				window.clearInterval(timer);
				timer = null;
				timer = window.setInterval(reLoadOrders, reloadOrderInterval);
			}
			else {
				timer = window.setInterval(reLoadOrders, reloadOrderInterval);
			}

		} else {

			if (timer != null) {
				window.clearInterval(timer);
				timer = null;

			}
		}
		createTable(canceled, 'bs-Cancelled');
		createTable(filled, 'bs-Filled');
		createTable(pending, 'bs-Working');
		createTable(rejected, 'bs-Rejected');
	}


}

function closeAtMarketOrder(pId) {


	var position = _.where(myPositions, { 'id': pId })[0];


	var openOrder = _.where(allOrders.account.orders.order, { 'option_symbol': position.symbol, 'status': 'open' })[0];

	if (openOrder) {
		var cancelOrder = tradier.cancelOrder(accountNumber, openOrder.id);

		cancelOrder.then(resp => {


			var order = tradier.createOrder(accountNumber, {
				'class': 'option',
				'symbol': globalsymbol,
				'option_symbol': position.symbol,
				'side': (position.quantity < 0) ? 'buy_to_close' : 'sell_to_close',
				'quantity': Math.abs(position.quantity),
				'type': 'market',
				'duration': 'day',
				'tag': todate()
			});


			order.then(resp => {
				getPositions();
				showResponse(resp);


			}).catch((err) => {
				showResponse(err);
			})


		});
	} else {


		var order = tradier.createOrder(accountNumber, {
			'class': 'option',
			'symbol': globalsymbol,
			'option_symbol': position.symbol,
			'side': (position.quantity < 0) ? 'buy_to_close' : 'sell_to_close',
			'quantity': Math.abs(position.quantity),
			'type': 'market',
			'duration': 'day',
			'tag': todate()
		});


		order.then(resp => {
			getPositions();
			showResponse(resp);


		}).catch((err) => {
			showResponse(err);
		})
	}


}




function buyOppositeWithMatchingPrice(pId, percentofOppo) {

	var positionToMatch = _.where(myPositions, { 'id': pId })[0];

	var query = positionToMatch.symbol;


	if (positionToMatch.symbol.slice(6).indexOf("C") > -1) {
		var toSellType = "P";
	} else {
		var toSellType = "C";
	}

	var q = prodtradier.getQuote(query);

	q.then(val => {


		var strikeChosen = positionToMatch.symbol.slice(-7) / 1000;

		var symbol = generateOptionSymbol(strikeChosen, toSellType);

		placeStrangleLeg(symbol, strikeChosen, val.ask * percentofOppo);

	});




}




function matchPercentOfOfThis(pId, percentofOppo, same) {

	var positionToClose = _.where(myPositions, { 'id': pId })[0];
	var oppositeside;

	oppositeside = _.filter(myPositions, (position) => {

		return (position.quantity < 0 && position.symbol != positionToClose.symbol);


	});

	oppositeside = oppositeside[0];

	var query = oppositeside.symbol;


	if (positionToClose.symbol.slice(6).indexOf("C") > -1) {
		var oType = "C";
	} else {
		var oType = "P";
	}

	tryStrike = Math.floor((positionToClose.symbol.slice(-7) / 1000) / minincrement[globalsymbol]) * minincrement[globalsymbol];


	var incrementBy = minincrement[globalsymbol];


	for (var i = 0; i < strikesToSearch; i++) {
		if (oType == "C") {
			tryStrike = tryStrike + incrementBy;
		} else {

			tryStrike = tryStrike - incrementBy;
		}

		query = query + ',' + generateOptionSymbol(tryStrike, oType);

	}



	var q = prodtradier.getQuote(query);




	q.then(val => {

		var contenders = [];

		var thisSide = _.where(val, { 'symbol': oppositeside.symbol })[0];

		var askOfThis = thisSide.ask;

		var threshhold = askOfThis * percentofOppo;

		_.each(val, (option) => {

			if (option.bid <= threshhold && option.symbol != oppositeside.symbol) {

				contenders.push(option);

			}


		});


		if (oType == "C") {
			contenders = _.sortBy(contenders, (b) => { return b.strike });
		} else {

			contenders = _.sortBy(contenders, (b) => { return -b.strike });
		}

		var chosenOne = contenders[0];


		var limitPrice = (askOfThis - chosenOne.bid) * .95;


		var order = tradier.createOrder(accountNumber, {
			'class': 'multileg',
			'symbol': globalsymbol,
			'type': 'market',
			'duration': 'day',
			'price': limitPrice.toFixed(2),
			'option_symbol[0]': positionToClose.symbol,
			'side[0]': 'buy_to_close',
			'quantity[0]': defaultQty,
			'option_symbol[1]': chosenOne.symbol,
			'side[1]': 'sell_to_open',
			'quantity[1]': defaultQty,
			'tag': todate(),
			'strike' : sellSide.strike
		});


		order.then(resp => {
			showResponse(resp);

		}).catch((err) => {
			showResponse(err);
		})


	});




}



function closeAtAsk(pId) {

	var position = _.where(myPositions, { 'id': pId })[0];


	var openOrder = _.where(allOrders.account.orders.order, { 'option_symbol': position.symbol, 'status': 'open' })[0];


	if (openOrder) {

		var cancelOrder = tradier.cancelOrder(accountNumber, openOrder.id);

		cancelOrder.then(resp => {


			var q = prodtradier.getQuote(position.symbol);

			q.then((val) => {

				var order = tradier.createOrder(accountNumber, {
					'class': 'option',
					'symbol': globalsymbol,
					'option_symbol': position.symbol,
					'side': (position.quantity < 0) ? 'buy_to_close' : 'sell_to_close',
					'quantity': Math.abs(position.quantity),
					'type': 'limit',
					'duration': 'day',
					'price': (val.ask * .95).toFixed(2),
					'stop': (val.ask * .95).toFixed(2),
					'tag': todate()
				});



				order.then(resp => {


					showResponse(resp);


				}).catch((err) => {


					showResponse(err);
				})

			});



		}).catch((err) => {
			showResponse(err);
		})

	} else {


		var q = prodtradier.getQuote(position.symbol);

		q.then((val) => {

			var order = tradier.createOrder(accountNumber, {
				'class': 'option',
				'symbol': globalsymbol,
				'option_symbol': position.symbol,
				'side': (position.quantity < 0) ? 'buy_to_close' : 'sell_to_close',
				'quantity': Math.abs(position.quantity),
				'type': 'limit',
				'duration': 'day',
				'price': (val.ask * .95).toFixed(2),
				'stop': (val.ask * .95).toFixed(2),
				'tag': todate()
			});



			order.then(resp => {


				showResponse(resp);


			}).catch((err) => {


				showResponse(err);
			})

		});
	}


}



function trailprofit(pId, amt) {

	var positionToClose = _.where(myPositions, { 'id': pId })[0];



	var q = prodtradier.getQuote(positionToClose.symbol);

	q.then(val => {

		var buySide = val;

		var debit = buySide.ask;


		var netAmt = Math.abs(debit) * amt;;

		var order = tradier.createOrder(accountNumber, {
			'class': 'option',
			'symbol': globalsymbol,
			'option_symbol': positionToClose.symbol,
			'side': 'buy_to_close',
			'quantity': Math.abs(positionToClose.quantity),
			'type': 'stop_limit',
			'duration': 'day',
			'price': (netAmt * 1.05).toFixed(2),
			'stop': netAmt.toFixed(2),
			'tag': todate()
		});



		order.then(resp => {

			showResponse(resp);


		}).catch((err) => {

			showResponse(err);
		})


	});



}


function rebalancePosition(pId, leg, type, l) {

	var positionToClose = _.where(myPositions, { 'id': pId })[0];

	if (positionToClose.symbol.slice(6).indexOf("C") > -1) {
		var oType = "C";
	} else {
		var oType = "P";
	}

	var tryStrike = Math.floor((positionToClose.symbol.slice(-7) / 1000) / minincrement[globalsymbol]) * minincrement[globalsymbol];

	var adjustBy = minincrement[globalsymbol] * leg;

	if (oType == "P") {

		tryStrike = tryStrike - adjustBy;

	}


	if (oType == "C") {

		tryStrike = tryStrike + adjustBy;

	}

	var sellThisOption = generateOptionSymbol(tryStrike, oType);

	var query = positionToClose.symbol + ',' + sellThisOption;
	var q = prodtradier.getQuote(query);



	q.then(val => {


		if (positionToClose.quantity < 0) {
			var buySide = _.where(val, { 'symbol': positionToClose.symbol })[0];
			var sellSide = _.where(val, { 'symbol': sellThisOption })[0];
		} else {

			var sellSide = _.where(val, { 'symbol': positionToClose.symbol })[0];
			var buySide = _.where(val, { 'symbol': sellThisOption })[0];
		}

		var debit = buySide.ask;

		var credit = sellSide.bid;

		var netAmt = Math.abs(credit - debit);



		var orderType = 'credit';
		netAmt = netAmt * .95;
		if (leg > 0) {
			orderType = 'debit';
			netAmt = netAmt * 1.05;
		}


		if (positionToClose.quantity < 0) {

			var orderObj =

			{
				'class': 'multileg',
				'symbol': globalsymbol,
				'type': orderType,
				'duration': 'day',
				'price': netAmt.toFixed(2),
				'option_symbol[0]': positionToClose.symbol,
				'side[0]': 'buy_to_close',
				'quantity[0]': defaultQty,
				'option_symbol[1]': sellSide.symbol,
				'side[1]': 'sell_to_open',
				'quantity[1]': defaultQty,
				'tag': todate(),
				'strike' : sellSide.strike
			};

		} else {
			var orderObj =
			{
				'class': 'multileg',
				'symbol': globalsymbol,
				'type': orderType,
				'duration': 'day',
				'price': netAmt.toFixed(2),
				'option_symbol[0]': positionToClose.symbol,
				'side[0]': 'sell_to_close',
				'quantity[0]': defaultQty,
				'option_symbol[1]': sellSide.symbol,
				'side[1]': 'buy_to_open',
				'quantity[1]': defaultQty,
				'tag': todate()
			};

		}


		var order = tradier.createOrder(accountNumber, orderObj)





		order.then(resp => {

			showResponse(resp);


		}).catch((err) => {

			showResponse(err);
		})



	});



}

function addStopLimitOrder(pId, amt, type, l) {

	var position = _.where(myPositions, { 'id': pId })[0];

	var orders = _.where(myOrders, { 'option_symbol': position.symbol, 'status': 'filled' });

	if (false) {

		_.each(orders, (order) => {

			if (type == 'p') {

				var stop = order.avg_fill_price * (1 + amt);


			} else {

				var stop = order.avg_fill_price + amt

			}
			var limit = stop + (stop * .05);
			var order = tradier.createOrder(accountNumber, {
				'class': 'option',
				'symbol': globalsymbol,
				'option_symbol': order.option_symbol,
				'side': (order.side == 'sell_to_open') ? 'buy_to_close' : 'sell_to_close',
				'quantity': order.quantity,
				'type': 'stop_limit',
				'duration': 'day',
				'price': limit.toFixed(2),
				'stop': stop.toFixed(2),
				'tag': todate()
			})


			order.then(resp => {
				getPositions();
				showResponse(resp);


			}).catch((err) => {
				showResponse(err);
			})

		});
	}

	else {

		if (type == 'p') {

			var stop = parseFloat(position.cost_basis) * (1 + amt);


		} else {

			var stop = parseFloat(position.cost_basis) + amt

		}


		var limit = stop + (stop * .05);

		var order = tradier.createOrder(accountNumber, {
			'class': 'option',
			'symbol': globalsymbol,
			'option_symbol': position.symbol,
			'side': (position.quantity < 0) ? 'buy_to_close' : 'sell_to_close',
			'quantity': Math.abs(position.quantity),
			'type': (l) ? 'limit' : 'stop_limit',
			'duration': 'day',
			'price': limit.toFixed(2),
			'stop': stop.toFixed(2),
			'tag': todate()
		});



		order.then(resp => {

			showResponse(resp);


		}).catch((err) => {

			showResponse(err);
		})
	}


}

function cancelOrder(orderId) {

	var order = tradier.cancelOrder(accountNumber, orderId);

	order.then(resp => {

		showResponse(resp);


	}).catch((err) => {
		showResponse(err);
	})

}







function tradeCall(strike, type) {

	var symbol = 'SPX';


	var dateOfExpiry = todate();



	var values = window.location.href.split('?');

	if (values.length > 0) {
		var vals = window.location.href.split('?')[1].split('|');

		symbol = vals[0];

		if (vals.length > 1) {
			dateOfExpiry = '2023' + '-' + vals[1];

		}

	}


	console.log(today);


	trade(symbol, dateOfExpiry, strike, type);
}

var oldChangeInOICall = {};
var oldChangeInOIPut = {};

var sellToOpen = [];
var buyToOpen = [];
var sellToClose = [];
var buyToClose = [];


function showResponse(resp) {

	if (resp.status == 'ok') {
		$.toastr.success(JSON.stringify(resp));


	} else {

		try {
			$.toastr.error("--" + resp.response.data);
		} catch (e) {

			$.toastr.error("--" + e + '---ERROR - please check network tab asap >> respo = ' + resp);

		}

	}

	getPositions();
	reLoadOrders();

};


function showErrorMsg(resp) {



	$.toastr.error("!!!  " + resp + "  !!!");


};

var isBuySideWanted = $('#buyHedges').is(':checked');

function placeSpreadOrder(symbol, strikeChosen, isStraddle) {

	var minimumHedge = buyLegMinimum[globalsymbol];

	if (isStraddle) {
		minimumHedge = buyLegMinimumStraddle[globalsymbol];

	}


	var tryStrike = parseFloat(strikeChosen);
	isBuySideWanted = $('#buyHedges').is(':checked');
	isBuyMarket = !$('#buy-limit').is(':checked');

	var query = symbol;
	if (isBuySideWanted) {



		if (symbol.slice(6).indexOf("C") > -1) {
			var oType = "C";
		} else {
			var oType = "P";
		}

		var incrementBy = minincrement[globalsymbol];



		for (var i = 0; i < strikesToSearch; i++) {

			if (oType == "C") {
				tryStrike = tryStrike + incrementBy;
			} else {

				tryStrike = tryStrike - incrementBy;
			}


			query = query + ',' + generateOptionSymbol(tryStrike, oType);

		}
	}



	var q = prodtradier.getQuote(query);



	q.then(val => {

		if (isBuySideWanted) {
			var sellSide = _.where(val, { 'symbol': symbol })[0];
		} else {
			var sellSide = val;

		}
		if (isBuySideWanted) {

			var buySide = _.filter(val, (oc) => {

				return oc.ask <= minimumHedge;

			});



			if (oType == "C") {
				buySide = _.sortBy(buySide, (b) => { return b.strike });
			} else {

				buySide = _.sortBy(buySide, (b) => { return -b.strike });
			}


			buySide.length == 0 ? showErrorMsg('no buyside with price ' + minimumHedge + ' found') : '';

			var price = sellSide.bid - buySide[0].ask;

			price = price * .99;


			var order = tradier.createOrder(accountNumber, {
				'class': 'multileg',
				'symbol': globalsymbol,
				'type': (isBuyMarket) ? 'market' : 'credit',
				'duration': 'day',
				'price': price.toFixed(2),
				'option_symbol[0]': sellSide.symbol,
				'side[0]': 'sell_to_open',
				'quantity[0]': defaultQty,
				'option_symbol[1]': buySide[0].symbol,
				'side[1]': 'buy_to_open',
				'quantity[1]': defaultQty,
				'tag': todate(),
				'strike' : sellSide.strike
			})
		}

		else {

			var order = tradier.createOrder(accountNumber, {
				'class': 'option',
				'symbol': globalsymbol,
				'option_symbol': sellSide.symbol,
				'side': 'sell_to_open',
				'quantity': defaultQty,
				'type': (isBuyMarket) ? 'market' : 'limit',
				'duration': 'day',
				'price': (sellSide.bid * .99).toFixed(2),
				'tag': todate(),
				'strike' : sellSide.strike
			});





		}


		order.then((resp, data, xyx, hsh) => {

			order;

			showResponse(resp);


		}).catch((err) => {
			showResponse(err);
		})



	});


}




function makeButtons(cName, options) {

	$('.' + cName).empty();


	_.each(options, function (option) {

		if (cName.indexOf('call') >= 0) {
			var btnClass = ' btn btn-success-OTM ';
			if (option.strike > last) {
				btnClass = ' btn btn-success ';
			}


		} else {

			var btnClass = ' btn btn-danger-OTM ';

			if (option.strike < last) {
				btnClass = ' btn btn-danger ';
			}

		}

		$('.' + cName).append('<button style="width: 150px;"   class="' + btnClass + option.strike + ' ' + '" onclick=placeSpreadOrder("' + option.symbol + '","' + option.strike + '") value=' + option.symbol + '><b>$' + option.strike + "</b>-" + option.bid + "/" + option.ask + " " +
			'</button>');


	});

}

var last = 4500;
function showPutandCallOptions(oc, resp) {

	$('.call-button-holder').empty();
	$('.put-button-holder').empty();

	var putOptions = [];
	var callOptions = [];

	var percent = (isBuySideWanted) ? .02 : .03;

	if (oc) {
		_.each(oc.option, function (option) {

			if (Math.abs(option.strike - last) <= percent * last) {

				if (option.symbol.slice(6).indexOf("P") > -1) {

					if (globalsymbol == "SPX") {
						if (option.symbol.indexOf('SPXW') >= 0) {

							putOptions.push(option);
						}
					} else {

						putOptions.push(option);
					}
				} else {
					if (globalsymbol == "SPX") {
						if (option.symbol.indexOf('SPXW') >= 0) {
							callOptions.push(option);
						}
					} else {

						callOptions.push(option);
					}
				}
			}


		});
		makeButtons('call-button-holder', callOptions);
		makeButtons('put-button-holder', putOptions.reverse());


		var strikeChosenC = Math.ceil(last / minincrement[globalsymbol]) * minincrement[globalsymbol];
		var strikeChosenF = Math.floor(last / minincrement[globalsymbol]) * minincrement[globalsymbol];

		var floorDiff = Math.abs(strikeChosenF - last);
		var ceilDiff = Math.abs(strikeChosenC - last);
		var strikeChosen = strikeChosenC;
		if (floorDiff <= ceilDiff) {

			strikeChosen = strikeChosenF;
		}

		$('.' + strikeChosen).each(function () {
			$(this).removeClass().addClass("btn btn-light");
		});
	} else {
		showErrorMsg("No Option Chain Found")

	}

}





function getLatestQuote() {
	var t = prodtradier.getQuote(globalsymbol);
	t.then(q => {

		if (q && q.last) {
			last = Math.round(q.last);
			$('#lastquote').html(q.last);
		}

		var dateOfExpiry = todate();
		var oc = prodtradier.getOptionChains(globalsymbol, dateOfExpiry);


		oc.then((val, resp) => {
			showPutandCallOptions(val, resp);
		});

	});
}




function sellStraddleTogether(e) {
	e.preventDefault();
	globalsymbol = $('#symbol').val();


	var t = prodtradier.getQuote(globalsymbol);
	t.then(q => {

		if (q && q.last) {
			last = Math.round(q.last);
			$('#lastquote').html(last);
		}



		var strikeChosenC = Math.ceil(last / minincrement[globalsymbol]) * minincrement[globalsymbol];
		var strikeChosenF = Math.floor(last / minincrement[globalsymbol]) * minincrement[globalsymbol];

		var floorDiff = Math.abs(strikeChosenF - q.last);
		var ceilDiff = Math.abs(strikeChosenC - q.last);
		var strikeChosen = strikeChosenC;
		if (floorDiff <= ceilDiff) {

			strikeChosen = strikeChosenF;
		}


		var callSymbol = generateOptionSymbol(strikeChosen, "C");
		var putSymbol = generateOptionSymbol(strikeChosen, "P");
		placeSpreadOrder(callSymbol, strikeChosen, true);
		placeSpreadOrder(putSymbol, strikeChosen, true);

	});
}



function sellStraddle(e) {
	e.preventDefault();
	globalsymbol = $('#symbol').val();


	var t = prodtradier.getQuote(globalsymbol);
	t.then(q => {

		if (q && q.last) {
			last = Math.round(q.last);
			$('#lastquote').html(last);
		}



		var strikeChosenC = Math.ceil(last / minincrement[globalsymbol]) * minincrement[globalsymbol];
		var strikeChosenF = Math.floor(last / minincrement[globalsymbol]) * minincrement[globalsymbol];

		var floorDiff = Math.abs(strikeChosenF - q.last);
		var ceilDiff = Math.abs(strikeChosenC - q.last);
		var strikeChosen = strikeChosenC;
		if (floorDiff <= ceilDiff) {

			strikeChosen = strikeChosenF;
		}


		var callSymbol = generateOptionSymbol(strikeChosen, "C");
		var putSymbol = generateOptionSymbol(strikeChosen, "P");
		placeSpreadOrder(callSymbol, strikeChosen, true);
		placeSpreadOrder(putSymbol, strikeChosen, true);

	});
}



function sellCallStraddle(e) {
	e.preventDefault();
	globalsymbol = $('#symbol').val();
	var t = prodtradier.getQuote(globalsymbol);
	t.then(q => {

		if (q && q.last) {
			last = Math.round(q.last);
			$('#lastquote').html(last);
		}



		var strikeChosen = Math.ceil(last / minincrement[globalsymbol]) * minincrement[globalsymbol];
		var callSymbol = generateOptionSymbol(strikeChosen, "C");
		placeSpreadOrder(callSymbol, strikeChosen, true);

	});
}



function sellPutStraddle(e) {
	e.preventDefault();
	globalsymbol = $('#symbol').val();
	var t = prodtradier.getQuote(globalsymbol);
	t.then(q => {

		if (q && q.last) {
			last = Math.round(q.last);
			$('#lastquote').html(last);
		}

		var strikeChosen = Math.floor(last / minincrement[globalsymbol]) * minincrement[globalsymbol];
		var putSymbol = generateOptionSymbol(strikeChosen, "P");
		placeSpreadOrder(putSymbol, strikeChosen, true);

	});
}



sellStrangle = (type) => {

	globalsymbol = $('#symbol').val();


	var t = prodtradier.getQuote(globalsymbol);
	t.then(q => {

		if (q && q.last) {
			last = Math.round(q.last);
			$('#lastquote').html(last);
		}

		var strikeChosen = Math.ceil(last / minincrement[globalsymbol]) * minincrement[globalsymbol];

		var symbol = generateOptionSymbol(strikeChosen, type);

		placeStrangleLeg(symbol, strikeChosen);

	})
}



function placeStrangleLeg(symbol, strikeChosen, desirecCredit) {

	if (!desirecCredit) {

		desirecCredit = minimumCredit[globalsymbol];

	}


	isBuySideWanted = $('#buyHedges').is(':checked');
	isBuyMarket = !$('#buy-limit').is(':checked');


	var query = symbol;

	if (symbol.slice(6).indexOf("C") > -1) {
		var oType = "C";
		var tryStrike = parseFloat(strikeChosen) - 10 * minincrement[globalsymbol];
	} else {
		var oType = "P";
		var tryStrike = parseFloat(strikeChosen) + 10 * minincrement[globalsymbol];
	}

	var incrementBy = minincrement[globalsymbol];




	for (var i = 0; i < strikesToSearch; i++) {

		if (oType == "C") {
			tryStrike = tryStrike + incrementBy;
		} else {

			tryStrike = tryStrike - incrementBy;
		}


		query = query + ',' + generateOptionSymbol(tryStrike, oType);

	}




	var q = prodtradier.getQuote(query);



	q.then(val => {



		var sellSide = _.filter(val, (oc) => {

			return Math.abs(oc.bid >= desirecCredit)


		});


		sellSide = _.sortBy(sellSide, (oc) => {

			return Math.abs(oc.bid - desirecCredit)


		});

		sellSide = sellSide[0];


		if (isBuySideWanted) {
			var buySide = _.filter(val, (oc) => {

				return oc.ask <= buyLegMinimum[globalsymbol];

			});



			if (oType == "C") {
				buySide = _.sortBy(buySide, (b) => { return b.strike });

			} else {

				buySide = _.sortBy(buySide, (b) => { return -b.strike });
			}


			buySide.length == 0 ? showErrorMsg('no buyside with price ' + buyLegMinimum[globalsymbol] + ' found') : '';

			if (buySide.length && sellSide) {

				var price = sellSide.bid - buySide[0].ask;


				var order = tradier.createOrder(accountNumber, {
					'class': 'multileg',
					'symbol': globalsymbol,
					'type': (isBuyMarket) ? 'market' : 'credit',
					'duration': 'day',
					'price': (price * .99).toFixed(2),
					'option_symbol[0]': sellSide.symbol,
					'side[0]': 'sell_to_open',
					'quantity[0]': defaultQty,
					'option_symbol[1]': buySide[0].symbol,
					'side[1]': 'buy_to_open',
					'quantity[1]': defaultQty,
					'tag': todate(),
					'strike' : sellSide.strike
				})




				order.then((resp, data, xyx, hsh) => {

					order;

					showResponse(resp);


				}).catch((err) => {
					showResponse(err);
				})
			} else {

				showErrorMsg('no price  found for ' + oType);
			}

		} else {


			var order = tradier.createOrder(accountNumber, {
				'class': 'option',
				'symbol': globalsymbol,
				'option_symbol': sellSide.symbol,
				'side': 'sell_to_open',
				'quantity': defaultQty,
				'type': (isBuyMarket) ? 'market' : 'limit',
				'duration': 'day',
				'price': (sellSide.bid * .99).toFixed(2),
				'tag': todate(),
				'strike' : sellSide.strike
				
			});

			order.then((resp, data, xyx, hsh) => {

				order;

				showResponse(resp);


			}).catch((err) => {
				showResponse(err);
			})

		}

	});


}



$(function () {

	getPositions();

	//null.s;

	$('#sell-straddle').click(sellStraddle);
	$('#sell-straddle-together').click(sellStraddleTogether);
	$('#sell-starangle').click(() => { sellStrangle('C'); sellStrangle('P'); });
	$('#strangle-call').click(() => { sellStrangle('C') });
	$('#strangle-put').click(() => { sellStrangle('P') });
	$('#straddle-call').click(sellCallStraddle);
	$('#straddle-put').click(sellPutStraddle);
	$('#URL').val(prodtradier.endpoint);

	$('#get-oc').click(function (e) {
		e.preventDefault();
		isBuySideWanted = $('#buyHedges').is(':checked');

		globalsymbol = $('#symbol').val().toUpperCase();
		$('#symbol').val(globalsymbol);

		getLatestQuote();

		if (latest != null) {
			window.clearInterval(latest);
			latest = null;
			latest = window.setInterval(getLatestQuote, quoteRefresh);
		}
		else {
			latest = window.setInterval(getLatestQuote, quoteRefresh);
		}


	})
	$('#get-oc').click();


});