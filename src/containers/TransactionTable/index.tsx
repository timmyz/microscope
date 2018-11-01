import * as React from 'react'
import { LinearProgress } from '@material-ui/core'
import TableWithSelector, { TableWithSelectorProps, SelectorType } from '../../components/TableWithSelector'
import ErrorNotification from '../../components/ErrorNotification'
import Banner from '../../components/Banner'
import { fetchTransactions } from '../../utils/fetcher'
import { withConfig } from '../../contexts/config'
import { TransactionFromServer, IContainerProps } from '../../typings'
import paramsFilter from '../../utils/paramsFilter'
import hideLoader from '../../utils/hideLoader'
import { handleError, dismissError } from '../../utils/handleError'
import { rangeSelectorText } from '../../utils/searchTextGen'
import toText from '../../utils/toText'
import { fromNow } from '../../utils/timeFormatter'
import valueFormatter from '../../utils/valueFormatter'
import check, { errorMessages } from '../../utils/check'

interface AdvancedSelectors {
  selectorsValue: {
    [index: string]: number | string
  }
}

const initialState: TableWithSelectorProps &
AdvancedSelectors & {
loading: number
error: {
code: string
message: string
}
} = {
  headers: [
    { key: 'hash', text: 'hash', href: '/transaction/' },
    { key: 'from', text: 'from', href: '/account/' },
    { key: 'to', text: 'to', href: '/account/' },
    { key: 'value', text: 'value' },
    { key: 'blockNumber', text: 'height', href: '/height/' },
    { key: 'gasUsed', text: 'quota used' },
    { key: 'age', text: 'age' }
  ],
  items: [] as any[],
  count: 0,
  pageSize: 10,
  pageNo: 0,
  selectors: [
    {
      type: SelectorType.SINGLE,
      key: 'from',
      text: 'Address From',
      check: check.address,
      format: check.format0x,
      errorMessage: errorMessages.address
    },
    {
      type: SelectorType.SINGLE,
      key: 'to',
      text: 'Address To',
      check: check.address,
      format: check.format0x,
      errorMessage: errorMessages.address
    }
  ],
  selectorsValue: {
    from: '',
    to: '',
    account: ''
  },
  loading: 0,
  error: {
    code: '',
    message: ''
  }
}

interface setTransactionsCount {
  (count: string | number): undefined
}

interface TransactionTableProps extends IContainerProps {
  inset?: boolean
  showInOut?: boolean
  setTransactionsCount?: setTransactionsCount
}
type TransactionTableState = typeof initialState
class TransactionTable extends React.Component<TransactionTableProps, TransactionTableState> {
  state = initialState
  componentWillMount () {
    this.setParamsFromUrl()
    this.setVisibleHeaders()
    this.setPageSize()
  }
  componentDidMount () {
    hideLoader()
    this.fetchTransactions({
      ...this.state.selectorsValue,
      offset: this.state.pageNo * this.state.pageSize,
      limit: this.state.pageSize
    })
  }
  componentDidCatch (err) {
    this.handleError(err)
  }
  onSearch = params => {
    this.setState(state => Object.assign({}, state, { selectorsValue: params, pageNo: 0 }))
    this.fetchTransactions(params)
  }
  private setPageSize = () => {
    const { transactionPageSize: pageSize } = this.props.config.panelConfigs
    this.setState({ pageSize })
  }
  private setVisibleHeaders = () => {
    // hide invisible header
    this.setState(state => {
      const { headers } = state
      const visibleHeaders = headers.filter(
        header =>
          this.props.config.panelConfigs[`transaction${header.key[0].toUpperCase()}${header.key.slice(1)}`] !== false
      )
      return { headers: visibleHeaders }
    })
  }
  private setParamsFromUrl = () => {
    const actParams = new URLSearchParams(this.props.location.search)
    const params = {
      from: '',
      to: '',
      pageNo: '',
      account: ''
    }
    Object.keys(params).forEach(key => {
      const value = actParams.get(key)
      params[key] = value
    })
    if (this.props.match.params.account) {
      params.account = check.format0x(this.props.match.params.account)
    }

    const selectorsValue = {}
    Object.keys(this.state.selectorsValue).forEach(key => {
      selectorsValue[key] = params[key] || this.state.selectorsValue[key]
    })

    const pageNo = +params.pageNo >= 1 ? +params.pageNo - 1 : this.state.pageNo

    this.setState({
      selectorsValue,
      pageNo
    })
  }

  private fetchTransactions = (paramsInput: { [index: string]: string | number } = {}) => {
    // NOTICE: async
    // const params = {}
    const params = paramsFilter(paramsInput)
    this.setState(state => ({ loading: state.loading + 1 })) // for get transactions
    Object.keys(paramsInput).forEach(key => {
      if (key === 'from' || key === 'to') {
        params[key] = check.format0x(paramsInput[key])
      }
    })
    return fetchTransactions(params)
      .then(({ result }: { result: { transactions: TransactionFromServer[]; count: number } }) => {
        if (this.props.setTransactionsCount) this.props.setTransactionsCount(result.count)
        this.setState(state => ({
          ...state,
          loading: state.loading - 1,
          count: result.count,
          items: result.transactions.map(tx => ({
            key: tx.hash,
            blockNumber: `${+tx.blockNumber}`,
            hash: tx.hash,
            from: tx.from,
            to: toText(tx.to),
            age: `${fromNow(tx.timestamp)} ago`,
            value: valueFormatter(+tx.value),
            gasUsed: `${+tx.gasUsed}`
          }))
        }))
      })
      .catch(err => {
        this.handleError(err)
      })
  }

  private handleError = handleError(this)
  private dismissError = dismissError(this)
  private handlePageChanged = newPage => {
    const offset = newPage * this.state.pageSize
    const limit = this.state.pageSize
    console.log('offset, limit', offset, limit)
    console.log('this.state.selectorsValue', this.state.selectorsValue)
    this.fetchTransactions({
      offset,
      limit,
      ...this.state.selectorsValue
    })
      .then(() => {
        this.setState({ pageNo: newPage })
      })
      .catch(this.handleError)
  }

  public render () {
    const { headers, items, selectors, selectorsValue, count, pageSize, pageNo, loading, error } = this.state
    const { inset = false, showInOut = false } = this.props
    const activeParams = paramsFilter(selectorsValue) as any
    const searchText = rangeSelectorText('Transaction', activeParams.from, activeParams.to)
    return (
      <React.Fragment>
        {loading ? (
          <LinearProgress
            classes={{
              root: 'linearProgressRoot'
            }}
          />
        ) : null}
        {!inset ? (
          <Banner bg={`${process.env.PUBLIC}/banner/banner-Transaction.png`}>
            {searchText ? `Current Search: ${searchText}` : 'Transactions'}
          </Banner>
        ) : null}
        <TableWithSelector
          headers={headers}
          items={items}
          selectorsValue={selectorsValue}
          selectors={selectors}
          onSubmit={this.onSearch}
          count={count}
          pageSize={pageSize}
          pageNo={pageNo}
          handlePageChanged={this.handlePageChanged}
          showInout={showInOut}
          inset={inset}
          searchText={searchText}
        />
        <ErrorNotification error={error} dismissError={this.dismissError} />
      </React.Fragment>
    )
  }
}

export default withConfig(TransactionTable)
