import logging

from django.core.management.base import BaseCommand
from tqdm import tqdm

from cryptorank.cryptorank import PyCryptorank
from arbitrage_pairs.models import Coin


logger = logging.getLogger('CoinsParser')

class Command(BaseCommand):

    help = 'Coins Parser'

    def handle(self, *args, **options):
        Cryptorank = PyCryptorank()
        coins = Cryptorank.get_all_coins()

        for coin in tqdm(coins['data']):
            try:
                coin_price = coin['price']['USD']
            except:
                coin_price = None
            try:
                coin_price_24h = coin['histPrices']['24H']['USD']
            except:
                coin_price_24h = None

            price_change_24h = None
            if coin_price and coin_price_24h:
                price_change_24h = coin_price / coin_price_24h * 100 - 100
            market_cap = coin.get('marketCap', None)
            volume24h = coin.get('volume24h', None)

            coin, _ = Coin.objects.update_or_create(
                key=coin['key'],
                defaults={
                    'name': coin['name'],
                    'symbol': coin['symbol'],
                    'price_change_24h': price_change_24h,
                    'market_cap': market_cap,
                    'volume_24h': volume24h
                }
            )
