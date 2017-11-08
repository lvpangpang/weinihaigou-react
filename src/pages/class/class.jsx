import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from '@/store/index';
import ComHeader from '@/component/comHeader';
import ComFooter from '@/component/comFooter';
import ComLoading from '@/component/comLoading';
import lazyImg from '@/js/imgLazy';
import '@/css/class.css';

export default class Class extends Component {

    constructor() {
        super();

        this.state = {
            oneClassList : [],//一级分类数据
            twoClassList : [],//二级分类数据
            categoryId : '',//一级页面ID
            isLoading : true,
            noNum : false,
            stagingStation : {}
        };

        this.getOneClassList = () => {
            window.axios.post(window.API.getCategory)
            .then( (data) => {
                var data1 = data.data;
                if( data1.message ) {
                    this.setState({
                        oneClassList : data1.classList,
                        categoryId : data1.classList[0].classid
                    });
                    this.getTwoClassList(data1.classList[0].classid);
                }
            });
        };

        this.getTwoClassList = (categoryId) => {
            this.setState({
                twoClassList : [],
                isLoading : true
            });
            window.axios.post(window.API.getCategoryTwo,  window.commonMethods.param({categoryId : categoryId}) )
            .then((data) => {
                var data1 = data.data;
                if( data1.message ) {
                    this.setState({
                        categoryId : categoryId,
                        twoClassList : data1.classTwoList,
                        stagingStation : data1.classTwoList,
                        isLoading : false
                    });
                    this.isLoading = false;
                    new lazyImg();
                }
            });
        }

    }

    componentWillMount() {
        this.getOneClassList();
    }

    render() {
        return (
            <div>

                <ComHeader
                    showHeader='true'
                    carCount={store.getState().reducer.carCount}
                />

                <div className="classify-main clearfix">
                    <div className="classify-tab">
                        <ul>
                            {
                                this.state.oneClassList.map( (data, index) => {
                                    return (
                                        <li
                                            key={index}
                                            className={ data.classid === this.state.categoryId ? 'tab-item active' : 'tab-item' }
                                            id={data.classid}
                                            onClick={this.getTwoClassList.bind(this, data.classid)}
                                        >
                                            {data.classdesc}
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    </div>
                    <div className="classify-con">

                        <ComLoading
                            isLoading={this.state.isLoading}
                        />

                        <div className="con-slide" >
                            {
                                this.state.twoClassList.map( (data, index) => {
                                    return(
                                        <div className="classify-items" key={index} >
                                            <h2>{data.name}</h2>
                                            <ul className="clearfix">
                                                {
                                                    data.threeCategoryList.map((goods, index1) => {
                                                        return (
                                                            <li key={index1}>
                                                                <Link
                                                                    to={`goodsResult?threeCategoryId=${goods.id}&twoCategoryName=${goods.threeName}`}
                                                                    className="link-items"
                                                                    id={goods.id}
                                                                >
                                                                    <img data-src={goods.imgUrl} alt="" />
                                                                    <p>{goods.threeName}</p>
                                                                </Link>
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>

                <ComFooter
                    showFooter='true'
                    activeClass="activeClass"
                />

            </div>
        )
    }
}

