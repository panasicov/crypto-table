import logging
import threading
from queue import Queue
import time
from urllib.parse import urlsplit, urlunsplit


from django.core.management.base import BaseCommand
from tqdm import tqdm

from cryptorank.cryptorank import PyCryptorank
from arbitrage_pairs.models import Coin, Exchange, TradingPair, ArbitragePair


logger = logging.getLogger('CoinsParser')
q = Queue(maxsize=5)

class Command(BaseCommand):

    help = 'Coins Parser'
    Cryptorank = PyCryptorank()

    def non_zero_round(self, num, places):
        last_usd = num
        last_usd = format(last_usd, '.20f').split('.')
        last_usd1 = last_usd[0]
        last_usd2 = last_usd[1]
        last_usd2 = last_usd2.rstrip('0')
        for j in range(len(last_usd2)):
            if last_usd2[j] != '0':
                last_usd2 = last_usd2[:j+places]
                break
        
        return last_usd1 + '.' + last_usd2

    def worker(self):
        while True:
            func, args = q.get()
            func(args)
            q.task_done()

    def handle_coin(self, base_coin):
        coin_tickers = self.Cryptorank.get_coin_tickers(coin_id=base_coin.key)
        TradingPair.objects.filter(base_coin=base_coin).delete()
        coin_tickers['data'] = [
            tk for tk in coin_tickers['data']
            if tk.get('baseVolume', None)
            and not tk.get('mirrored', None)
            and not tk.get('priceDisabled', None)
            and base_coin.symbol in (tk['from'], tk['to'])
        ]

        for base_ticker in coin_tickers['data']:
            if base_ticker['from'] != base_coin.symbol:
                target_coin_symbol = base_ticker['from']
            else:
                target_coin_symbol = base_ticker['to']

            if not (base_ticker['usdLast'] and base_ticker['last']):
                continue

            base_ticker['my_bid'] = base_ticker['usdLast'] / base_ticker['last'] * base_ticker['bid']
            base_ticker['my_ask'] = base_ticker['usdLast'] / base_ticker['last'] * base_ticker['ask']

            scheme, netloc, path, query, fragment = urlsplit(base_ticker['url'])
            base_ticker['url'] = urlunsplit((scheme, netloc, path, '', ''))

            base_trading_pair, _ = TradingPair.objects.get_or_create(
                base_coin=base_coin,
                target_coin_symbol=target_coin_symbol,
                price=self.non_zero_round(base_ticker['usdLast'], 3),
                bid=self.non_zero_round(base_ticker['my_bid'], 3),
                ask=self.non_zero_round(base_ticker['my_ask'], 3),
                volume=self.non_zero_round(base_ticker['usdVolume'], 3),
                trade_url=base_ticker['url'],
                exchange=Exchange.objects.get_or_create(
                    key=base_ticker['exchangeKey'],
                    defaults={
                        'name': base_ticker['exchangeName']
                    }
                )[0]
            )
            for target_ticker in coin_tickers['data']:
                if base_ticker != target_ticker:
                    if target_ticker['from'] != base_coin.symbol:
                        target_coin_symbol = target_ticker['from']
                    else:
                        target_coin_symbol = target_ticker['to']

                    if not (target_ticker['usdLast'] and target_ticker['last']):
                        continue

                    target_ticker['my_bid'] = target_ticker['usdLast'] / target_ticker['last'] * target_ticker['bid']
                    target_ticker['my_ask'] = target_ticker['usdLast'] / target_ticker['last'] * target_ticker['ask']

                    scheme, netloc, path, query, fragment = urlsplit(base_ticker['url'])
                    base_ticker['url'] = urlunsplit((scheme, netloc, path, '', ''))

                    target_trading_pair, _ = TradingPair.objects.get_or_create(
                        base_coin=base_coin,
                        target_coin_symbol=target_coin_symbol,
                        price=self.non_zero_round(target_ticker['usdLast'], 3),
                        bid=self.non_zero_round(target_ticker['my_bid'], 3),
                        ask=self.non_zero_round(target_ticker['my_ask'], 3),
                        volume=self.non_zero_round(target_ticker['usdVolume'], 3),
                        trade_url=target_ticker['url'],
                        exchange=Exchange.objects.get_or_create(
                            key=target_ticker['exchangeKey'],
                            defaults={
                                'name': target_ticker['exchangeName']
                            }
                        )[0]
                    )
                    if base_ticker['my_ask'] and target_ticker['my_bid']:
                        spread = target_ticker['my_bid'] / base_ticker['my_ask'] * 100 - 100
                    else:
                        spread = target_ticker['usdLast'] / base_ticker['usdLast'] * 100 - 100

                    ArbitragePair.objects.create(
                        base_trading_pair=base_trading_pair,
                        target_trading_pair=target_trading_pair,
                        spread=round(spread, 2)
                    )

    def handle(self, *args, **options):
        clear = 1
        if clear:
            TradingPair.objects.all().delete()
            ArbitragePair.objects.all().delete()

        for i in range(10):
            t = threading.Thread(target=self.worker)
            t.daemon = True
            t.start()

        while True:
            coins = Coin.objects.all()[500::]

            for base_coin in tqdm(coins):
                q.put((self.handle_coin, base_coin))

            q.join()
