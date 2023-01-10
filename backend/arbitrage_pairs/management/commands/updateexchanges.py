import logging

from tqdm import tqdm

from django.core.management.base import BaseCommand
from arbitrage_pairs.models import Exchange
from cryptorank.cryptorank import PyCryptorank


logger = logging.getLogger('tg_bot')


class Command(BaseCommand):

    help = 'telegram bot'
    Cryptorank = PyCryptorank()

    def handle(self, *args, **options):
        exchanges = self.Cryptorank.get_exchanges()

        for exchange in tqdm(exchanges):
            Exchange.objects.update_or_create(
                key=exchange['key'],
                defaults={
                    'name': exchange['name'],
                    'group': exchange['group']
                }
            )
