import React, { useState, useEffect } from 'react';
import { Avatar, List, Checkbox } from 'antd'
import { CheckboxChangeEvent } from 'antd/es/checkbox'
import styles from './tableList.less'
import { PaginationConfig } from 'antd/es/pagination'
import { CommonUtils } from '@/utils/utils'

export interface baseColumnConfigType {
  title: string;
  key: string | number;
  dataIndex?: string;
  width?: number;
  descIndex?: string;
}

export interface columnConfigType<T> extends baseColumnConfigType {
  render?: (record: T) => React.ReactNode;
  avatar?: {
    imgIndex: string;
    titleIndex: string;
    descIndex: string;
    descPrefix?: string;
  }
}

export interface rowConfigType<T, P> {
  title?: (record: T) => React.ReactNode;
  contextColumn?: Array<columnConfigType<T>>
  goodsColumn: Array<columnConfigType<P>>
  footer?: (record: T) => React.ReactNode;
}

export interface rowSelection<T> {
  getCheckboxProps?: (record: T) => void;
  selectedRowKeys?: string[];
  onChange?: (selectedRowKeys: Array<string>, selectedRows: Array<T>) => void;
  selection: boolean;
}

export interface TableListPropsType<T, P> {
  rowConfig: rowConfigType<T, P>;
  dataSource: Array<T>;
  pagination: PaginationConfig | false;
  rowSelection: rowSelection<T>,
  rowKey: (record: T) => string;
}


function TableList<T extends { goods: Array<P> }, P>(props: TableListPropsType<T, P>) {

  const {
    rowConfig: {
      contextColumn,
      goodsColumn,
      title,
      footer
    },
    dataSource,
    pagination,
    rowSelection,
    rowKey
  } = props

  const [selectedRowsKeys, setSelectedRowsKeys] = useState<string[]>([])
  const [selectedRows, setSelectedRows] = useState<T[]>([])
  const [indeterminate, setIndeterminate] = useState<boolean>(false)
  const [checkAll, setCheckAll] = useState<boolean>(false)

  useEffect(() => {
    if (rowSelection.selectedRowKeys) {
      setSelectedRowsKeys(rowSelection.selectedRowKeys)
      contrastChecked(rowSelection.selectedRowKeys)
    }
  }, [rowSelection.selectedRowKeys])

  useEffect(() => {
    if (rowSelection.selectedRowKeys) {
      contrastChecked(rowSelection.selectedRowKeys)
    }
  }, [dataSource])

  const contextRender = function (data: T) {
    if (contextColumn) {
      return contextColumn.map(item => {
        const style = item.width ? { width: item.width + 'px' } : undefined
        if (item.render) {
          return <div className={styles.contextItem} style={style}>{item.render(data)}</div>
        }
        if (item.descIndex) {
          return (
            <div key={item.key} className={styles.contextItem} style={style}>
              <div>
                {data[item.dataIndex || item.key]}
              </div>
              <div>
                {data[item.descIndex]}
              </div>
            </div>
          )
        }
        return <div key={item.key} className={styles.contextItem}>{data[item.dataIndex || item.key]}</div>
      })
    }
    return null
  }

  const goodsRender = function (data: P) {
    return goodsColumn.map(item => {
      const style = item.width ? { width: item.width + 'px' } : undefined
      if (item.render) {
        return <div className={styles.goodsItem} style={style}>{item.render(data)}</div>;
      }
      if (item.descIndex) {
        return (
          <div key={item.key} className={styles.goodsItem} style={style}>
            <div>
              {data[item.dataIndex || item.key]}
            </div>
            <div>
              {data[item.descIndex]}
            </div>
          </div>
        )
      }
      if (item.avatar) {
        return (
          <div className={styles.goodsItem} style={style}>
            <List.Item.Meta
              avatar={
                <Avatar shape="square" size={74} src={data[item.avatar.imgIndex]} />
              }
              title={data[item.avatar.titleIndex]}
              description={(item.avatar.descPrefix ? item.avatar.descPrefix : '') + data[item.avatar.descIndex]}
            />
          </div>
        )
      }
      return <div key={item.key} className={styles.goodsItem} style={style}>{data[item.dataIndex || item.key]}</div>
    })
  }
  let ListPaginationProps: PaginationConfig | false;
  if (pagination === false) {
    ListPaginationProps = false
  } else {
    ListPaginationProps = {
      showTotal: (total) => {
        if (pagination === false) {
          return undefined
        } else {
          let page: string;
          if (pagination.pageSize) {
            page = '第 ' + pagination.current + '/' + Math.ceil(total / pagination.pageSize) + ' 页';
          } else {
            page = ''
          }
          return <span>共 {total} 条记录 {page}</span>
        }
      },
      showQuickJumper: true,
      showSizeChanger: true,
      pageSizeOptions: ['50', '100', '200', '300', '500'],
      ...pagination,
    }
  }

  function handleCheckboxChange(e: CheckboxChangeEvent, key: string, rows: any) {
    let selectedKeysArr = Object.assign([], selectedRowsKeys)
    let selectedRowsArr = Object.assign([], selectedRows);
    if (e.target.checked) {
      selectedKeysArr.push(key)
      selectedRowsArr.push(rows)
      if (rowSelection.onChange) {
        rowSelection.onChange(selectedKeysArr, selectedRowsArr)
      } else {
        setSelectedRowsKeys(selectedKeysArr)
        setSelectedRows(selectedRowsArr)
      }
      if (!rowSelection.selectedRowKeys) {
        contrastChecked(selectedKeysArr)
      }
    } else {
      if (rowSelection.onChange) {
        rowSelection.onChange(selectedKeysArr.filter(item => item !== key), selectedRowsArr.filter(item => !CommonUtils.objEqual(item, rows)))
      } else {
        setSelectedRowsKeys(selectedKeysArr.filter(item => item !== key))
        setSelectedRows(selectedRowsArr.filter(item => !CommonUtils.objEqual(item, rows)))
      }
      if (!rowSelection.selectedRowKeys) {
        contrastChecked(selectedKeysArr.filter(item => item !== key))
      }
    }
  }

  function handleAllCheckboxChange(e: CheckboxChangeEvent) {
    const selectedRowKeys = rowSelection.selectedRowKeys;
    const selectedKeysArr = dataSource.map(item => rowKey(item))
    if (e.target.checked) {
      if (rowSelection.onChange) {
        if (selectedRowKeys) {
          rowSelection.onChange(CommonUtils.distinct(selectedKeysArr.concat(selectedRowKeys)), dataSource)
        } else {
          rowSelection.onChange(selectedKeysArr, dataSource)
        }
      } else {
        setSelectedRowsKeys(selectedKeysArr)
        setSelectedRows(dataSource)
      }
      setIndeterminate(false)
      setCheckAll(true)
    } else {
      if (rowSelection.onChange) {
        if (selectedRowKeys) {
          rowSelection.onChange(selectedRowKeys.filter(item => !selectedKeysArr.includes(item)), [])
        } else {
          rowSelection.onChange([], [])
        }
      } else {
        setSelectedRowsKeys([])
        setSelectedRows([])
      }
      setIndeterminate(false)
      setCheckAll(false)
    }
  }

  function contrastChecked(selectedRowsKeys: Array<string>) {
    const rowsKey = dataSource.map(item => rowKey(item));
    if (selectedRowsKeys.length !== 0) {
      if (rowsKey.length > selectedRowsKeys.length) {
        setIndeterminate(true)
        setCheckAll(false)
      } else if (JSON.stringify(rowsKey) === JSON.stringify(selectedRowsKeys)) {
        setIndeterminate(false)
        setCheckAll(true)
      } else {
        if (rowsKey.every(item => selectedRowsKeys.includes(item))) {
          setIndeterminate(false)
          setCheckAll(true)
        } else if (rowsKey.every(item => !selectedRowsKeys.includes(item))) {
          setIndeterminate(false)
          setCheckAll(false)
        } else {
          setIndeterminate(true)
          setCheckAll(false)
        }
      }
    } else {
      setIndeterminate(false)
      setCheckAll(false)
    }
  }

  function titleRender(columns: Array<baseColumnConfigType>) {
    return columns.map(item => {
      if (item.width) {
        return <div style={{ width: item.width + 'px' }}>{item.title}</div>
      }
      return <div >{item.title}</div>
    })
  }


  function calcWidth(columns: Array<baseColumnConfigType>) {
    let areaStyle = {};

    if (!contextColumn) {
      areaStyle = { width: '100%' }
    } else {
      if (columns.every(item => item.width)) {
        areaStyle = { width: columns.map(item => item.width).reduce((preValue, current) => (preValue + current), 0) + 'px' }
      } else {
        areaStyle = { width: columns.length + 'px' }
      }
    }

    return areaStyle
  }



  return (
    <div className={styles.listWrap}>
      <div className={styles.listHeader}>
        {rowSelection.selection ? (
          <Checkbox indeterminate={indeterminate} checked={checkAll} onChange={(e) => handleAllCheckboxChange(e)} />
        ) : null}
        <div className={styles.goodsTitle} style={calcWidth(goodsColumn)}>
          {titleRender(goodsColumn)}
        </div>
        {
          contextColumn ? <div className={styles.centextTitle} style={calcWidth(contextColumn)}>
            {titleRender(contextColumn)}
          </div> : null
        }
      </div>
      <List
        dataSource={dataSource}
        pagination={ListPaginationProps}
        renderItem={(item) => {
          let titleMessage: React.ReactNode;
          let footerMessage: React.ReactNode;
          if (title) {
            titleMessage = title(item)
          }
          if (footer) {
            footerMessage = footer(item)
          }
          const itemKey = rowKey(item)
          const CheckboxProps = rowSelection.getCheckboxProps ? rowSelection.getCheckboxProps(item) : {}
          return (
            <>
              <div className={styles.listItemWrap} key={itemKey}>
                {titleMessage}
                <List.Item key={itemKey} className={styles.listItem}>
                  {rowSelection.selection ? (
                    <Checkbox {...CheckboxProps} checked={selectedRowsKeys.includes(itemKey)} onChange={(e) => handleCheckboxChange(e, itemKey, item)} />
                  ) : null}
                  <div className={styles.goods} style={calcWidth(goodsColumn)}>
                    {item.goods.map(good => <div className={styles.goodsWraps}>{goodsRender(good)}</div>)}
                  </div>
                  {
                    contextColumn ? (
                      <div className={styles.context} style={calcWidth(contextColumn)}>
                        {contextRender(item)}
                      </div>
                    ) : null
                  }

                </List.Item>
                {footerMessage}
              </div>
            </>
          )
        }}
      />
    </div>
  )
}

export default TableList
