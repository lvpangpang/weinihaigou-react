import React from 'react';
import { Router, Route } from 'react-router';
import createHistory from 'history/createBrowserHistory';
import asyncComponent from '@/component/asyncComponent';
import index from '@/pages/index';

const history = createHistory();

const classIndex = asyncComponent(() => import("@/pages/class/class"));
const my = asyncComponent(() => import("@/pages/my/my"));
const login = asyncComponent(() => import("@/pages/my/login"));
const search = asyncComponent(() => import("@/pages/goods/search"));
const goodsResult = asyncComponent(() => import("@/pages/goods/goodsResult"));
const goodsDetails = asyncComponent(() => import('@/pages/goods/goodsDetails'));
const order = asyncComponent(() => import('@/pages/my/order'));
const surePay = asyncComponent(() => import('@/pages/goods/surePay'));
const shopCar = asyncComponent(() => import('@/pages/goods/shopCar'));

const RouteConfig = (
    <Router path="/" history={history}>
        <div>
            <Route path="/"  exact component={index} />
            <Route path="/class" component={classIndex} />
            <Route path="/my" component={my} />  
            <Route path="/login" component={login} />    
            <Route path="/search" component={search} />  
            <Route path="/goodsResult" component={goodsResult} />     
            <Route path="/goodsDetails" component={goodsDetails} />
            <Route path="/order" component={order} />   
            <Route path="/surePay" component={surePay} />  
            <Route path="/shopCar" component={shopCar} />                                                                                                                                                                                                                                                                                                                                                                                                                                                   
        </div>
    </Router>
);
export default RouteConfig;
