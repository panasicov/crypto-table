import logging
import threading
from queue import Queue
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
        """
            The function allows you to round decimal numbers
            without including zeros after comma
            Example:
            `>>> non_zero_round(12.000096342294, 3)`
            `12.0000963`
        """
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
        # Filtering coin tickers with wrong price
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

            # bid/ask can be specified in btc, eth, etc., so need to convert them to usd
            base_ticker['usdBid'] = base_ticker['usdLast'] / base_ticker['last'] * base_ticker['bid']
            base_ticker['usdAsk'] = base_ticker['usdLast'] / base_ticker['last'] * base_ticker['ask']

            # Removing referal url params (like ?ref=123456)
            scheme, netloc, path, query, fragment = urlsplit(base_ticker['url'])
            base_ticker['url'] = urlunsplit((scheme, netloc, path, '', ''))

            base_trading_pair, _ = TradingPair.objects.get_or_create(
                base_coin=base_coin,
                target_coin_symbol=target_coin_symbol,
                price=self.non_zero_round(base_ticker['usdLast'], 3),
                bid=self.non_zero_round(base_ticker['usdBid'], 3),
                ask=self.non_zero_round(base_ticker['usdAsk'], 3),
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

                    target_ticker['usdBid'] = target_ticker['usdLast'] / target_ticker['last'] * target_ticker['bid']
                    target_ticker['usdAsk'] = target_ticker['usdLast'] / target_ticker['last'] * target_ticker['ask']

                    scheme, netloc, path, query, fragment = urlsplit(base_ticker['url'])
                    base_ticker['url'] = urlunsplit((scheme, netloc, path, '', ''))

                    target_trading_pair, _ = TradingPair.objects.get_or_create(
                        base_coin=base_coin,
                        target_coin_symbol=target_coin_symbol,
                        price=self.non_zero_round(target_ticker['usdLast'], 3),
                        bid=self.non_zero_round(target_ticker['usdBid'], 3),
                        ask=self.non_zero_round(target_ticker['usdAsk'], 3),
                        volume=self.non_zero_round(target_ticker['usdVolume'], 3),
                        trade_url=target_ticker['url'],
                        exchange=Exchange.objects.get_or_create(
                            key=target_ticker['exchangeKey'],
                            defaults={
                                'name': target_ticker['exchangeName']
                            }
                        )[0]
                    )
                    if base_ticker['usdAsk'] and target_ticker['usdBid']:
                        spread = target_ticker['usdBid'] / base_ticker['usdAsk'] * 100 - 100
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

        # First 500 coins have a minimal chance of arbitrage, and due to
        # the large number of exchanges, they are processed by the
        # database for a long time, so exclude them
        coins = Coin.objects.all()[500::]

        for base_coin in tqdm(coins):
            q.put((self.handle_coin, base_coin))

        q.join()
