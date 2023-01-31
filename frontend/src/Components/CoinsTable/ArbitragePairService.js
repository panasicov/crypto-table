import APIService from '../../APIService';

const apiService = new APIService();

class ArbitragePairsService{

  getArbitragePairs() {
    return apiService.sendGet('/api/arbitrage_pairs/');
  }

  getArbitragePairsByURL(url_path) {
    return apiService.sendGet(url_path);
  }
}

export default ArbitragePairsService;