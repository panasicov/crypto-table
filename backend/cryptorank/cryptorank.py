import json
import requests

from requests.adapters import HTTPAdapter, Retry


class PyCryptorank:

    def __init__(self):
        self.api_base_url = 'https://api.cryptorank.io/v0'
        self.request_timeout = 20

        self.session = requests.Session()
        retries = Retry(total=5, backoff_factor=15, status_forcelist=[429])
        self.session.mount('https://', HTTPAdapter(max_retries=retries))

    def request(self, url: str) -> dict:
        try:
            response = self.session.get(url, timeout=self.request_timeout)
        except requests.exceptions.RequestException:
            raise

        try:
            response.raise_for_status()
            content = json.loads(response.content.decode('utf-8'))
            return content

        except Exception as e:
            try:
                content = json.loads(response.content.decode('utf-8'))
                raise ValueError(content)

            except json.decoder.JSONDecodeError:
                pass

            raise
    
    def ordonate_params(self, params: dict) -> str:
        ordonated_params = ''
        if params:
            ordonated_params += '?'
            for key, value in params.items():
                if type(value) == bool:
                    value = str(value).lower()

                ordonated_params += "{0}={1}&".format(key, value)
            ordonated_params = ordonated_params[:-1]
        return ordonated_params

    def get_top_gainers_coins(self, limit: int = 150) -> dict:
        params = {
            'specialFilter': 'topGainersFor24h',
            'limit': limit
        }
        url = self.api_base_url + '/coins' + self.ordonate_params(params)
        return self.request(url)

    def get_all_coins(self) -> dict:
        url = self.api_base_url + '/coins'
        return self.request(url)

    def get_coin_tickers(self, coin_id: str, params: dict = {}) -> dict:
        url = self.api_base_url + f'/coins/{coin_id}/tickers' + self.ordonate_params(params)
        return self.request(url)

    def get_exchanges(self):
        url = self.api_base_url + '/exchanges'
        return self.request(url)
