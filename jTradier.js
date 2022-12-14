const URLS = {
	prod: 'https://api.tradier.com/v1/',
};



function parseSymbols(symbols) {
	return ensureArray(symbols).join(',');
}

function parseQuery(url, params) {
	const query =
		params &&
		$.param(params);
	return query ? `${url}?${query}` : url;
}

function parseData(data) {
	return typeof data === 'object'
		? querystring.stringify(data)
		: querystring.parse(data);
}



var number = 1;


class Tradier {

	constructor() {
		this.endpoint = 'prod';
	}

	// region HTTP

	get(url, params, config = {}) {
		let token = localStorage.getItem('access');
		token = 'Bearer ' + token;
		return $.ajax({
			method: 'get',
			url: URLS['prod'] + parseQuery(url, params),
			headers: {
				Authorization: token,
				Accept: 'application/json',
			}
		});
	}


	// endregion
	// endregion

	// endregion

	// region Market Data
	getQuote(symbols) {
		return this.get('markets/quotes', {
			symbols: symbols,
			greeks : true
		}).then(function(response) {
			return (response.quotes);
		});
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

	getOptionChains(symbol, expiration, requests) {
		let greeks = true;
		return this.get('markets/options/chains', { symbol, expiration , greeks }).then(function(response) {
			 requests.push(response.options.option);
		});
	}

	getOptionStrikes(symbol, expiration) {
		return this.get('markets/options/strikes', { symbol, expiration }).then(
			({ data: { strikes } }) => strikes
		);
	}

	getOptionExpirations(symbol, includeAllRoots = true, strikes = false) {
		return this.get('markets/options/expirations', {
			symbol,
			includeAllRoots,
			strikes
		}).then(function(response) {
			return (response.expirations.date);
		});
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

