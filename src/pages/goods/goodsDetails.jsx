import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import store from '@/store/index';
import '@/css/goodsDetails.css';
import Toast from '@/component/toast';
import lazyImg from '@/js/imgLazy.js';
import NumControl from '@/component/numControl';
import {
    setCarCount
} from '@/store/action';

export default class GoodsDetails extends Component {
    constructor(props, context) {
        super();
        this.state = {
            goodsNo:  window.commonMethods.getUrlPram('goodsNo'),//goodsNo
            skuId : '',//skuId
            goodsObj : {},//商品详情对象
            imgShowList : [],//详情轮播图
            imgList : [],//商品详情图片
            goodsDetail : [],//商品详情
            goodsDetails : [],//商品全部详情
            skuPrice : [],//sku价格区间
            showSku : {},//默认显示的sku对象
            showPrice : 0,//显示的价格
            number :1,//选择数量
            count : 1,//库存
            nowTime :'',//服务器时间
            hasColltion : false,//判断是否收藏
            isBuy : true,//判断是否是购买还是加入购物车
            isLogin : store.getState().reducer.isLogin,//登录状态
            isShow : '',//显示toast
            msg : '',//toast内容
        };  

        // 点击购买
        this.goBuy = () => {
            if( this.state.isLogin ) {
                this.setState({
                    isBuy : true
                });
                $('.sku-box').show();
                setTimeout(function() {
                    $('.sku-main').addClass('show');
                }, 0);
            } else {
                this.props.history.push('/login');
            }
        };

        // 点击加入购物车
        this.goShopCar = () => {
            if( this.state.isLogin ) {
                this.setState({
                    isBuy : false
                });
                $('.sku-box').show();
                setTimeout(function() {
                    $('.sku-main').addClass('show');
                }, 0);
            } else {
                this.props.history.push('/login');            
            }
        };

        // 点击弹框的确定（加入购物车或者购买）
        this.goSure = ()=> {
            if( this.state.showSku.count<=0||this.state.showSku.status!=='1' ) {
                return;
            }
            if ( this.state.isBuy ) {
                //跳转到支付页面
                window.commonMethods.setCookie('PALACE_ORDER_SKUNO', this.state.skuId);
                window.commonMethods.setCookie('PALACE_ORDER_NUMS', this.state.number);
                window.commonMethods.setCookie('PALACE_ORDER_COUPONID', "");
                window.commonMethods.setCookie('PALACE_ORDER_ADDRESS', "");
                window.commonMethods.setCookie('fromShop', 0);
                this.props.history.push('/surePay');            
            } else {
                this.addShopCar();
            }
        };

        // 添加收藏
        this.addCollect = () => {
            if( this.state.isLogin ) {
                if( this.state.hasColltion ) {
                    this.setState({
                        isShow : true,
                        msg: '已收藏'
                    });
                } else {
                    this.insertCollect();
                }
            } else {
                this.props.history.push('/login');            
            }
        };

        this.changeNumber = (numObj) => {
            // console.log(numObj);
            this.setState({
                number : numObj.val
            });
        };

        this.closeAll = () => {
            $('.instruction-main').removeClass('show');
            $('.sku-main').removeClass('show');
            $('.sure-add-buy').removeClass('go-buy').removeClass('add-shop-car');
            setTimeout(function() {
                $('.instruction-box').hide();
                $('.sku-box').hide();
            },100);
        };

        this.detailMo = () => {
            window.axios.post( window.API.detailMo, window.commonMethods.param({goodsNo : this.state.goodsNo}) ).then( ( data ) => {
                var data1 = data.data;
                this.setState({
                    goodsObj : data1,
                    imgShowList : data1.imgShowList,
                    imgList : data1.imgList,
                    origin : data1.origin,
                    activityList : data1.activityList,
                    goodsDetail : data1.goodsDetail,
                    goodsDetails : data1.detailList,
                    showSku : data1.detailList[0],
                    skuId : data1.detailList[0].skuId,
                    nowTime : data1.nowTime,
                    count : data1.detailList[0].count
                }, () => {
                     // 获取sku价格
                    this.getSkuPrice();
                });

                if ( this.state.isLogin ) {
                    this.isCollect();
                }
                new lazyImg();
                // var mySwiper = new Swiper('.swiper-container',{
                //     grabCursor: true,
                //     paginationClickable: true,
                //     pagination: '.pagination'
                // });
            });
        };

        this.getSkuPrice = () => {
            window.axios.post( window.API.getIntervalPrice, window.commonMethods.param({skuId : this.state.skuId}) ).then( ( data ) => {
                var data1 = data.data;
                if( data1.success ) {
                    this.setState({
                        skuPrice : data1.result
                    });
                    if( this.state.skuPrice.length===0 ) {
                        this.setState({
                            showPrice : this.state.showSku.skuPrice
                        });
                    } else {
                        this.setState({
                            showPrice : this.state.skuPrice[0].price
                        });
                    }
                }
            });
        };

        this.isCollect = () => {
            window.axios.post( window.API.ifCollect, window.commonMethods.param({goodsId : this.state.goodsDetail.goodsId}) ).then( ( data ) => {
                var data1 = data.data;
                if( data1.success ) {
                    this.setState({
                        hasColltion : true
                    });
                } else {
                    this.setState({
                        hasColltion : false
                    });
                }
            });
        };

        this.insertCollect = () => {
            window.axios.post( window.API.insertCollect, window.commonMethods.param({goodsId : this.state.goodsDetail.goodsId}) ).then( ( data ) => {
                var data1 = data.data;
                console.log(data1);
                if( data1.success ) {
                   if( data1.message==='00000023' ) {
                        this.setState({
                            isShow : true,
                            msg : '已收藏'
                        });
                    } else if( data1.message==='00000000' ) {
                        this.setState({
                            isShow : true,
                            msg : '收藏成功',
                            hasColltion : true
                        });
                    }
                }
            });
        };

        this.addShopCar = () => {
            window.axios.post( window.API.addShopCar, window.commonMethods.param({
                goodsId : this.state.showSku.goodsId,
                skuId : this.state.showSku.skuId,
                num : this.state.number
            })).then( ( data ) => {
                var data1 = data.data;
                if ( data1.success ) {
                    this.setState({
                        isShow : true,
                        msg : '成功'
                    });
                    $('.sku-main').removeClass('show');
                    setTimeout(function() {
                        $('.sku-box').hide();
                    },300);
                }
            }).then(() => {
                 window.axios.post(window.API.carCount).then( ( data ) => {
                    store.dispatch(setCarCount(data.data.count));
                });
            })
        };

        this.getNowTime = (nowTime) => {
            return new Date(nowTime).getTime();
        };

        this.format = (time) => {
            var date = new Date(time);
            function two(day) {
                if( day<10 ) {
                    return '0' + day;
                }
                return day;
            }
            return  date.getFullYear()+ '.' + two(date.getMonth()+1) + '.' + two(date.getDate());
        };

        this.deliveryCodeChange = (code) => {
            switch (code) {
                case '1' :
                    return '保税区邮'
                case '2' :
                    return '香港直邮'
                case '4' :
                    return '海外直邮'
                case '5' :
                    return '国内发货'
                default : 
                    return '国内发货'                
            }
        };

        // 该事件将被子组件触发
        this.noShow = (obj) => {
            this.setState({
                 isShow : false
            });
        };
      
    }

    componentDidMount() {
        this.detailMo();
        var oThis = this;
        // 说明
        $('.instruction').click(function() {
            $('.instruction-box').show();
            setTimeout(function() {
                $('.instruction-main').addClass('show');
            }, 0);
        });
        // 统一关闭
        $('.box-close').click(function() {
            oThis.closeAll();
        });
        $('.box-bg').click(function() {
            oThis.closeAll();
        });

        // 选择商品
        $(document).off().on('click', '.sku-con-items a', function() {
            if( $(this).hasClass('active') ) {
                return;
            }
            var index = $(this).index();
            $('.sku-con-items a').removeClass('active');
            $(this).addClass('active');
            // 改变sku对象
            oThis.setState({
                showSku : oThis.state.goodsDetails[index],
                skuId : oThis.state.goodsDetails[index]['skuId'],
                count : oThis.state.goodsDetails[index]['count']                
            });
            // 重新获取sku区间价格
            oThis.getSkuPrice();
        });

    }

    render() {
        return (
            <div>
                 <Toast
                    isShow={this.state.isShow}
                    msg={this.state.msg}
                    noShow={this.noShow}
                />
                <div className="header clearfix">
                    <Link to="shopCar"></Link>
                    <Link to="/shopCar" className="shopping-logo"><span>{store.getState().reducer.carCount}</span></Link>
                    <Link  to="/" className="home-logo"></Link>
                    <h1>商品详情</h1>
                    <a href="javascript:history.back()" className="header-back"></a>
                </div>
                <div className="banner">
                    <div className="swiper-container">
                        <div className="swiper-wrapper">
                            {
                                this.state.imgShowList.map((data, index, arr) => {
                                    return (
                                        <div key={index} className="swiper-slide"><a><img src={data.imgUrl} alt="" /></a></div>
                                    );
                                })
                            }
                        </div>
                        <div className="pagination"></div>
                    </div>
                </div>
                <div className="price-box" >
                    <div className="name-share">
                        <p className="name">{this.state.goodsDetail.goodsName2}</p>
                    </div>
                    <div className="price-section-box">
                        <div className="price-section1" >
                            <ins className="current-price">￥<span>{parseFloat(this.state.goodsDetail.minPrice).toFixed(2)}</span></ins>
                            {
                                this.state.goodsDetail.maxPrice!==this.state.goodsDetail.minPrice 
                                && 
                                <ins className="current-price"> ~ <span>{parseFloat(this.state.goodsDetail.maxPrice).toFixed(2)}</span></ins>
                            }
                        </div>
                        <p className="original-price-box">价格 ：<del className="original-price">￥<span>{parseFloat(this.state.goodsDetail.marketPrice).toFixed(2)}</span></del></p>
                        <div className="address">
                            {
                                this.state.goodsDetail.origin!==''
                                &&
                                <span>{this.state.goodsDetail.origin}品牌 </span>
                            }
                            <span>{this.deliveryCodeChange(this.state.goodsDetail.deliveryCode)}</span>
                            <span>, 预计7个工作日左右到达</span>
                        </div>
                    </div>
                </div>
                <div className="goods-prams">
                    <a className="clearfix instruction">
                        <div className="prams-header"><span>说明：</span></div>
                        <div className="prams-con">
                            <span className="red-mark">商品税费</span>
                            <span className="red-mark">由<span>{this.state.goodsObj.deliveryCity}</span>发货，
                                {
                                    (this.state.goodsObj.post&&this.state.goodsObj.post.postage>0) 
                                    ?
                                    <span>满<span>{this.state.goodsObj.post.limitMoney}</span>包邮</span>
                                    :
                                    <span>该商品免运费</span>
                                } 
                            </span><br/>
                            <span className="red-mark">100%正品保证</span>
                            <span className="red-mark true">假一赔十</span>
                        </div>
                        <div className="tip tip1"></div>
                    </a>
                </div>
                <div className="brand">
                    <h2><span>品牌详情</span></h2>
                    {
                        this.state.goodsDetail.brandStory 
                        ?
                        <div className="brand-der">{this.state.goodsDetail.brandStory}</div>
                        :
                         <div className="brand-der">全球商品一站式采购代发，主营美妆/个护/食品/保健品/日用品等品类,国内领先主流跨境电商平台的日系产品供应者。设有东京、电商平台的日系产品供应者。设有东京、香港、浙江三个中心。东京：采购与仓储 ; 香港：仓储与BD ; 浙江：运营与购与仓储 ; 香港：仓储与BD ;</div>
                    }
        
                    <div className="brand-img">
                        <img src={this.state.goodsDetail.brandLogo}  width="100%" alt=""/>
                    </div>
                    <div className="see-brand">
                        <Link to={`goodsResult?brandId=${this.state.goodsDetail.brandId}&brandName=${this.state.goodsDetail.brandName}`}>查看该品牌所有单品></Link>
                    </div>
                </div>
                <div className="goods-details">
                    <h2>商品图文说明:</h2>
                    {
                        this.state.imgList.map( (data, index, arr)=> {
                            return(
                                <img key={index} data-src={data.imgUrl} width="100%"  height="100%" alt=""/>
                            );
                        })
                    }
                </div>
                <div className="goods-footer">
                    <a className="custom">客服</a>
                    <a className={this.state.hasColltion ? 'collection' : 'collect no-collection'} onClick={this.addCollect}>收藏</a>
                    <a className="add-shop" onClick={this.goShopCar}>加入购物车</a>
                    <a className="buy" onClick={this.goBuy}>立即购买</a>
                </div>

                <div className="sku-box">
                    <div className="box-bg"></div>
                    <div className="sku-main">
                        <div className="sku-header clearfix">
                            <div className="img-box">
                                <img src={this.state.showSku.imgUrl2} alt="" />
                            </div>
                            <div className="details">
                                {
                                    this.state.skuPrice.length>0
                                    ?
                                    <div className="price-section2">
                                        {
                                            this.state.skuPrice.map(( data, index, arr) => {
                                                return (
                                                    <div className="price-item" key={index}>
                                                        <span className="num-price"><span>{data.intervalFirst}</span>-<span>{data.intervalLast}</span>件单价</span><br/>
                                                        <ins className="current-price">￥<span>{parseFloat(data.price).toFixed(2)}</span></ins>
                                                    </div>
                                                );
                                            })
                                        }
                                        
                                    </div>
                                    :
                                    <div className="price-section1">
                                        <ins className="current-price">￥<span>{parseFloat(this.state.showSku.skuPrice).toFixed(2)}</span></ins>
                                    </div>
                                }
                    
                                <p><span>库存：</span><span className="count">{this.state.showSku.count}</span><span>件</span></p>
                                <p>
                                    <span>已选：</span>
                                    <span className="format com-over">{this.state.showSku.skuName}</span>
                                </p>
                            </div>
                        </div>

                        <div className="sku-con">
                            <div className="sku-con-main">
                                <p className="sku-con-header">规格分类:</p>
                                <div className="sku-con-items clearfix">
                                    {
                                        this.state.goodsDetails.map((data, index, arr) => {
                                            return(
                                                 <a key={index}  skuid={data.skuId} skuno={data.skuNo} className={index===0?'active':''}>{data.skuName}</a>
                                            )
                                        })
                                    }
                                   
                                </div>
                            </div>
                            <div className="num-box">
                                <span className="sku-con-header">购买数量:</span>
                                <NumControl
                                    count={this.state.count}
                                    number={this.state.number}
                                    changeVal={this.changeNumber}
                                />
                            </div>
                        </div>

                        <a 
                            className={(this.state.showSku.count<=0||this.state.showSku.status!=='1') ? 'sure-add-buy no-num-buy': 'sure-add-buy'} 
                            onClick={this.goSure}
                        >
                        确认</a>

                    </div>
                </div>

                <div className="instruction-box">
                    <div className="box-bg"></div>
                    <div className={ this.state.showInstBox ?  'instruction-main show' : 'instruction-main'}>
                        <h2>商品说明<a  className="box-close"></a></h2>
                        <div className="instru-item">
                            <dl>
                                <dt><i></i>商品税费</dt>
                                {
                                    this.state.goodsDetail.tax>0
                                    ?
                                    <dd>本产品适用税率为:<span>{(this.state.goodsDetail.tax*100).toFixed(2)}</span>%税费收取规则</dd>
                                    :
                                    <dd>商家承担</dd>
                                }
                            </dl>
                            <dl>
                                <dt><i></i>商品运费</dt>
                                {
                                    this.state.goodsObj.post&&this.state.goodsObj.post.postage>0
                                    ?
                                    <dd>实付满<span>{this.state.goodsObj.post.limitMoney}</span>元免运费，不足金额的订单收取<span>{this.state.goodsObj.post.postage}</span>元运费，税费、优惠券不计入<span>{this.state.goodsObj.post.limitMoney}</span>元金额</dd>
                                    :
                                    <dd>该商品免运费</dd>
                                }
                            </dl>
                            <dl>
                                <dt><i></i>正品保障</dt>
                                <dd>唯妮海购每一件商品都经过严苛的品质把关，100%正品保证</dd>
                            </dl>
                            <dl>
                                <dt><i></i>假一赔十</dt>
                                <dd>杜绝一切假货，让您无忧购物。</dd>
                            </dl>
                        </div>
                    </div>
                </div>
                
                
            </div>
        )
    }
}


