import React, { Component } from 'react';
import {
	BrowserRouter as Router,
	Routes,
	Route,
} from 'react-router-dom';

import ArbitragePairsList from './CoinsTable/ArbitragePairsList';
import Header from './Header/Header';
import Home from './Home/Home'

const BaseLayout = () => (
	<div className='mt-70'>
		<Router>
			<Header />
			<Routes>
				<Route exact path='/' element={<Home />}></Route>
				<Route exact path='/arb' element={<ArbitragePairsList />}></Route>
			</Routes>
		</Router>
	</div>
)

class App extends Component {
	render() {
		return <BaseLayout />;
	}
}

export default App;
