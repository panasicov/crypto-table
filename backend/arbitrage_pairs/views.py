from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from arbitrage_pairs.models import ArbitragePair
from .serializers import ArbitragePairSerializer


@api_view(['GET'])
def arbitrage_pairs_list(request):
    # arbitrage_pairs = ArbitragePair.objects.all()
    arbitrage_pairs = ArbitragePair.objects.select_related(
        'base_trading_pair__base_coin', 'base_trading_pair__exchange',
        'target_trading_pair__base_coin', 'target_trading_pair__exchange',
    ).order_by('id')

    match_sort_to_orm = {
        'cn': 'base_trading_pair__base_coin__name__icontains',
        'bcs1': 'base_trading_pair__base_coin__symbol__icontains',
        'tcs1': 'base_trading_pair__target_coin_symbol__icontains',
        'ex1': 'base_trading_pair__exchange__name__icontains',
        'bcs2': 'target_trading_pair__base_coin__symbol__icontains',
        'tcs2': 'target_trading_pair__target_coin_symbol__icontains',
        'ex2': 'target_trading_pair__exchange__name__icontains',
    }
    for i in match_sort_to_orm:
        param = request.GET.get(i, None)
        if param:
            arbitrage_pairs = arbitrage_pairs.filter(**{match_sort_to_orm[i]: (param)})

    exclude_to_orm = {
        'dex1': {'base_trading_pair__exchange__group': 'dex'},
        'cex1': {'base_trading_pair__exchange__group': 'main'},
        'other1': {'base_trading_pair__exchange__group': 'other'},
        'dex2': {'target_trading_pair__exchange__group': 'dex'},
        'cex2': {'target_trading_pair__exchange__group': 'main'},
        'other2': {'target_trading_pair__exchange__group': 'other'},
    }
    for i in exclude_to_orm:
        param = request.GET.get(i, None)
        if param == 'false':
            arbitrage_pairs = arbitrage_pairs.exclude(**exclude_to_orm[i])

    range_sort_to_orm = {
        'pc24h_from': 'base_trading_pair__base_coin__price_change_24h__gte',
        'pc24h_to': 'base_trading_pair__base_coin__price_change_24h__lte',
        'mc_from': 'base_trading_pair__base_coin__market_cap__gte',
        'mc_to': 'base_trading_pair__base_coin__price_change_24h__lte',
        'vol24h_from': 'base_trading_pair__base_coin__volume_24h__gte',
        'vol24h_to': 'base_trading_pair__base_coin__volume_24h__lte',
        'pp1_from': 'base_trading_pair__price__gte',
        'pp1_to': 'base_trading_pair__price__lte',
        'vol1_from': 'base_trading_pair__volume__gte',
        'vol1_to': 'base_trading_pair__volume__lte',
        'pp2_from': 'target_trading_pair__price__gte',
        'pp2_to': 'target_trading_pair__price__lte',
        'vol2_from': 'target_trading_pair__volume__gte',
        'vol2_to': 'target_trading_pair__volume__lte',
        'spread_from': 'spread__gte',
        'spread_to': 'spread__lte',
    }

    for i in range_sort_to_orm:
        param = request.GET.get(i, None)
        if param:
            arbitrage_pairs = arbitrage_pairs.filter(**{range_sort_to_orm[i]: param})

    sort_string = ''
    sort_dir_to_orm = {
        'asc': '',
        'desc': '-'
    }
    sort_by_to_orm = {
        'cn': 'base_trading_pair__base_coin__name',
        'symbol': 'base_trading_pair__base_coin__symbol',
        'pc24h': 'base_trading_pair__base_coin__price_change_24h',
        'mc': 'base_trading_pair__base_coin__market_cap',
        'vol24h': 'base_trading_pair__base_coin__volume_24h',
        'tp1': 'base_trading_pair__base_coin__symbol',
        'ex1': 'base_trading_pair__exchange__name',
        'vol1': 'base_trading_pair__volume',
        'pp1': 'base_trading_pair__price',
        'ask': 'base_trading_pair__ask',
        'tp2': 'target_trading_pair__base_coin__symbol',
        'ex2': 'target_trading_pair__exchange__name',
        'vol2': 'target_trading_pair__volume',
        'pp2': 'target_trading_pair__price',
        'bid': 'target_trading_pair__bid',
        'spread': 'spread',
    }

    sort_dir_param = request.GET.get('sort_dir', None)
    sort_by_param = request.GET.get('sort_by', None)
    if sort_dir_param in sort_dir_to_orm and sort_by_param in sort_by_to_orm:
        sort_string = sort_dir_to_orm[sort_dir_param] + sort_by_to_orm[sort_by_param]
    if sort_string:
        arbitrage_pairs = arbitrage_pairs.order_by(sort_string)

    data = []
    page = request.GET.get('page', 1)
    paginator = Paginator(arbitrage_pairs.all(), 50)
    try:
        data = paginator.page(page)
    except PageNotAnInteger:
        data = paginator.page(1)
    except EmptyPage:
        data = paginator.page(paginator.num_pages)

    next_page, prev_page = None, None
    if data.has_next():
        next_page = data.next_page_number()
    if data.has_previous():
        prev_page = data.previous_page_number()

    serializer = ArbitragePairSerializer(data, context={'request': request}, many=True)
    dict_response = {
        'data': serializer.data,
        'total_objects': paginator.count,
        'current_page': int(page),
        'total_pages' : paginator.num_pages,
    }

    query = request.GET.copy()
    if next_page:
        query['page'] = next_page
        dict_response.update({
            'next_page_link': f'/api/arbitrage_pairs/?{query.urlencode()}'
        })
    if prev_page:
        query['page'] = prev_page
        dict_response.update({
            'prev_page_link': f'/api/arbitrage_pairs/?{query.urlencode()}'
        })

    return Response(dict_response)
