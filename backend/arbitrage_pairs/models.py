from django.db import models


class Coin(models.Model):
    key = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    symbol = models.CharField(max_length=16)
    price_change_24h = models.FloatField(null=True, blank=True)
    market_cap = models.FloatField(null=True, blank=True)
    volume_24h = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.symbol


class Exchange(models.Model):
    key = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    group = models.CharField(max_length=8)

    def __str__(self):
        return self.key


class TradingPair(models.Model):
    base_coin = models.ForeignKey(Coin, on_delete=models.CASCADE)
    target_coin_symbol = models.CharField(max_length=16)
    price = models.FloatField()
    bid = models.FloatField()
    ask = models.FloatField()
    volume = models.FloatField()
    trade_url = models.URLField()
    exchange = models.ForeignKey(Exchange, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.exchange}: {self.base_coin.symbol}/{self.target_coin_symbol}:{self.price}'


class ArbitragePair(models.Model):
    base_trading_pair = models.ForeignKey(TradingPair, on_delete=models.CASCADE, related_name='base_arbitrage_pairs')
    target_trading_pair = models.ForeignKey(TradingPair, on_delete=models.CASCADE, related_name='target_arbitrage_pairs')
    spread = models.FloatField()

    def __str__(self):
        return f'{self.base_trading_pair}/{self.target_trading_pair}'
