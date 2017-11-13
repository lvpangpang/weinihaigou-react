import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ComNavigation from '@/component/comNavigation';
import lazyImg from '@/js/imgLazy';
import '@/css/order.css';
import ComLoading from '@/component/comLoading';

export default class order extends Component {
    constructor(props, context) {
        super();
        this.state = {
            orderTrades : [],
            isLoading : true,
            type : parseInt(window.commonMethods.getUrlPram('type')),
            noNum : false
        };

        // 获取订单信息
        this.getOrder = (type) => {
            this.setState({
                type : type,
                isLoading : true,
                noNum : false,
                orderTrades : []
            });
            window.axios.post(window.API.orderMo, window.commonMethods.param({type : type}))
            .then((data) => {
                console.log(data.data);
                var data1 = data.data;
                if ( data1.message === true ) {
                    this.setState({
                        orderTrades : data1.orderTrades,
                        isLoading : false
                    });
                    if( this.state.orderTrades.length===0 ) {
                        this.setState({
                            noNum : true
                        });
                    } else {
                        new lazyImg();
                    }
                }
            });
        };

        this.delOrder = (tradeId) => {
            window.axios.post(window.API.delTrade, window.commonMethods.param({tradeIds : tradeId}))
            .then((data) => {
                var data1 = data.data;
                if ( data1.message ) {
                    if ( data1.msg==="00000000" ) {
                        this.getOrder(this.type);
                    }
                }
            });
        };

        this.qxOrder = (tradeNo) => {
            window.axios.post(window.API.updateTrade, window.commonMethods.param({tradeNo : tradeNo}))
            .then((data) => {
                this.getOrder(this.state.type);
            });
        };

        this.takeOrder = (tradeId) => {
            window.axios.post(window.API.updateStatus, window.commonMethods.param({tradeId : tradeId}))
            .then((data) => {
                this.getOrder(this.state.type);
            });
        };

        this.format = (time) => {
            let date = new Date(time);
            return  date.getFullYear()+ '-' + this.two(date.getMonth()+1) + '-' + this.two(date.getDate());
        };

        this.two = (day) => {
            if( day<10 ) {
                return '0' + day;
            }
            return day;
        };

        this.getTradeStatus = (tradeStatus) => {
            switch (tradeStatus) {
                case '0' :
                    return '交易关闭'
                case '1' :
                    return '等待付款'
                case '2' :
                    return '待发货'
                case '5' :
                    return '待发货'
                case '7' :
                    return '已发货'
                case '11' :
                    return '交易成功'
                default : 
                    return '交易成功' 
            }
        };
    }

    componentDidMount() {
        this.getOrder(this.state.type);
    }

    render() {
        return (
            <div className="com-body3">
                <ComNavigation headerName="我的订单" back="true"></ComNavigation>
                <div className="order-header">
                    <a  onClick={this.getOrder.bind(this, 0)} className={ this.state.type===0 ? 'active' : '' }>全部</a>
                    <a  onClick={this.getOrder.bind(this, 1)} className={ this.state.type===1 ? 'active' : '' }>待付款</a>
                    <a  onClick={this.getOrder.bind(this, 2)} className={ this.state.type===2 ? 'active' : '' }>待发货</a>
                    <a  onClick={this.getOrder.bind(this, 3)} className={ this.state.type===3 ? 'active' : '' }>待收货</a>
                    <a  onClick={this.getOrder.bind(this, 4)} className={ this.state.type===4 ? 'active' : '' }>已完成</a>
                </div>
                <div className="order-con">
                    {
                        this.state.orderTrades.map( (data, index, arr ) => {
                            return(
                                <div className="order-item" id={data.tradeId} key={index}>
                                    <div className="item-header">
                                        <p>订单编号:<span>{data.tradeNo}</span></p>
                                        <div>
                                        <span className="order-color">{this.getTradeStatus(data.tradeStatus)}</span>
                                        {
                                            (data.tradeStatus===1||data.tradeStatus===11||data.tradeStatus===0) && 
                                            <a  onClick={this.delOrder(data.tradeId)} className="delete"></a>
                                        }
                                    </div>
                                    </div>
                                    {
                                        data.orderGoods.map( ( d, index, arr ) => {
                                            return (
                                                <div  className="goods-details" key={index}>
                                                    <div className="img-box">
                                                        <img data-src={d.goodsImgUrl} alt="" />
                                                    </div>
                                                    <div className="goods-der">
                                                        <p className="goods-name">{d.tradeName}</p>
                                                        <div className="goods-tips">
                                                            <span>税率：<span>{(d.rateTax*100).toFixed(2)}</span>%</span>
                                                            <span>规格：<span>{d.skuName}</span></span>
                                                        </div>
                                                    </div>
                                                    <div className="price">
                                                        <p>￥<span>{d.sellPrice.toFixed(2)}</span></p>
                                                        <p className="goods-num">×<span>{d.sellCount}</span></p>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                    
                                    <div className="order-time">
                                        <p>{this.format(data.regTime)}</p>
                                        <div className="all-money">
                                            <span><span>共</span><span>{data.orderGoods.length}</span><span>件</span></span>
                                            <span><span>应付总额：￥</span><span className="order-color">{data.rcvTotal.toFixed(2)}</span></span>
                                        </div>
                                    </div>

                                    {
                                        data.tradeStatus==='1' 
                                        && 
                                        <div className="make-box">
                                            <a  onClick={this.qxOrder(data.tradeNo)}>取消订单</a>
                                            <Link to={'orderDetails?tradeNo=' + data.tradeNo} className="red">去付款</Link>
                                        </div>
                                    }

                                    {
                                        data.tradeStatus==='7' 
                                        && 
                                        <div className="make-box">
                                            <Link to={'logistics?logistid=' + data.logistid +'&postId=' + data.postId } className="red">去付款</Link>
                                            <a  onClick={this.takeOrder(data.tradeId)}  className="red">确认收货</a>
                                        </div>
                                    }
                                </div>
                            )
                        })
                    }
                </div>
                <ComLoading isLoading={this.state.isLoading}></ComLoading>
                {
                    this.state.noNum && <div class="com-no-num margin-top" ><img src="../../m-images/no-order.png" /></div>
                }
            </div>
        )
    }
}


