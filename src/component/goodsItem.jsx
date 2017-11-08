import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '@/css/goodsItem.css';

export default class GoodsItem extends Component {
    constructor() {
        super();
        this.getNowTime = (nowTime)=> {
            return new Date(nowTime).getTime();
        };
    }

    render() {
        const goodsItem = this.props.goodsItem;
        return (
           <li>
                <Link
                    to={`goodsDetails?goodsNo=${goodsItem.goodsNo}`}
                >
                    {
                        goodsItem.realStock<=0 && <div className="no-goods">已抢光</div>
                    }
                    <div className="goods-img">
                        <img data-src={goodsItem.imgUrl} width="100%" alt="" />
                    </div>
                    <p className="goods-der">
                        {
                            goodsItem.couponPolicyName && this.getNowTime(goodsItem.nowTime) > this.getNowTime(goodsItem.startTime) && this.getNowTime(goodsItem.nowTime) < this.getNowTime(goodsItem.endTime) && <span className="activity">{goodsItem.couponPolicyName}</span>
                        }
                        <span>{goodsItem.goodsName}</span>
                    </p>
                    <div className="goods-price">
                        <ins className="current-price">¥<span>{parseFloat(goodsItem.mallPrice).toFixed(2)}</span></ins>
                        <del className="original-price">¥<span>{parseFloat(goodsItem.marketPrice).toFixed(2)}</span></del>
                    </div>
                </Link>
            </li>
        )
    }
}

