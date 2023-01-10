import  React, { Component } from  'react';
import ArbitragePairsService from './ArbitragePairService';
import HintInput from './HintInput';
import Blacklisted from './Modal';

const  arbitragePairsService = new  ArbitragePairsService();

class  ArbitragePairsList  extends  Component {

    constructor(props) {
        super(props);

        this.state  = {
            coins: [],
            nextPageURL:  '',
            URl: '',
            API_URL: 'http://localhost:8000',

            name: '',
            typing: false,
            typingTimeout: 0,

            sortDirState: {
                'cn': '↕', 'symbol': '↕', 'pc24h': '↕', 'mc': '↕', 'vol24h': '↕',
                'tp1': '↕', 'ex1': '↕', 'vol1': '↕', 'pp1': '↕', 'ask': '↕',
                'tp2': '↕', 'ex2': '↕', 'vol2': '↕', 'pp2': '↕', 'bid': '↕',
                'spread': '↕',
            }
        }

        this.paramState = {
            'cn': '', 'pc24h_from': '', 'pc24h_to': '', 'mc_from': '', 'mc_to': '', 'vol24h_from': '', 'vol24h_to': '',
            'bcs1': '', 'tcs1': '', 'ex1': '', 'pp1_from': '', 'pp1_to': '', 'vol1_from': '', 'vol1_to': '', 'dex1': '', 'cex1': '', 'other1': '',
            'bcs2': '','tcs2': '','ex2': '','pp2_from': '','pp2_to': '','vol2_from': '','vol2_to': '','dex2': '','cex2': '','other2': '',
            'spread_from': '','spread_to': '','sort_by': '','sort_dir': ''
        }
        var last_api_url = localStorage.getItem('last_api_url');

        if (last_api_url) {
            const url = new URL(`http://localhost:8000${last_api_url}`);
            const params = new URLSearchParams(url.search);

            if (['asc', 'desc'].includes(params.get('sort_dir'))) {
                var sort_dir_dict = this.state.sortDirState;
                sort_dir_dict[params.get('sort_by')] = params.get('sort_dir') == 'asc' ? '↑' : '↓';
                this.setState({
                    sortDirState: sort_dir_dict
                })
            }
            for (var param in this.paramState) {
                this.paramState[param] = params.get(param) || '';
            }
        }

        this.nextPage = this.nextPage.bind(this);
        this.sortHandler = this.sortHandler.bind(this);
        this.inputTimeout = this.inputTimeout.bind(this);
    }

    componentDidMount() {
        var self = this;
        var last_api_url = localStorage.getItem('last_api_url');
        
        if (last_api_url) {
            arbitragePairsService.getArbitragePairsByURL(last_api_url).then((result) => {
                self.setState({
                    coins: result.data,
                    nextPageURL: result.next_page_link
                });
            });    
        }
        else {
            arbitragePairsService.getArbitragePairsByURL(last_api_url).then((result) => {
                this.setState({
                    coins: result.data,
                    nextPageURL: result.next_page_link
                });
            });
        }
    }

    nextPage() {
        var self = this;

        arbitragePairsService.getArbitragePairsByURL(self.state.nextPageURL).then((result) => {
            self.setState({
                coins: this.state.coins.concat(result.data),
                nextPageURL: result.next_page_link
            });
        });
    }

    inputTimeout = (event, param) => {
        var self = this;

        if (this.state.typingTimeout) {
           clearTimeout(this.state.typingTimeout);
        }

        if (['dex1', 'cex1', 'other1', 'dex2', 'cex2', 'other2'].includes(param)) {
            if (!event.target.checked) {
                this.paramState[param] = event.target.checked.toString();
            }
            else {
                this.paramState[param] = '';
            }
        }
        else {
            this.paramState[param] = event.target.value;
        }
        self.setState({
            typing: false,
            typingTimeout: setTimeout(() => {
                arbitragePairsService.getArbitragePairsByURL(this.createUrl()).then((result) => {
                    self.setState({
                        coins: result.data,
                        nextPageURL: result.next_page_link
                    });
                });
            }, 2500),
        });
    }

    sortHandler(sort_by) {
        this.paramState['sort_by'] = sort_by;
        var sort_dir = this.state.sortDirState[sort_by];
        var sort_dir_dict = this.state.sortDirState;
        sort_dir_dict[sort_by] = '↕...';

        this.setState({
            sortDirState: sort_dir_dict
        })
        if (sort_dir == '↕') {
            this.paramState['sort_dir'] = 'desc';
            sort_dir = '↓';
        }
        else if (sort_dir == '↓') {
            this.paramState['sort_dir'] = 'asc';
            sort_dir = '↑';
        }
        else {
            this.paramState['sort_dir'] = '';
            this.paramState['sort_by'] = '';
            sort_dir = '↕';
        }
        arbitragePairsService.getArbitragePairsByURL(this.createUrl()).then((result) => {
            this.setState({
                coins: result.data,
                nextPageURL: result.next_page_link
            });
            sort_dir_dict[sort_by] = sort_dir;
            this.setState({
                tableHeaderState: sort_dir_dict
            });
        });
    }

    createUrl() {
        var result_url = '/api/arbitrage_pairs/?'
        const param_keys = Object.keys(this.paramState)
        const param_values = Object.values(this.paramState)

        for (var i in param_values) {
            if (param_values[i]) {
                result_url += param_keys[i] + '=' + param_values[i] + '&';
            }
        }
        result_url = result_url.slice(0, -1);
        localStorage.setItem('last_api_url', result_url);
        return result_url;
    }

    round(num) {
        if (num) {
            return num.toFixed(2);
        }
        return ' -'
    }

    render() {
        return (
            <div ref={this.handleScroll} className='container align-items-center justify-content-center'>
                <table className="table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>
                                <HintInput hint='#' placeholdertext='Coin Name' param='cn' value={this.paramState.cn} onChange={this.inputTimeout}/>
                                <HintInput hint='From' placeholdertext='24H Price change' param='pc24h_from' value={this.paramState.pc24h_from} onChange={this.inputTimeout}/>
                                <HintInput hint='To' placeholdertext='24H Price change' param='pc24h_to' value={this.paramState.pc24h_to} onChange={this.inputTimeout}/>
                                <HintInput hint='From' placeholdertext='Market Cap' param='mc_from' value={this.paramState.mc_from} onChange={this.inputTimeout}/>
                                <HintInput hint='To' placeholdertext='Market Cap' param='mc_to' value={this.paramState.mc_to} onChange={this.inputTimeout}/>
                                <HintInput hint='From' placeholdertext='24H Volume' param='vol24h_from' value={this.paramState.vol24h_from} onChange={this.inputTimeout}/>
                                <HintInput hint='To' placeholdertext='24H Volume' param='vol24h_to' value={this.paramState.vol24h_to} onChange={this.inputTimeout}/>
                            </th>
                            <th>
                                <div className='row'>
                                    <div className='col mb-1'>
                                        <input class="form-check-input" type="checkbox" defaultChecked={!this.paramState.dex1} onChange={event => this.inputTimeout(event, 'dex1')}/>
                                        <span className='ms-1'>DEX</span>
                                    </div>
                                    <div className='col mb-1'>
                                        <input class="form-check-input" type="checkbox" defaultChecked={!this.paramState.cex1} onChange={event => this.inputTimeout(event, 'cex1')}/>
                                        <span className='ms-1'>CEX</span>
                                    </div>
                                    <div className='col mb-1'>
                                        <input class="form-check-input" type="checkbox" defaultChecked={!this.paramState.other1} onChange={event => this.inputTimeout(event, 'other1')}/>
                                        <span className='ms-1'>other</span>
                                    </div>
                                </div>
                                <HintInput hint='#' placeholdertext='Base Coin Symbol' param='bcs1' value={this.paramState.bcs1} onChange={this.inputTimeout}/>
                                <HintInput hint='#' placeholdertext='Target Coin Symbol' param='tcs1' value={this.paramState.tcs1} onChange={this.inputTimeout}/>
                                <HintInput hint='#' placeholdertext='Exchanger' param='ex1' value={this.paramState.ex1} onChange={this.inputTimeout}/>
                                <HintInput hint='From' placeholdertext='Volume' param='vol1_from' value={this.paramState.vol1_from} onChange={this.inputTimeout}/>
                                <HintInput hint='To' placeholdertext='Volume' param='vol1_to' value={this.paramState.vol1_to} onChange={this.inputTimeout}/>
                                <HintInput hint='From' placeholdertext='Pair Price' param='pp1_from' value={this.paramState.pp1_from} onChange={this.inputTimeout}/>
                                <HintInput hint='To' placeholdertext='Pair Price' param='pp1_to' value={this.paramState.pp1_to} onChange={this.inputTimeout}/>
                            </th>
                            <th>
                                <div className='row'>
                                    <div className='col mb-1'>
                                        <input class="form-check-input" type="checkbox" defaultChecked={!this.paramState.dex2} onChange={event => this.inputTimeout(event, 'dex2')}/>
                                        <span className='ms-1'>DEX</span>
                                    </div>
                                    <div className='col mb-1'>
                                        <input class="form-check-input" type="checkbox" defaultChecked={!this.paramState.cex2} onChange={event => this.inputTimeout(event, 'cex2')}/>
                                        <span className='ms-1'>CEX</span>
                                    </div>
                                    <div className='col mb-1'>
                                        <input class="form-check-input" type="checkbox" defaultChecked={!this.paramState.other2} onChange={event => this.inputTimeout(event, 'other2')}/>
                                        <span className='ms-1'>other</span>
                                    </div>
                                </div>
                                <HintInput hint='#' placeholdertext='Base Coin Symbol' param='bcs2' value={this.paramState.bcs2} onChange={this.inputTimeout}/>
                                <HintInput hint='#' placeholdertext='Target Coin Symbol' param='tcs2' value={this.paramState.tcs2} onChange={this.inputTimeout}/>
                                <HintInput hint='#' placeholdertext='Exchanger' param='ex2' value={this.paramState.ex2} onChange={this.inputTimeout}/>
                                <HintInput hint='From' placeholdertext='Volume' param='vol2_from' value={this.paramState.vol2_from} onChange={this.inputTimeout}/>
                                <HintInput hint='To' placeholdertext='Volume' param='vol2_to' value={this.paramState.vol2_to} onChange={this.inputTimeout}/>
                                <HintInput hint='From' placeholdertext='Pair Price' param='pp2_from' value={this.paramState.pp2_from} onChange={this.inputTimeout}/>
                                <HintInput hint='To' placeholdertext='Pair Price' param='pp2_to' value={this.paramState.pp2_to} onChange={this.inputTimeout}/>
                            </th>
                            <th>
                                <div>
                                    <Blacklisted className="btn btn-primary w-100 mb-1"/>
                                    <HintInput hint='From' placeholdertext='Spread' param='spread_from' value={this.paramState.spread_from} onChange={this.inputTimeout}/>
                                    <HintInput hint='To' placeholdertext='Spread' param='spread_to' value={this.paramState.spread_to} onChange={this.inputTimeout}/>
                                </div>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                <span role="button" className='noselect'>
                                    #
                                </span>
                            </th>
                            <th>
                                <span role="button" className='noselect' onClick={() => this.sortHandler('cn')}>
                                    Coin Name {this.state.sortDirState['cn']}
                                </span>
                                <br />
                                <span role="button" className='noselect' onClick={() => this.sortHandler('symbol')}>
                                    Symbol {this.state.sortDirState['symbol']}
                                </span>
                                <br />
                                <span role="button" className='noselect' onClick={() => this.sortHandler('pc24h')}>
                                    24H Price Change {this.state.sortDirState['pc24h']}
                                </span>
                                <br />
                                <span role="button" className='noselect' onClick={() => this.sortHandler('mc')}>
                                    Market Cap {this.state.sortDirState['mc']}
                                </span>
                                <br />
                                <span role="button" className='noselect' onClick={() => this.sortHandler('vol24h')}>
                                    24H Volume {this.state.sortDirState['vol24h']}
                                </span>
                            </th>
                            <th>
                                <span role="button" className='noselect' onClick={() => this.sortHandler('tp1')}>
                                    Trading Pair {this.state.sortDirState['tp1']}
                                </span>
                                <br />
                                <span role="button" className='noselect' onClick={() => this.sortHandler('ex1')}>
                                    Exchanger {this.state.sortDirState['ex1']}
                                </span>
                                <br />
                                <span role="button" className='noselect' onClick={() => this.sortHandler('vol1')}>
                                    Volume {this.state.sortDirState['vol1']}
                                </span>
                                <br />
                                <span role="button" className='noselect' onClick={() => this.sortHandler('ask')}>
                                    Ask {this.state.sortDirState['ask']}
                                </span>
                                <br />
                                <span role="button" className='noselect' onClick={() => this.sortHandler('pp1')}>
                                    Pair Price {this.state.sortDirState['pp1']}
                                </span>
                            </th>
                            <th>
                                <span role="button" className='noselect' onClick={() => this.sortHandler('tp2')}>
                                    Trading Pair {this.state.sortDirState['tp2']}
                                </span>
                                <br />
                                <span role="button" className='noselect' onClick={() => this.sortHandler('ex2')}>
                                    Exchanger {this.state.sortDirState['ex2']}
                                </span>
                                <br />
                                <span role="button" className='noselect' onClick={() => this.sortHandler('vol2')}>
                                    Volume {this.state.sortDirState['vol2']}
                                </span>
                                <br />
                                <span role="button" className='noselect' onClick={() => this.sortHandler('bid')}>
                                    Bid {this.state.sortDirState['bid']}
                                </span>
                                <br />
                                <span role="button" className='noselect' onClick={() => this.sortHandler('pp2')}>
                                    Pair Price {this.state.sortDirState['pp2']}
                                </span>
                            </th>
                            <th>
                                <span role="button" className='noselect' onClick={() => this.sortHandler('spread')}>
                                    Spread {this.state.sortDirState['spread']}
                                </span>
                            </th>
                        </tr>
                        </thead>
                    <tbody>
                        {this.state.coins.map((coin, index) =>
                            <tr key={coin.pk}>
                                <td>{index+1}</td>
                                <td>
                                    <div>{coin.base_trading_pair.base_coin.name}</div>
                                    <div>{coin.base_trading_pair.base_coin.symbol}</div>
                                    <div>{this.round(coin.base_trading_pair.base_coin.price_change_24h)}%</div>
                                    <div>${this.round(coin.base_trading_pair.base_coin.market_cap)}</div>
                                    <div>${this.round(coin.base_trading_pair.base_coin.volume_24h)}</div>
                                </td>
                                <td>
                                    <div>
                                        <a href={coin.base_trading_pair.trade_url}>
                                            {coin.base_trading_pair.base_coin.symbol}
                                            /
                                            {coin.base_trading_pair.target_coin_symbol}
                                        </a>
                                    </div>
                                    <div>{coin.base_trading_pair.exchange.name}</div>
                                    <div>${coin.base_trading_pair.volume}</div>
                                    <div>${coin.base_trading_pair.ask || ' -'}</div>
                                    <div>${coin.base_trading_pair.price}</div>
                                </td>
                                <td>
                                    <div>
                                        <a href={coin.target_trading_pair.trade_url}>
                                            {coin.target_trading_pair.base_coin.symbol}
                                            /
                                            {coin.target_trading_pair.target_coin_symbol}
                                        </a>
                                    </div>
                                    <div>{coin.target_trading_pair.exchange.name}</div>
                                    <div>${coin.target_trading_pair.volume}</div>
                                    <div>${coin.target_trading_pair.bid || ' -'}</div>
                                    <div>${coin.target_trading_pair.price}</div>
                                </td>
                                <td>
                                    <br/><br/>
                                    <div>
                                        {coin.spread}%
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div className='d-flex justify-content-center'>
                    {this.state.nextPageURL ? <button className="btn btn-primary w-25 mb-5" onClick={this.nextPage}>Show More</button> : null}
                </div>
            </div>
        );
    }
}

export  default  ArbitragePairsList;
