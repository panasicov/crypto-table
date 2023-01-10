from rest_framework import serializers
from arbitrage_pairs.models import Coin, Exchange, ArbitragePair, TradingPair


class CoinSerializer(serializers.ModelSerializer):

    class Meta:
        model = Coin
        fields = '__all__'


class ExchangeSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Exchange
        fields = '__all__'


class TradingPairSerializer(serializers.ModelSerializer):

    base_coin = CoinSerializer()
    exchange = ExchangeSerializer()

    class Meta:
        model = TradingPair
        fields = '__all__'


class ArbitragePairSerializer(serializers.ModelSerializer):

    base_trading_pair = TradingPairSerializer()
    target_trading_pair = TradingPairSerializer()

    class Meta:
        model = ArbitragePair
        fields = '__all__'
