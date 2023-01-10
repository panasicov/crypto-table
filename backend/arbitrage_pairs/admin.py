from django.contrib import admin
from .models import Coin, Exchange, TradingPair, ArbitragePair


@admin.register(Coin)
class CoinAdmin(admin.ModelAdmin):
    list_display = (
        'key', 'name', 'symbol',
        'price_change_24h', 'market_cap', 'volume_24h'
    )


@admin.register(Exchange)
class ExchangeAdmin(admin.ModelAdmin):
    list_display = ('id', 'key', 'name', 'group')


@admin.register(TradingPair)
class TradingPairAdmin(admin.ModelAdmin):
    list_display = (
        'base_coin', 'target_coin_symbol', 'price', 'bid', 'ask',
        'volume', 'trade_url', 'exchange',
    )


@admin.register(ArbitragePair)
class ArbitragePairAdmin(admin.ModelAdmin):
    list_display = (
        'base_trading_pair', 'target_trading_pair', 'spread'
    )
