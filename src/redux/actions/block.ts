import * as constants from '../actionTypes'
import { BlockItem, BlockList } from '../states/block'
import { showLoading, hideLoading } from './appAction'

import * as dataAPI from '../../utils/dataAPI'

interface GET_BLOCK_ITEM {
  type: constants.GET_BLOCK_ITEM
  data: BlockItem
}

interface GET_BLOCK_LIST {
  type: constants.GET_BLOCK_LIST
  data: BlockList
}
interface GET_TOP_BLOCKS {
  type: constants.GET_TOP_BLOCKS
  data: Array<BlockItem>
}

// interface GET_LATEST_BLOCK {
//   type: constants.GET_LATEST_BLOCK;
//   data: BlockItem;
// }

interface APPEND_LATEST_BLOCK {
  type: constants.APPEND_LATEST_BLOCK
  data: BlockItem
}

export type BlockAction =
  | GET_BLOCK_ITEM
  | GET_BLOCK_LIST
  | GET_TOP_BLOCKS
  | APPEND_LATEST_BLOCK

export function topBlocks() {
  return (dispatch: any) => {
    // dispatch(showLoading())
    return dataAPI
      .topBlocks()
      .then((data: Array<BlockItem>) => {
        // dispatch(hideLoading())
        dispatch({
          type: constants.GET_TOP_BLOCKS,
          data: data
        })
        // if(data && data.length>0){
        //   dispatch({
        //     type: constants.GET_LATEST_BLOCK,
        //     data: data[0]
        //   });
        // }
      })
      .catch((error: any) => {
        // dispatch(hideLoading())
        dispatch({
          type: constants.OPERATION_FAIL,
          error: error
        })
      })
  }
}

export function getBlock(key: string) {
  return (dispatch: any) => {
    dispatch(showLoading())
    return dataAPI
      .getBlock(key)
      .then((data: BlockItem) => {
        dispatch(hideLoading())
        dispatch({
          type: constants.GET_BLOCK_ITEM,
          data: data
        })
      })
      .catch((error: any) => {
        dispatch(hideLoading())
        dispatch({
          type: constants.OPERATION_FAIL,
          error: error
        })
      })
  }
}

export function getBlockList(pageNum: number, pageSize: number) {
  return (dispatch: any) => {
    // dispatch(showLoading())
    return dataAPI
      .getBlockList(pageNum, pageSize)
      .then((data: any) => {
        // dispatch(hideLoading())
        dispatch({
          type: constants.GET_BLOCK_LIST,
          data: {
            pageNum: pageNum,
            pageSize: pageSize,
            list: data.blocks,
            total: data.count
          }
        })
      })
      .catch((error: any) => {
        // dispatch(hideLoading())
        dispatch({
          type: constants.OPERATION_FAIL,
          error: error
        })
      })
  }
}

export function updateNextBlock(blockId: any) {
  return (dispatch: any) => {
    // dispatch(showLoading())
    var update = (blockId: any) =>
      dataAPI
        .getBlock(blockId)
        .then((data: any) => {
          console.log(data)
          // dispatch(hideLoading())
          if (data) {
            // dispatch({
            //   type: constants.GET_LATEST_BLOCK,
            //   data: data
            // });

            dispatch({
              type: constants.APPEND_LATEST_BLOCK,
              data: data
            })
            var transactions = data.body.transactions
            transactions.forEach((t: string) => {
              dataAPI.getTransaction(t).then((d: any) => {
                dispatch({
                  type: constants.APPEND_LATEST_TRANSACTION,
                  data: d
                })
              })
            })
          }
        })
        .catch((error: any) => {
          // dispatch(hideLoading())
          dispatch({
            type: constants.OPERATION_FAIL,
            error: error
          })
        })
    if (!blockId) {
      return dataAPI.getBlockNumber().then((d: any) => {
        return update(d)
      })
    } else {
      return update(blockId)
    }
  }
}
