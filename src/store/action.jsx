// 这里写组件改变redux里面的状态的方法名以及参数，需要调用下面这些方法的要在对应的组件中导入

export function changeIsLogin(flag) {
    return {
        type : 'changeIsLogin',
        flag
    }
}

// 设置购物车数量
export function setCarCount(carCount) {
    return {
        type : 'setCarCount',
        carCount
    }
}







