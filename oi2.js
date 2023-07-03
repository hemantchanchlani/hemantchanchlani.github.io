
var globalsymbol = 'SPX';
var defaultQty = 1;


var buyLegMinimum = {

	'SPX': .1,
	'SPY': .01,
	'TSLA': 1

};

var reloadOrderInterval = 2000;

var accountNumber = 'VA94962097';
var prodaccountNumber = '6YA26930';
var apiKey = 'yG1tBcGioyqA0J6CA1oW3IJ4svAw';
var prodApiKey = 'VO2aoiLZFZV9QtkkE8JBKbUH5x8F';

var access = localStorage.getItem('access');

var myPositions, myOrders;

function urlstringify(data) {

	var url = Object.keys(data).map(function(k) {
		return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
	}).join('&');

	return url;
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

	tooltipItems.forEach(function(tooltipItem) {
		sum += tooltipItem.parsed.y;
	});
	return 'Sum: ' + sum;
};

const URLS = {
	prod: 'https://api.tradier.com/v1/',
	beta: 'https://api.tradier.com/beta/',
	sandbox: 'https://sandbox.tradier.com/v1/',
	stream: 'https://stream.tradier.com/v1',
};

class Tradier {

	constructor(accessToken, endpoint = 'prod') {
		this.accessToken = accessToken;
		this.endpoint = endpoint;
	}

	config() {
		return {
			baseURL: URLS[this.endpoint],
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				Accept: 'application/json',
			},
		};
	}
	// region Market Data
	getQuote(symbols) {
		return this.get('markets/quotes', {
			symbols: symbols,
		}).then(
			({
				data: {
					quotes: { quote },
				},
			}) => quote
		);
	}
	get(url, params, config = {}) {
		return axios.request({
			method: 'get',
			url: parseQuery(url, params),
			...this.config(),
			...config,
		});
	}



	post(url, data, config = {}) {
		return axios.request({
			method: 'post',
			url,
			data: parseData(data),
			...this.config(),
			...config,
		});
	}

	put(url, data, config = {}) {
		return axios.request({
			method: 'put',
			url,
			data: parseData(data),
			...this.config(),
			...config,
		});
	}

	delete(url, config = {}) {
		return axios.request({
			method: 'delete',
			url,
			...this.config(),
			...config,
		});
	}
	// endregion

	// region User Data
	getProfile() {
		return this.get('user/profile').then(({ data: { profile } }) => profile);
	}

	getBalances() {
		return this.get('user/balances').then(({ data: { accounts } }) => accounts);
	}

	getPositions() {
		return this.get('user/positions').then(
			({ data: { accounts } }) => accounts
		);
	}

	getHistory() {
		return this.get('user/history').then(({ data: { accounts } }) => accounts);
	}

	getGainloss() {
		return this.get('user/gainloss').then(({ data: { accounts } }) => accounts);
	}

	getOrders() {
		return this.get('user/orders').then(({ data: { accounts } }) => accounts);
	}
	// endregion

	// region Account Data
	getAccountBalances(account) {
		return this.get(`accounts/${account}/balances`).then(
			({ data: { balances } }) => balances
		);
	}

	getAccountPositions(account) {
		return this.get(`accounts/${account}/positions`).then(
			({ data: { positions } }) => positions
		);
	}

	getAccountHistory(account) {
		return this.get(`accounts/${account}/history`).then(
			({ data: { history } }) => history
		);
	}

	getAccountGainloss(account) {
		return this.get(`accounts/${account}/gainloss`).then(
			({ data: { gainloss } }) => gainloss
		);
	}

	getAccountOrders(account) {
		return this.get(`accounts/${account}/orders`).then(
			({ data: { orders } }) => orders
		);
	}

	getAccountOrder(account, orderId) {
		return this.get(`accounts/${account}/orders/${orderId}`).then(
			({ data: { order } }) => order
		);
	}
	// endregion

	// region Trading
	createOrder(account, data) {
		return this.post(`accounts/${account}/orders`, data).then(
			({ data: { order } }) => order
		);
	}

	previewOrder(account, data) {
		return this.post(`accounts/${account}/orders`, {
			...parseData(data),
			preview: true,
		}).then(({ data: { order } }) => order);
	}

	changeOrder(account, orderId, data) {
		return this.put(`accounts/${account}/orders/${orderId}`, data).then(
			({ data: { order } }) => order
		);
	}

	cancelOrder(account, orderId) {
		return this.delete(`accounts/${account}/orders/${orderId}`).then(
			({ data: { order } }) => order
		);
	}
	// endregion

	// region Market Data
	getQuote(symbols) {
		return this.get('markets/quotes', {
			symbols: symbols
		}).then(
			({
				data: {
					quotes: { quote },
				},
			}) => quote
		);
	}

	getTimesales(symbol, interval, start, end, sessionFilter) {
		return this.get('markets/timesales', {
			symbol,
			interval,
			start,
			end,
			session_filter: sessionFilter,
		}).then(({ data: { series } }) => series);
	}

	getOptionChains(symbol, expiration) {
		return this.get('markets/options/chains', { symbol, expiration }).then(
			({ data: { options } }) => options
		);
	}

	getOptionStrikes(symbol, expiration) {
		return this.get('markets/options/strikes', { symbol, expiration }).then(
			({ data: { strikes } }) => strikes
		);
	}

	getOptionExpirations(symbol, includeAllRoots) {
		return this.get('markets/options/expirations', {
			symbol,
			includeAllRoots,
		}).then(({ data: { expirations } }) => expirations);
	}

	getPriceHistory(symbol, interval, start, end) {
		return this.get('markets/history', {
			symbol,
			interval,
			start,
			end,
		}).then(({ data: { history } }) => history);
	}

	getClock() {
		return this.get('markets/clock').then(({ data: { clock } }) => clock);
	}

	getCalendar(market, year) {
		return this.get('markets/calendar', { market, year }).then(
			({ data: { calendar } }) => calendar
		);
	}

	search(q, indexes = true) {
		return this.get('markets/search', { q, indexes }).then(
			({ data: { securities } }) => securities
		);
	}

	lookup(q, exchanges, types) {
		return this.get('markets/lookup', { q, exchanges, types }).then(
			({ data: { securities } }) => securities
		);
	}

	// region Fundamentals (BETA)
	getCompany(symbols) {
		return this.get(
			'markets/fundamentals/company',
			{ symbols: parseSymbols(symbols) },
			{ baseURL: URLS.beta }
		).then(({ data: { items } }) => items);
	}

	getCalendars(symbols) {
		return this.get(
			'markets/fundamentals/calendars',
			{ symbols: parseSymbols(symbols) },
			{ baseURL: URLS.beta }
		).then(({ data: { items } }) => items);
	}

	getDividends(symbols) {
		return this.get(
			'markets/fundamentals/dividends',
			{ symbols: parseSymbols(symbols) },
			{ baseURL: URLS.beta }
		).then(({ data: { items } }) => items);
	}

	getCorporateActions(symbols) {
		return this.get(
			'markets/fundamentals/corporate_actions',
			{ symbols: parseSymbols(symbols) },
			{ baseURL: URLS.beta }
		).then(({ data: { items } }) => items);
	}

	getRatios(symbols) {
		return this.get(
			'markets/fundamentals/ratios',
			{ symbols: parseSymbols(symbols) },
			{ baseURL: URLS.beta }
		).then(({ data: { items } }) => items);
	}

	getFinancials(symbols) {
		return this.get(
			'markets/fundamentals/financials',
			{ symbols: parseSymbols(symbols) },
			{ baseURL: URLS.beta }
		).then(({ data: { items } }) => items);
	}

	getStatistics(symbols) {
		return this.get(
			'markets/fundamentals/statistics',
			{ symbols: parseSymbols(symbols) },
			{ baseURL: URLS.beta }
		).then(({ data: { items } }) => items);
	}
	// endregion

	// region Watchlists
	getWatchlists() {
		return this.get('/watchlists').then(
			({ data: { watchlists } }) => watchlists
		);
	}

	getWatchlist(id) {
		return this.get(`/watchlists/${id}`).then(
			({ data: { watchlist } }) => watchlist
		);
	}

	createWatchlist(name, symbols) {
		return this.post('/watchlists', {
			name,
			symbols: parseSymbols(symbols),
		}).then(({ data: { watchlist } }) => watchlist);
	}

	updateWatchlist(id, name, symbols) {
		return this.put(`/watchlists/${id}`, {
			name,
			symbols: parseSymbols(symbols),
		}).then(({ data: { watchlist } }) => watchlist);
	}

	deleteWatchlist(id) {
		return this.delete(`/watchlists/${id}`).then(
			({ data: { watchlists } }) => watchlists
		);
	}

	addSymbols(id, symbols) {
		return this.post(`/watchlists/${id}/symbols`, {
			symbols: parseSymbols(symbols),
		}).then(({ data: { watchlist } }) => watchlist);
	}

	removeSymbols(id, symbol) {
		return this.delete(`/watchlists/${id}/symbols/${symbol}`).then(
			({ data: { watchlist } }) => watchlist
		);
	}
	// endregion

	// region Streaming
	createSession() {
		return this.post('markets/events/session');
	}

	getEvents(sessionid, symbols, filter, linebreak) {
		return this.post(
			'markets/events',
			{
				sessionid,
				symbols: parseSymbols(symbols),
				filter,
				linebreak,
			},
			{ baseURL: URLS.stream }
		).then(({ data: { data } }) => data);
	}
	// endregion
}


var tradier = new Tradier(apiKey, 'sandbox');
var prodtradier = tradier;



function getPositions() {

	var positions = tradier.getPositions(accountNumber);


	positions.then((val) => {
		createPositionTable(val);


	});

}

getPositions();



function reLoadOrders() {
	var orders = tradier.getOrders(accountNumber);


	orders.then((val) => {
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


	let expiration = new Date();
	// Extract the year, month, and day from the expiration date
	const year = expiration.getFullYear().toString().substr(-2);
	const month = (expiration.getMonth() + 1).toString().padStart(2, '0');
	const day = expiration.getDate().toString().padStart(2, '0');
	// Convert the strike price to a string and remove decimal point and leading zeros
	let strikeStr = strike.toFixed(3).replace('.', '');

	strikeStr = "00000000".substring(strikeStr.length) + strikeStr;

	var ggOp = (globalsymbol == 'SPX') ? 'SPXW' : globalsymbol;

	// Combine the symbol, year, month, day, and strike to form the option symbol
	const optionSymbol = `${ggOp}${year}${month}${day}${oType}${strikeStr}`;

	return optionSymbol;
}







function createTable(data, id) {


	const theTable = $('#' + id);
	const UNIQUE_ID = 'id';

	const columns = [
		{ field: "id", title: "ID" },
		{ field: "option_symbol", title: "SYMBOL" },
		{ field: "strike", title: "strike" },
		{ field: "side", title: "side" },
		{ field: "type", title: "Call or Put" },
		{ field: "status", title: "status" },
		{ field: "transaction_date", title: "transaction_date" },

		{ field: "quantity", title: "quantity" },
		{ field: "price", title: "price" },
		{ field: "reason_description", title: "reason_description" },

		{
			field: "tableAction", title: "Add StopLoss",
			formatter: (value, row, index, field) => {
				curID = row[UNIQUE_ID];
				return [
					`<button type="button" class="btn btn-default btn-sm" onclick="cancelOrder(${curID})">`,
					`<i class="far fa-trash-alt"></i>`,
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
			height: 768,
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



	var legs = _.pluck(orders, "leg");



	var ndata = _.union(orders, _.flatten(_.compact(legs)));

	_.each(ndata, function(leg) {

		leg.price = (!leg.price) ? leg.avg_fill_price : leg.price;


	});

	myOrders = ndata;

	rdata = _.filter(ndata, function(order) {

		var orderCheck = (order.status == status && !order.leg) ? true : false;

		var cDate = new Date(order.create_date);

		return (cDate.getFullYear() == today.getFullYear() && cDate.getMonth() == today.getMonth() && today.getDate() == cDate.getDate() && orderCheck);



	});

	_.each(rdata, function(leg) {

		leg.quantity = (leg.side.indexOf('sell') > -1) ? leg.quantity * -1 : leg.quantity;

		leg.type = (leg.option_symbol.slice(6).indexOf("C") > -1) ? "CALL" : "PUT";

		leg.strike = parseInt(leg.option_symbol.slice(-8)) / 1000;


	});

	_.sortBy(rdata, function(o) { return o.transaction_date; });

	return rdata;



}


function createPositionTable(resp) {

	var data = myPositions = resp.account.positions.position;

	/*if (_.isObject(data)) {

		data = [data];
	}*/


	_.each(data, (position) => {

		position.cost_basis = (((position.cost_basis / position.quantity)) / 100).toFixed(2);
		position.type = (position.symbol.slice(6).indexOf("C") > -1) ? "CALL" : "PUT";
		position.strike = parseInt(position.symbol.slice(-8)) / 100;
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
				return [

					`<button type="button" class="btn btn-default btn-sm" onclick="addStopLimitOrder(${curID},.20,'p')">`,
					`| 20 <i class="fa-solid fa-percent"></i> |`,
					`</button>`,

					`<button type="button" class="btn btn-default btn-sm" onclick="addStopLimitOrder(${curID},.25,'p')">`,
					`| 25 <i class="fa-solid fa-percent"></i> |`,
					`</button>`,

					`<button type="button" class="btn btn-default btn-sm" onclick="addStopLimitOrder(${curID},.30,'p')">`,
					`| 30 <i class="fa-solid fa-percent"></i> |`,
					`</button>`,

					`<button type="button" class="btn btn-default btn-sm" onclick="addStopLimitOrder(${curID},1,'d')">`,
					`| 100 <i class="fa-solid fa-dollar-sign"></i> |`,
					`</button>`,

					`<button type="button" class="btn btn-default btn-sm" onclick="addStopLimitOrder(${curID},2,'d')">`,
					`| 200 <i class="fa-solid fa-dollar-sign"></i> |`,
					`</button>`,


					`<button type="button" class="btn btn-default btn-sm" onclick="closeAtMarketOrder(${curID})">`,
					`| <i class="fa-solid fa-person-running"></i> | `,
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
			height: 768,
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
				window.clearTimeout(timer);
				timer = null;
				timer = window.setInterval(reLoadOrders, reloadOrderInterval);
			}
			else {
				timer = window.setInterval(reLoadOrders, reloadOrderInterval);
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

	var orders = _.where(myOrders, { 'option_symbol': position.symbol, 'status': 'filled' });

	if (/*orders.length*/false) {

		_.each(orders, (order) => {


			var order = tradier.createOrder(accountNumber, {
				'class': 'option',
				'symbol': globalsymbol,
				'option_symbol': order.option_symbol,
				'side': (order.side == 'sell_to_open') ? 'buy_to_close' : 'sell_to_close',
				'quantity': Math.abs(order.quantity),
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

function addStopLimitOrder(pId, amt, type) {

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
			'type': 'stop_limit',
			'duration': 'day',
			'price': limit.toFixed(2),
			'stop': stop.toFixed(2),
			'tag': todate()
		});

		getPositions();


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

function trade(symbol, dateOfExpiry, strike, type) {/*

	var contenderForBuy = [];
	console.log(symbol, dateOfExpiry, strike, type);


	$.ajax({
		type: 'get',
		url: 'https://sandbox.tradier.com/v1/markets/options/chains',
		data: {
			'symbol': symbol,
			'expiration': dateOfExpiry,
			'greeks': 'true'
		},
		headers: {
			'Authorization': 'Bearer ' + access,
			'Accept': 'application/json'
		},
		success: function(data, response, code) {
			calls = [];
			puts = [];
			supportNumbers = [];
			resistancetNumbers = [];
			changeinCall_OI = [];
			changeinPut_OI = [];


			var options = data.options.option;


			options.forEach(function(option, i) {
				if (option.symbol.slice(6).indexOf(type) > -1) {
					if (option.strike == strike) {
						option.strikeLabel = option.strike + '';
						sellToOpen.push(option);
					}


					if (type == "P" && option.strike < strike) {
						if (Math.abs(option.strike - strike) <= 70 && option.ask == .1) {
							contenderForBuy.push(option);
						}
					}


					if (type == "C" && option.strike > strike) {
						if (Math.abs(option.strike - strike) <= 70 && option.ask == .1) {
							contenderForBuy.push(option);
						}
					}
				}



			});


			if (type == "C") {
				buyToOpen.push(_.min(contenderForBuy, function(o) {
					return o.strike;
				})
				);


			} else {
				buyToOpen.push(_.max(contenderForBuy, function(o) {
					return o.strike;
				})
				);
			}





		}
	}

	);*/
}


function showResponse(resp) {

	if (resp.status == 'ok') {
		$.toastr.success(JSON.stringify(resp));
		reLoadOrders();
	} else {

		try {
			$.toastr.error("--" + resp.response.data);
		} catch (e) {

			$.toastr.error("--" + e + '---ERROR - please check network tab asap');

		}

	}

};


function showErrorMsg(resp) {



	$.toastr.error("!!!" + resp);


};

var isBuySideWanted = $('#buyHedges').is(':checked');

function placeSpreadOrder(symbol, strike) {
	isBuySideWanted = $('#buyHedges').is(':checked');

	var query = symbol;
	if (isBuySideWanted) {
		var strikeWanted = tryStrike = parseInt(strike);



		if (symbol.slice(6).indexOf("C") > -1) {
			var oType = "C";
		} else {
			var oType = "P";
		}

		var oPrefix = symbol.slice(0, 11);


		for (var i = 0; i < 20; i++) {

			if (oType == "C") {
				tryStrike = tryStrike + 1;
			} else {

				tryStrike = tryStrike - 1;
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

			var buySide = _.where(val, { 'ask': buyLegMinimum[globalsymbol] });

			buySide.length == 0 ? showErrorMsg('no buyside with price ' + buyLegMinimum[globalsymbol] + ' found') : '';

			var price = sellSide.bid - buySide[0].ask;


			var order = tradier.createOrder(accountNumber, {
				'class': 'multileg',
				'symbol': globalsymbol,
				'type': 'credit',
				'duration': 'day',
				'price': price.toFixed(2),
				'option_symbol[0]': sellSide.symbol,
				'side[0]': 'sell_to_open',
				'quantity[0]': defaultQty,
				'option_symbol[1]': buySide[0].symbol,
				'side[1]': 'buy_to_open',
				'quantity[1]': defaultQty,
				'tag': todate()
			})
		}

		else {

			var order = tradier.createOrder(accountNumber, {
				'class': 'option',
				'symbol': globalsymbol,
				'option_symbol': sellSide.symbol,
				'side': 'sell_to_open',
				'quantity': defaultQty,
				'type': 'limit',
				'duration': 'day',
				'price': sellSide.bid,
				'tag': todate()
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
	_.each(options, function(option) {


		$('.' + cName).append('<button onclick=placeSpreadOrder("' + option.symbol + '","' + option.strike + '") value=' + option.symbol + '>' + option.strike + " (BID: " + option.bid + ") " +
			'</button>');


	});

}

var last = 4400;
function showPutandCallOptions(oc) {



	var putOptions = [];
	var callOptions = [];

	var percent = (isBuySideWanted) ? .01 : .03;

	_.each(oc.option, function(option) {

		if (Math.abs(option.strike - last) <= percent * last) {

			if (option.symbol.slice(6).indexOf("P") > -1) {
				putOptions.push(option);
			} else {
				callOptions.push(option);
			}
		}


	});
	makeButtons('call-button-holder', callOptions);
	makeButtons('put-button-holder', putOptions);


}

function todate() {
	var today = new Date();

	var dd = today.getDate();
	var mm = today.getMonth() + 1;
	var yyyy = today.getFullYear();
	if (dd < 10) {
		dd = '0' + dd;
	}

	if (mm < 10) {
		mm = '0' + mm;
	}
	today = yyyy + '-' + mm + '-' + dd;
	return today;

}


var latest = null;
var quoteRefresh = 2000000;


function getLatestQuote() {


	var t = prodtradier.getQuote(globalsymbol);

	t.then(q => {

		if (q && q.last) {
			last = q.last;
			//last = 4440;
		}

		var dateOfExpiry = todate();
		var oc = prodtradier.getOptionChains(globalsymbol, dateOfExpiry);


		oc.then((val) => {
			showPutandCallOptions(val);
		});

	});


}

$(function() {

	$('#form').submit(function(e) {
		isBuySideWanted = $('#buyHedges').is(':checked');
		e.preventDefault();
		globalsymbol = $('#symbol').val();



		if (latest != null) {
			window.clearTimeout(latest);
			latest = null;
			latest = window.setInterval(getLatestQuote, quoteRefresh);
		}
		else {
			latest = window.setInterval(getLatestQuote, quoteRefresh);
		}






	})
	$('#form').submit();


});