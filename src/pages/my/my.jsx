import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from '@/store/index';
import ComFooter from '@/component/comFooter';
// import IsLogin from '@/component/isLogin';
import '@/css/my.css';
import {
    setCarCount,
    changeIsLogin
} from '@/store/action';

export default class My extends Component {

    constructor(props, context) {
        super();

        this.state = {
            person : {},
            rerurnCount : '',
            takeCount : '',
            notPayCount : '',
            notSendCount : '',
            finishCount : '',
        };

        // 获取用户信息
        this.getUserInfo = () => {
            window.axios.post(window.API.checkUser)
            .then( (data) => {
                this.setState({
                    person : data.data.userInfo
                });
            });
        };

        // 获取订单数据
        this.getTradeCount = () => {
            window.axios.post(window.API.tradeCount)
            .then((data) => {
                var data1 = data.data;
                this.setState({
                    rerurnCount : data1.rerurnCount,
                    notPayCount : data1.notPayCount,
                    takeCount : data1.takeCount,
                    notSendCount : data1.notSendCount,
                    finishCount : data1.finishCount
                });
            });
        };

        // 用户退出登录
        this.logOut = () => {
            window.axios.post(window.API.loginOut)
            .then( (data) => {
                if ( data.data.success ) {
                    store.dispatch(changeIsLogin(false));
                    store.dispatch(setCarCount(''));
                    // 编程式跳转路由
                    this.props.history.push('/');
                }
            });
        };

    }

    componentWillMount() {
        if ( store.getState().reducer.isLogin ) {
            this.getUserInfo();
            this.getTradeCount();
        } else {
            this.props.history.push('/login');
        }
    }

    render() {
        return (
            <div>
                <div className="my-header">
                    <img src="../m-images/my-header-bg.jpg" alt="" />
                    <a href="" className="person">
                        <img src={this.state.person.headUrl} alt="" />
                        <span>{this.state.person.nickName}</span>
                    </a>
                </div>
                <div className="my-order">
                    <div className="my-order-header">
                        <span>我的订单</span>
                        <Link to="order?type=0"><span className="see-all-order">查看全部订单</span><i className="com-right-tip"></i></Link>
                    </div>
                    <div className="my-header-con">
                        <Link to="order?type=1">
                            <div className="img-box">
                                <img src="../m-images/order-1.png" alt="" />
                                <span className="num">{this.state.notPayCount===0 ? '' : this.state.notPayCount}</span>
                            </div>
                            <p>待付款</p>
                        </Link>
                        <Link to="order?type=2">
                            <div className="img-box">
                                <img src="../m-images/order-2.png" alt="" />
                                <span className="num">{this.state.notSendCount===0 ? '' : this.state.notSendCount}</span>
                            </div>
                            <p>待发货</p>
                        </Link>
                        <Link to="order?type=3">
                            <div className="img-box">
                                <img src="../m-images/order-3.png" alt="" />
                                <span className="num">{this.state.takeCount===0 ? '' : this.state.takeCount}</span>   
                            </div>
                            <p>待收货</p>
                        </Link>
                        <Link to="order?type=4">
                            <div className="img-box">
                                <img src="../m-images/order-4.png" alt="" />
                                <span className="num">{this.state.finishCount===0 ? '' : this.state.finishCount}</span>                                   
                            </div>
                            <p>已完成</p>
                        </Link>
                    </div>
                </div>
                <div className="my-items">
                    <a href="/m-html/my/my-collection.html" className="items">
                        <div className="item-bg-2">
                            <span>我的收藏</span>
                        </div>
                        <div className="item-tips">
                            <i className="com-right-tip"></i>
                        </div>
                    </a>
                    <Link className="items" to="/address">
                        <div className="item-bg-3">
                            <span>地址管理</span>
                        </div>
                        <div className="item-tips">
                            <i className="com-right-tip"></i>
                        </div>
                    </Link>
                </div>
                <a href="" className="out-login" onClick={this.logOut}>退出登录</a>

                <ComFooter
                    showFooter="true"
                    activeClass="activeMy"
                />

            </div>
        )
    }
}


