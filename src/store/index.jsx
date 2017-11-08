import {createStore, combineReducers} from 'redux';
import * as reducer from '@/store/reducer';

export default createStore(
    combineReducers(reducer)
);
