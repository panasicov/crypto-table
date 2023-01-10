import axios from 'axios';
const API_URL = 'http://localhost:8000';

export default class ArbitragePairsService{

	getArbitragePairs() {
		const url = `${API_URL}/api/arbitrage_pairs/`;
		return axios.get(url).then(response => response.data);
	}

    getArbitragePairsByURL(link) {
		const url = `${API_URL}${link}`;
		return axios.get(url).then(response => response.data);
	}
}