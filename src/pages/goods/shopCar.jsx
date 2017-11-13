import React, { Component } from 'react';
import store from '@/store/index';
import { Link } from 'react-router-dom';
import ComLoading from '@/component/comLoading';
import Toast from '@/component/toast';
import NumControl from '@/component/numControl';
import '@/css/shopCar.css';

export default class ShopCar extends Component {
    constructor(props, context) {
        super();
        this.state = {
            isLoading : true,//loading开关
            shopNum : 0,//购物车数量
            carList : [],//购物车列表
            postpolicy : {},//运费规则对象
            selected : false,//全选开关
            isEditting : false,//是否在编辑状态
            idList : '',//被选中的商品id列表
            selectedGoodsMoney : 0,//选中商品总金额
            selectedBondedMoney : 0,//选中保税区商品总金额
            selectedTaxMoney : 0,//选中商品总税费
            selectedFreightMoney : 0,//选中商品总运费
            noMailMoney : 0,//不包邮商品总金额
            discountAmount : 0,//总优惠金额
            amountMoney : 0,//总金额
            isShow : false,
            msg : ''
        };

        // 隐藏提示框
        this.noShow = () => {
            this.setState({
                isShow : false,
                msg : ''
            });
        };

         // 改变对应商品的数量
        this.changeNumber = (numObj) => {
            var obj = this.state.carList[numObj.indexArr[0]]['shopCarList'][numObj.indexArr[1]];
            obj['num'] = numObj.val;
            this.addCar(obj.goodsId, obj.skuId, numObj.changeVal);
            this.calEveryGoodsPrice();
            this.cal();
        };

        // 排序函数（从大到小）
        this.compare = (property) => {
            return function(a, b) {
                var value1 = a[property],
                    value2 = b[property];
                return value2 - value1;
            }
        },

        // 保留二位小数
        this.toFixed = (num, s) => {
            let times = Math.pow(10, s),
                des = num * times + 0.5;
            des = parseInt(des, 10) / times;
            return des.toFixed(2);
        };

        // 显示税费
        this.makeShowTax = (index1, index2) => {
            this.state.carList[index1]['shopCarList'][index2]['showTax'] = !this.state.carList[index1]['shopCarList'][index2]['showTax'];
        };

        // 编辑
        this.edit = () => {
            this.setState({
                isEditting : !this.state.isEditting
            });
        },

        // 单个选择
        this.choose = (index1, index2) => {
            let carList = this.state.carList;
            carList[index1]['shopCarList'][index2]['selected'] = !carList[index1]['shopCarList'][index2]['selected'];
            // console.log(carList[index1]['shopCarList'][index2]['selected']);
            this.setState({
                carList         
            }, () => {
                console.log(this.state.carList[index1]['shopCarList'][index2]['selected']);
                this.checkAllChoose();
            });
        };

        // 全选
        this.chooseAll = () => {
            var flag = false,
                idList = '';
            this.setState({
                selected : !this.state.selected,
            }, () => {
                if ( this.state.selected ) {
                    flag = true;
                }
                let carList = this.state.carList;
                carList.forEach(( item, index, arr) => {
                    item.shopCarList.forEach(( item, index, arr) => {
                        if ( item.isStatus ) {
                            item.selected = flag;
                            if ( flag ) {
                                idList += item.cartId + ',';
                            }
                        }
                    });
                });
                console.log(idList);
                this.setState({
                    carList,
                    idList
                }, () => {
                    this.cal();
                });
            });
        };

        // 判断是否全选
        this.checkAllChoose = () => {
            var flag = true,
                idList = '';
            this.setState({
                idList : ''
            }, () => {
                this.state.carList.forEach( (item, index, arr) => {
                    item.shopCarList.forEach( ( item, index, arr) => {
                        if ( item.isStatus ) {
                            if ( item.selected ) {
                                idList += item.cartId + ',';
                            } else {
                                flag = false;
                            }
                        }
                    });
                });

                this.setState({
                    idList,
                    selected : flag
                }, () => {
                    this.cal();
                });
            });
        },

        // 计算每项金额
        this.cal = () => {
            // 判断有活动的商品总额是否满足活动
            this.checkIsMeet();
            // 计算有活动的商品总金额（按活动分）
            this.calEveryActivityGoodsMoney();
            // 计算每个商品的税费
            this.calEveryTaxMoney();
            // 计算商品总金额
            this.calGoodsMoney();
            // 计算总税费
            this.calTaxMoney();
            // 计算总运费
            this.calFreightMoney();
            // 计算应付总额
            this.calAmountMoney();
        },

        // 计算每个商品的显示价格（有区间价）
        this.calEveryGoodsPrice = () => {
            let carList = this.state.carList;
            carList.forEach( ( item, index, arr) => {
                item.shopCarList.forEach( ( item, index, arr) => {
                    // 如果该sku有区间价格则取对应区间价
                    if ( item.priceList.length>0 ) {
                        var num = item.num;
                        for ( var i = 0, len = item.priceList.length; i < len; i++ ) {
                            if (  num >= item.priceList[i]['intervalFirst'] && num <= item.priceList[i]['intervalLast'] ) {
                                item.skuPrice = parseFloat(item.priceList[i]['price']);
                                break;
                            }
                        }
                    }
                });
            });
            this.setState({
                carList
            });
        },

        // 判断有活动的商品金额是否已经满足
        this.checkIsMeet = () => {
            var goodsMoney = 0,
                goodsNum = 0,
                goodsList = [],
                discountAmount = 0;
            let carList = this.state.carList;
            carList.forEach( ( item, index, arr) => {
                var item1 = item;
                if ( item.couponPolicyId>0 ) {
                    goodsMoney = goodsNum = 0;
                    goodsList = [];
                    item.shopCarList.forEach(function( item, index, arr) {
                        if ( item.selected ) {
                            var money = item.skuPrice * item.num;
                            goodsMoney += money;
                            goodsNum += item.num;
                            goodsList.push({
                                money : money,
                                skuPrice : item.skuPrice,
                                num : parseInt(item.num)
                            });
                        }
                    });

                    /*type1 : 满多少元减多少元
                    type2 : 满多少件减多少元
                    type3 : 多少件多少元(2件99，取该活动被选中商品中价格最高(单价)的2件参加活动，其他的不参加)*/
                    item.amount1 = item.amount - goodsMoney;
                    item.goodsNum = item.amount - goodsNum;
                    if ( (item.couponPolicyType === 1 && item.amount1<=0) || ( item.couponPolicyType === 2 && item.goodsNum <=0 ) ) {
                        item.isMeet = true;
                        discountAmount += item.discount;
                    } else if ( item.couponPolicyType === 3 && item.goodsNum <= 0 ) {
                        item.isMeet = true;
                        goodsList = goodsList.sort( this.compare('skuPrice') );
                        var allNum = 0;
                        item1.expensiveMoeny = 0;
                        goodsList.forEach( ( item, index, arr ) => {
                            if ( allNum < item1.amount ) {
                                for ( var i = 1; i <= item.num; i++ ) {
                                    allNum += 1;
                                    if ( allNum <= item1.amount ) {
                                        item1.expensiveMoeny += item.skuPrice;
                                    }
                                }
                            }
                        });

                        // 判断X件商品总金额是非小于XX元
                        if ( item.expensiveMoeny < item.discount ) {
                            item.expensiveMoeny = item.discount;
                        }
                        discountAmount += (item.expensiveMoeny - item.discount);
                    }
                    else {
                        item.isMeet = false;
                    }
                }
            });

            this.setState({
                carList,
                discountAmount
            });
        };

        // 计算每个活动下的商品总额
        this.calEveryActivityGoodsMoney = () => {
            var item1 = null,
                carList = this.state.carList;
            carList.forEach( ( item, index, arr) => {
                if ( item.isMeet ) {
                    var item1 = item;
                    item1.activityMoney = 0;
                    item.shopCarList.forEach( ( item, index, arr) => {
                        if ( item.selected ) {
                            item1.activityMoney += item.skuPrice * item.num;
                        }
                    });
                }
            });
            this.setState({
                carList
            });
        };

        // 计算商品税费(根据运营规则，只计算保税区且不是包邮包税的商品)
        this.calEveryTaxMoney = () => {
            var item1 = null,
                carList = this.state.carList;
            carList.forEach( ( item, index, arr) => {
                item1 = item;
                item.shopCarList.forEach( ( item, index, arr) => {
                    // 正常状态并且只计算保税区且不是包邮包税的商品
                    if ( item.saleType == 0 && item.deliveryCode === '1' ) {
                        item.goodsTax = item.skuPrice * item.num * item.tax;
                        if ( item1.isMeet ) {
                            if ( item1.couponPolicyType === 3 ) {
                                item.goodsTax *= (1 - ( item1.expensiveMoeny - item1.discount )/item1.activityMoney);
                            } else {
                                item.goodsTax *= (1 - item1.discount/item1.activityMoney);
                            }
                        }
                        item.goodsTax = this.toFixed(item.goodsTax, 2);
                    } else {
                        item.goodsTax = 0.00.toFixed(2);
                    }
                });
            });
            this.setState({
                carList
            });
        };

        // 计算商品总税费
        this.calTaxMoney = () => {
            let selectedTaxMoney = 0;
            this.state.carList.forEach( ( item, index, arr) => {
                item.shopCarList.forEach( ( item, index, arr) => {
                    if ( item.selected ) {
                        selectedTaxMoney += parseFloat(item.goodsTax);
                    }
                });
            });
            this.setState({
                selectedTaxMoney
            });
        };

        // 计算商品总运费(根据运营规则，只计算保税区且不是包邮包税的商品)
        this.calFreightMoney = () => {
            let carList = this.state.carList,
                noMailMoney = 0;
            this.state.carList.forEach( ( item, index, arr) => {
                item.shopCarList.forEach( ( item, index, arr) => {
                    if ( item.selected && item.deliveryCode === '1' && item.saleType == 0 ) {
                        noMailMoney += item.skuPrice * item.num;
                    }
                });
            });
            this.setState({
                noMailMoney
            }, () => {
                this.setState({
                    selectedFreightMoney :( this.state.noMailMoney == 0 || this.state.noMailMoney - this.state.discountAmount >= this.state.postpolicy.limitMoney ) ? 0 : this.state.postpolicy.postage
                });
            });
        },

        // 计算商品总金额
        this.calGoodsMoney = () => {
            let selectedGoodsMoney = 0,
                selectedBondedMoney = 0;
            this.state.carList.forEach( ( item, index, arr) => {
                item.shopCarList.forEach( ( item, index, arr) => {
                    if ( item.selected ) {
                        selectedGoodsMoney += item.skuPrice * item.num;
                        if ( item.deliveryCode === '1' ) {
                            selectedBondedMoney += item.skuPrice * item.num;
                        }
                    }
                });
            });
            this.setState({
                selectedGoodsMoney,
                selectedBondedMoney                               
            });
        };

        // 计算应付款
        this.calAmountMoney = () => {
            // 如何解决多个加数是setState异步计算出来的结果
            setTimeout( () => {
                this.setState({
                    amountMoney : this.state.selectedGoodsMoney + this.state.selectedTaxMoney + this.state.selectedFreightMoney - this.state.discountAmount
                });
            }, 0);
        };

        // 删除商品
        this.deleteCar = (id) => {
            console.log(id);
            var oThis = this;
            if ( id ) {
                this.setState({
                    idList : id
                });
            }
            if ( this.state.idList==='' ) {
                this.setState({
                    isShow : true,
                    msg : '请选择您要删除的商品哦'
                });
                return;
            }

            window.axios.post(window.API.delShopCar, window.commonMethods.param({id:this.state.idList})).then( ( data ) => {
                var data = data.data;
                if (data.success) {
                    window.location.reload();
                } else {
                    this.setState({
                        isShow : true,
                        msg : '删除失败，请稍后再试'
                    });
                }
            });
        };

        // 加入购物车
        this.addCar = (goodsId, skuId, num) => {
            window.axios.post(window.API.addShopCar, window.commonMethods.param({
                goodsId: goodsId,
                skuId: skuId,
                num: num
            })).then( ( data ) => {});
        };

        // 获取购物车数据
        this.getShopCar = () => {
            window.axios.post(window.API.shopCarIndexMobile).then( ( data ) => {
                var data1 = data.data;
                if(data1.msg) {
                    this.setState({
                        isLoading : false
                    });
                    if ( data1.carList ) {
                        console.log(data1.carList);
                        data1.carList.forEach(function( item, index, arr) {
                            // 如果有活动才手动添加对应属性
                            if ( item.couponPolicyId > 0 ) {
                                item.isMeet = false;
                                item.amount1 = item.amount;
                                item.goodsNum = item.amount;
                                item.activityMoney = 0.00;
                                item.expensiveMoeny = 0.00;
                            }

                            var index1 = index;
                            for ( var x in item ) {
                                item.shopCarList.forEach(function( item, index, arr) {
                                    item.selected = false;
                                    item.goodsTax = 0.00;
                                    item.showPrice = 0.00;
                                    item.showTax = false;
                                    item.num = parseInt(item.num);
                                    item.skuPrice = parseFloat(item.skuPrice);
                                    item.tax = parseFloat(item.tax);
                                    if ( item.isShow===1 && item.status===1 && item.realStock>0 ) {
                                        item.isStatus  = true;
                                    }
                                });
                            }
                        });
                        this.setState({
                            carList : data1.carList
                        }, () => {
                            this.calEveryGoodsPrice();
                            this.calEveryTaxMoney();
                        });
                    }
                    this.setState({
                        postpolicy : data1.postpolicy
                    });
                }
            });
        },

        // 获取购物车数量(历史遗留原因不能直接调用查询购物车数量那个接口)
        this.carCount = () => {
            window.axios.post(window.API.shopCarIndexMobile).then( ( data ) => {
                var data = data.data;
                if(data.msg) {
                    if ( data.carList ) {
                        this.setState({
                            shopNum : data.carList.length
                        });
                    } else {
                        this.setState({
                            shopNum : 0
                        });
                    }
                }
            });
        };

        // 去支付
        this.goPay = () => {
            var skuNos = '',
                num = '';
            this.state.carList.forEach(function( item, index, arr) {
                item.shopCarList.forEach(function( item, index, arr) {
                    if ( item.selected ) {
                        skuNos += item.skuId + ',';
                        num += item.num + ',';
                    }
                });
            });
            if ( num==='' ) {
                this.setState({
                    isShow : true,
                    msg : '请选择商品'
                });
                return;
            }
            if ( this.selectedBondedMoney > 2000 ) {
                this.setState({
                    isShow : true,
                    msg : '保税区仓库多件商品的总价不得超过2000元，请您分多次购买!'
                });
                return;
            }

            window.commonMethods.setCookie('PALACE_ORDER_SKUNO', skuNos.substr(0, skuNos.length-1));
            window.commonMethods.setCookie('PALACE_ORDER_NUMS', num.substr(0, num.length-1));
            window.commonMethods.setCookie('PALACE_ORDER_COUPONID', "");
            window.commonMethods.setCookie('PALACE_ORDER_ADDRESS', "");
            this.props.history.push('surePay');
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
            }
        };
        
    }

    componentWillMount() {
        this.getShopCar();
    }

    render() {
        return (
            <div className="shop-body">
                <Toast
                    isShow={this.state.isShow}
                    msg={this.state.msg}
                    noShow={this.noShow}
                ></Toast>
                <div className="header clearfix">
                    {
                        store.getState().reducer.carCount &&
                        <a className="edit" onClick={this.edit}>
                            {
                                !this.state.isEditting ? <span>编辑</span> : <span>完成</span>
                            }
                        </a>
                    }
                    <h1>购物车</h1>
                    <a href="javascript:history.back()" className="header-back"></a>
                </div>
                <div className="shop-box">
                    <div className="goods-item">
                        {
                            this.state.carList.length > 0 &&  this.state.carList.map( (dto, index1, arr) => {
                                return(
                                    <div key={index1}>
                                    {
                                        dto.couponPolicyId
                                        &&
                                        <a href='"http://www.weinihaigou.com/m-html/index/flash-sale.html?relevantId=" + dto.couponPolicyId + "&type=2"' className="activity">
                                            <span className="activity-header">{dto.couponPolicyName}</span>
                                            {
                                                !dto.isMeet ? 
                                                <span>
                                                    {
                                                        dto.couponPolicyType === 1 
                                                        ? 
                                                        <span><span>差<span v-html="dto.amount1">{dto.amount1}</span>元</span></span>
                                                        :
                                                        <span>
                                                            <span>差<span>{dto.goodsNum}</span>件</span>
                                                            <span>立享【{dto.couponPolicyName}】</span>
                                                        </span>
                                                    }
                                                </span>
                                                :
                                                <span>
                                                    已满足【<span>{dto.couponPolicyName}</span>】
                                                </span>
                                            }
                                        </a>
                                    }

                                    {
                                        dto.shopCarList.map( ( c, index2 ) => {
                                            return (
                                                <div className="goods-box" key={index2}>
                                                    <div className="goods-show">
                                                        {
                                                            (c.isShow && c.status && c.realStock > 0)
                                                            ?
                                                            <a onClick={this.choose.bind(this, index1, index2)} 
                                                                className={ c.selected ? "choose checkbox" : "checkbox" }>
                                                                <input type="checkbox" />
                                                                <i></i>
                                                            </a>
                                                            :
                                                            <a className="checkbox1">
                                                                <input type="checkbox" />
                                                                <i></i>
                                                            </a>
                                                        }

                                                        <Link to={`goodsDetails?goodsNo=${c.goodsNo}`}  className="goods-img">
                                                            <img src={c.imgUrl} alt="" />
                                                            {
                                                                c.isShow===0 || c.status!==1
                                                                ?
                                                                <div className={c.isShow===0||c.status!==1? 'no-goods opacity' : 'no-goods'}>已下架</div>
                                                                :
                                                                <div>
                                                                    {
                                                                        c.realStock <= 0
                                                                        ?
                                                                        <div className={ c.realStock <=0 ? 'no-goods opacity' : 'opacity'}>已抢光</div>
                                                                        :
                                                                        ''
                                                                    }
                                                                </div>
                                                            }
                                                        </Link>
                                                        <div className="goods-link">
                                                            <Link to={`goodsDetails?goodsNo=${c.goodsNo}`} className="goods-link-main com-over">{c.goodsName}</Link>
                                                            <p className="norms-tax"><span>规格:</span><span className="com-over norms">{c.skuName}</span></p>
                                                             <p className="norms-tax">
                                                                <span className="com-over norms">{this.deliveryCodeChange(c.deliveryCode)}</span>
                                                            </p>

                                                            <p className="price">¥<span className="every-price">{c.skuPrice.toFixed(2)}</span></p>
                                                        </div>

                                                        {
                                                            (c.isShow===1 && c.status===1 && c.realStock > 0)
                                                            ?
                                                            <div className="num-box">
                                                                {
                                                                    this.state.isEditting
                                                                    ?
                                                                    <div className="delete-box" >
                                                                        <a className="delete" onClick={this.deleteCar.bind(this, c.cartId+'')}>删除</a>
                                                                    </div>
                                                                    :

                                                                    <NumControl
                                                                        count={c.realStock}
                                                                        number={c.num}
                                                                        indexArr={[index1,index2]}
                                                                        changeVal={this.changeNumber}
                                                                    >
                                                                    </NumControl>
                                                                }
                                                                <a className="tax down"><span>税费：</span><span>¥<span className="each-tax">{c.goodsTax}</span></span><i></i></a>
                                                            </div>
                                                            :
                                                            <div className="num-box" v-else>
                                                                <div className="">
                                                                    <a className="delete" onClick={this.deleteCar.bind(this, c.cartId)}>删除</a>
                                                                </div>
                                                            </div>
                                                        }
                                                        
                                                    </div>
                                                    {
                                                        c.showTax
                                                        && 
                                                        <p className="tax-show">税率<span>{(c.tax*100).toFixed(2)}</span>%，结算税费以提交订单时应付总额明细为准</p>
                                                        
                                                    }
                                            </div>
                                            )
                                        })
                                    }
                                </div>
                                )
                            })
                        }
                    </div>
                </div>

                <ComLoading isLoading={this.state.isLoading}></ComLoading>

                {
                    (this.state.noMailMoney>0&&this.state.noMailMoney<this.state.postpolicy.limitMoney)
                    &&
                    <p className="post-tips-box">不包邮商品共计￥<span>{this.state.noMailMoney.toFixed(2)}</span>元，再购<span>{(parseFloat(this.state.postpolicy.limitMoney) - parseFloat(this.state.noMailMoney)).toFixed(2)}</span>元免运费</p>
                }

                {
                    (this.state.noMailMoney>=this.state.postpolicy.limitMoney)
                    &&
                    <p className="post-tips-box">不包邮商品共计￥<span>{this.state.noMailMoney.toFixed(2)}</span>元，已减免运费</p>
                }

                {
                    (this.state.carList.length > 0 && !this.state.isEditting)
                    &&
                    <div className="settle-accounts">
                        <div className="makes-box">
                            <div className="all-choose-box">
                                <a className={this.state.selected ? 'checkbox com-choose choose' : 'checkbox com-choose'}  onClick={this.chooseAll}>
                                    <input type="checkbox"/>
                                    <i></i>全选
                                </a>
                            </div>
                            <div className="all-money">
                                <p>
                                    <span>总金额<span className="money-tips"></span>：</span>
                                    <span className="all-money-num">￥</span><span className="all-money-num total-money">{this.state.amountMoney.toFixed(2)}</span>
                                </p>
                                <p className="money-tips">
                                    <span>运费:￥</span>
                                    <span className="total-post">{this.state.selectedFreightMoney.toFixed(2)}</span>
                                </p>
                                <p className="money-tips">
                                    <span>预计税费:<span className="total-tax">{this.state.selectedTaxMoney.toFixed(2)}</span></span>
                                </p>
                            </div>
                        </div>
                        <a className="make-btn" onClick={this.goPay}>去结算</a>
                    </div>
                }

                {
                    store.getState().reducer.carCount > 0 && this.state.isEditting
                    &&
                    <div className="settle-accounts">
                        <div className="makes-box">
                            <div className="all-choose-box">
                                <a className={ this.state.selected ? 'checkbox com-choose choose' : 'checkbox com-choose'}  onClick={this.chooseAll}>
                                    <input type="checkbox"/>
                                    <i></i>全选
                                </a>
                            </div>
                        </div>
                        <a className="make-btn" onClick={this.deleteCar}>删除</a>
                    </div>   
                }

                {
                    store.getState().reducer.carCount===0
                    &&
                    <div className="no-shop">
                        <img src="../m-images/no-shop.png" />
                        <Link to="/">去逛逛吧 !</Link>
                    </div>
                }
            </div>
        )
    }
}


