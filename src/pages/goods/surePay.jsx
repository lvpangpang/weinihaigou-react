import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import ComNavigation from '@/component/comNavigation';
import ComLoading from '@/component/comLoading';
import Toast from '@/component/toast';
import '@/css/surePay.css';

export default class SurePay extends Component {
    constructor(props, context) {
        super();
        this.state = {
            tradeNo : '',
            addrList : [],
            post : [],
            shopList : [],
            cList : [],
            amountAll : 0,
            discount : 0,
            postAge : 0,
            couponId : '',
            couDiscount : 0,
            taxAll : 0,
            relMoney : 0,
            cou_flag : '',
            remark : '',
            name : '',
            cardId : '',
            isLoading : true,
            isShow : false,
            msg : ''
        };

        this.getPayInfo = () => {
            window.axios.post(window.API.toMoPalaceOrder).then( ( data ) => {
                var data1 = data.data;
                if (data1.success) {
                    this.setState({
                        isLoading : false,
                        addrList : data1.addrList,
                        post : data1.post,
                        shopList : data1.shopList,
                        cList : data1.cList,
                        amountAll : data1.amountAll,
                        discount : data1.discount,
                        postAge : data1.postAge,
                        couDiscount : data1.couDiscount,
                        taxAll : data1.taxAll,
                        relMoney : data1.amountAll + data1.postAge + data1.taxAll - data1.couDiscount - data1.discount
                    });
                } else {
                    this.props.history.push('/');
                }
            });
        };

        this.goOrder = () => {
            var adrList = this.state.addrList,
                addressId = "",
                isSelect = 0,
                couponId = this.state.cou_flag,
                payStatus = 4,
                orderItem = {},
                orderList = [];

            // 判断是否是微信
            if( window.commonMethods.checkIsWx() ) {
                payStatus = 5;
            }

            this.state.shopList.forEach( (item, index, arr) => {
                orderItem = {
                    skuNo : item.skuNo,
                    num : item.num
                };
                orderList.push(orderItem);
            });

            if( adrList.length>0 ) {
                addressId = adrList[0].addr_id;
            }

            if( addressId==='' ) {
                this.setState({
                    isShow : true,
                    msg : '收货地址不能为空!'
                });
                return;
            }

            if( couponId!==0&&couponId!==''&&couponId!==null ){
                isSelect = 1;
            }

            window.axios.post(window.API.createOrder, window.commonMethods.param({
                param:JSON.stringify(orderList),
                remark:this.state.remark,
                addressId:addressId,
                couponId:couponId,
                isSelect:isSelect
                })).then( ( data ) => {
                var data1 = data.data;
                console.log(data);
                if( data1.success ) {
                    this.goPay(payStatus, data1.result);
                } else {
                    if( data1.message==='未实名认证' ) {
                        $('.real-box').show();
                    } else {
                        this.setState({
                            isShow : true,
                            msg : data1.message
                        });
                    }
                }
            });
        },

        this.goPay = (payStatus, tradeNo) => {
            window.axios.post(window.API.createOrder, window.commonMethods.param({
                tradeNo : tradeNo,
                payStatus : payStatus
                })).then( ( data ) => {
                var data1 = data.data;
                if( data1.success ) {
                    window.location.href = data1.result;
                } else {
                    if (data1.msg==='000000012') {
                        this.setState({
                            isShow : true,
                            msg : '订单已超过支付时间，请重新下单'
                        });
                    } else if (data1.msg==='000000014'){
                        this.setState({
                            isShow : true,
                            msg : '订单已支付，请不要重复提交'
                        });
                    } else {
                        this.setState({
                            isShow : true,
                            msg : '网络异常，请稍后再试'
                        });
                    }
                }
            });
        };

        this.geTorealName = () => {
            if ( this.state.name === '' ) {
                this.setState({
                    isShow : true,
                    msg : '请输入用户名'
                });
                return;
            }
            if ( !window.commonMethods.testVerifyCard(this.state.cardNo) ) {
                this.setState({
                    isShow : true,
                    msg : '请输入格式正确的身份证'
                });
                return;
            }
            window.axios.post(window.API.saveUserDetail, window.commonMethods.param({
                realName: this.state.realName,
                cardNo: this.state.cardNo
                })).then( ( data ) => {
                var data1 = data.data;
                if( data1.success ) {
                    this.goOrder();
                }
            });
        };

         // 该事件将被子组件触发
        this.noShow = (obj) => {
            this.setState({
                 isShow : false
            });
        };

    }

    componentDidMount() {
        this.getPayInfo();
    }

    render() {
        return (
            <div>
                <ComNavigation headerName="确认支付" back="true"></ComNavigation>
                <div className="top-box"></div>
                <div className="address-box">
                    {
                        this.state.addrList[0] 
                        ? 
                        <Link to={'address?fromAddress=1'} className="has-address">
                            <div className="address-left">
                                <p className="name-phone">
                                    <span>{this.state.addrList[0].person_name}</span>
                                    <span>{this.state.addrList[0].serv_num}</span>
                                </p>
                                <div className="address-tips">
                                        <i></i>
                                    <span>
                                        <label>{this.state.addrList[0].area_name.split(' ')[0]}</label>
                                        <label>{this.state.addrList[0].area_name.split(' ')[1]}</label>
                                        <label>{this.state.addrList[0].area_name.split(' ')[2]}</label>
                                        <label>{this.state.addrList[0].address}</label>
                                    </span>
                                </div>
                            </div>
                            <i className="com-right-tip"></i>
                        </Link>
                        :
                        <Link to={'address?fromAddress=1'} className="no-address">
                            <div className="add-address">添加收货地址</div>
                            <i className="com-right-tip"></i>
                        </Link>
                        }
                </div>
                <div className="goods-items">
                    {
                        this.state.shopList.map( (data, index, arr) => {
                            return (
                                <div className="item" key={index}>
                                    <div className="img-box"><img src={data.imgUrl} /></div>
                                    <div className="details">
                                        <p className="goods-name">{data.goodsName2}</p>
                                        <p className="norms">规格:<span>{data.skuName}</span></p>
                                        <p className="money">¥<span>{data.skuPrice.toFixed(2)}</span></p>
                                    </div>
                                    <span className="num">×<span>{data.num}</span></span>
                                </div>
                            );
                        })
                    }
                </div>
                <div className="order-items">
                    <p className="item">
                        <span>商品金额(不含税):</span>
                        <span className="money">¥<span>{this.state.amountAll.toFixed(2)}</span></span>
                    </p>
                    <p className="item">
                        <span>活动:</span>
                        <span className="money">-¥<span>{this.state.discount.toFixed(2)}</span></span>
                    </p>
                    <p className="item">
                        <span>优惠券优惠:</span>
                        <span className="money">-¥<span>{this.state.couDiscount.toFixed(2)}</span></span>
                    </p>
                    <p className="item">
                        <span>运费:</span>
                        <span className="money">¥<span>{this.state.postAge.toFixed(2)}</span></span>
                    </p>
                    <p className="item">
                        <span>税费:</span>
                        <span className="money">¥<span>{this.state.taxAll.toFixed(2)}</span></span>
                    </p>
                    <p className="item">
                        <span>应付总额:</span>
                        <span className="money">¥<span>{this.state.relMoney.toFixed(2)}</span></span>
                    </p>
                    <div className="safe-tip">安全提醒：付款成功后，唯妮海购不会以付款异常，系统升级为理由联系您，请勿泄漏银行卡号，手机验证码，否则会造成钱款的损失。如有疑问请咨询客服，谨防电话诈骗。</div>
                </div>
                <div className="message-remarks">
                    <div className="message">
                        <p>留言备注:</p>
                        <textarea value={this.state.remark}></textarea>
                    </div>
                </div>
                <div className="pay-box">
                    <p className="pay-header">选择支付方式:</p>
                    <div className="pay-main">
                        {
                            !window.commonMethods.checkIsWx() 
                            ?
                            <a  className="zfb active">
                                <span>支付宝</span>
                                <i></i>
                            </a>
                            :
                            <a  className="wx active">
                                <span>微信</span>
                                <i></i>
                            </a>
                        }
                    </div>
                </div>
                <div className="pay-footer">
                    <div className="all-money">共计:<span>¥<span>{this.state.relMoney.toFixed(2)}</span></span></div>
                    <a  onClick={this.goOrder} className="pay-btn">确认并付款</a>
                </div>

                {/*实名认证弹框*/}
                <div className="real-box">
                    <div className="real-bg"></div>
                    <div className="real-main">
                        <div className="real-header">
                            <span>实名认证</span>
                            <a  className="close"></a>
                        </div>
                        <div className="real-con">
                            <input type="text" name="" className="real-name" placeholder="您的真实姓名" v-model="name" />
                            <input type="text" name="" className="real-crad-no"  placeholder="您的身份证号码（将加密处理）" v-model="cardId" />
                            <p className="tips-box">备注: 海关要求购买跨境商品需提供实名信息哦！</p>
                            <a  className="sub-btn" onClick={this.geTorealName}>完成</a>
                        </div>
                    </div>
                </div>

                <ComLoading isLoading="isLoading"></ComLoading>
                <Toast
                    isShow={this.state.isShow}
                    msg={this.state.msg}
                    noShow={this.noShow}
                ></Toast>
            </div>
        )
    }
}


